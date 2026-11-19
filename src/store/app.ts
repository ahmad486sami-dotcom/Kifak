import { create } from "zustand";
import * as Localization from "expo-localization";
import type { Session } from "@supabase/supabase-js";
import { supabase, today } from "../lib/supabase";
import { buildProfile, Profile, Answers } from "../engine/scoring";
import { DAILY, dailyIndex } from "../data/daily";
import { MOODS } from "../data/extras";
import { syncWidget } from "../lib/widget";
import { hasLocalEntitlement } from "../lib/billing";
import { notifyPartner } from "../lib/notifications";
import { useLang, trg, Gender, setGenders } from "../i18n";

export type ProfileRow = { id: string; name: string; gender: Gender; lang: "en" | "ar"; avatar_path: string | null; premium_until: string | null };
export type CoupleRow = { id: string; user_a: string; user_b: string | null; invite_code: string; together_since: string | null; seed: number; linked_at: string | null };
export type Streak = { current: number; best: number; started_by_me: number; started_by_partner: number; both_days: number; today_me: boolean; today_partner: boolean; today: string };
export type MoodRow = { id: number; user_id: string; mood: string; note: string | null; created_at: string };
export type EventRow = { id: string; title: string; starts_at: string; kind: string; plan: any; repeats_yearly: boolean };

type State = {
  ready: boolean;
  session: Session | null;
  me: ProfileRow | null;
  partner: ProfileRow | null;
  couple: CoupleRow | null;
  myAnswers: Answers;
  partnerAnswers: Answers;
  myProfile: Profile | null;
  partnerProfile: Profile | null;
  partnerNotes: Record<string, string>;
  myNotes: Record<string, string>;
  access: boolean;
  streak: Streak | null;
  myMood: MoodRow | null;
  partnerMood: MoodRow | null;
  nextEvent: EventRow | null;
  dailyAnsweredToday: boolean;
  unreadNotes: number;
};

const initial: State = {
  ready: false, session: null, me: null, partner: null, couple: null,
  myAnswers: {}, partnerAnswers: {}, myProfile: null, partnerProfile: null,
  partnerNotes: {}, myNotes: {}, access: false, streak: null, myMood: null, partnerMood: null,
  nextEvent: null, dailyAnsweredToday: false, unreadNotes: 0,
};

export const useApp = create<State>(() => initial);
const set = useApp.setState;
const get = useApp.getState;

export const isLinked = () => !!get().couple?.user_b;
export const coupleId = () => get().couple?.id ?? null;
export const myGender = (): Gender => get().me?.gender ?? "m";
export const partnerGender = (): Gender => get().partner?.gender ?? (myGender() === "m" ? "f" : "m");
export const partnerName = () => get().partner?.name || (useLang.getState().lang === "ar" ? "شريكك" : "your partner");

function toAnswers(rows: { question_id: string; value: any }[] | null): Answers {
  const a: Answers = {};
  for (const r of rows ?? []) a[r.question_id] = r.value;
  return a;
}

export async function loadAll() {
  const { data: s } = await supabase.auth.getSession();
  const session = s.session;
  if (!session) {
    set({ ...initial, ready: true });
    return;
  }
  const uid = session.user.id;
  const [{ data: me }, { data: myAns }, { data: myNotes }, { data: couples }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("answers").select("question_id, value").eq("user_id", uid),
    supabase.from("decoder_notes").select("situation_id, note").eq("user_id", uid),
    supabase.from("couples").select("*").or(`user_a.eq.${uid},user_b.eq.${uid}`).order("linked_at", { ascending: false, nullsFirst: false }),
  ]);
  const couple = ((couples ?? []).find((c: any) => c.user_b) ?? (couples ?? [])[0] ?? null) as CoupleRow | null;
  const myAnswers = toAnswers(myAns);
  set({
    session,
    me: me as ProfileRow,
    couple,
    myAnswers,
    myProfile: Object.keys(myAnswers).length ? buildProfile(myAnswers) : null,
    myNotes: Object.fromEntries((myNotes ?? []).map((n: any) => [n.situation_id, n.note])),
  });

  // keep timezone fresh for streak days
  const tz = Localization.getCalendars()[0]?.timeZone;
  if (tz && me && (me as any).tz !== tz) supabase.from("profiles").update({ tz }).eq("id", uid).then(() => {});

  setGenders(myGender(), partnerGender());
  await Promise.all([refreshAccess(), couple?.user_b ? loadPartner() : Promise.resolve()]);
  setGenders(myGender(), partnerGender());
  set({ ready: true });
  pushWidget();
}

/** Sideloaded test builds (GitHub → ESign) can't buy from the store, so they skip the paywall. */
const TEST_UNLOCK = process.env.EXPO_PUBLIC_TEST_UNLOCK === "1";

export async function refreshAccess() {
  if (TEST_UNLOCK) return set({ access: true });
  const [{ data }, local] = await Promise.all([supabase.rpc("has_access"), hasLocalEntitlement()]);
  set({ access: !!data || local });
}

export async function loadPartner() {
  const c = get().couple;
  const uid = get().session?.user.id;
  if (!c?.user_b || !uid) return;
  const pid = c.user_a === uid ? c.user_b : c.user_a;
  const day = today();
  const [{ data: partner }, { data: pAns }, { data: pNotes }, { data: streak }, { data: moods }, { data: ev }, { data: myDaily }, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", pid).single(),
    supabase.from("answers").select("question_id, value").eq("user_id", pid),
    supabase.from("decoder_notes").select("situation_id, note").eq("user_id", pid),
    supabase.rpc("couple_streak"),
    supabase.from("moods").select("*").eq("couple_id", c.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("events").select("*").eq("couple_id", c.id).gte("starts_at", new Date().toISOString()).order("starts_at").limit(1),
    supabase.from("daily_answers").select("day").eq("couple_id", c.id).eq("user_id", uid).eq("day", day),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("couple_id", c.id).neq("from_id", uid).is("opened_at", null),
  ]);
  const partnerAnswers = toAnswers(pAns);
  const ms = (moods ?? []) as MoodRow[];
  set({
    partner: partner as ProfileRow,
    partnerAnswers,
    partnerProfile: Object.keys(partnerAnswers).length ? buildProfile(partnerAnswers) : null,
    partnerNotes: Object.fromEntries((pNotes ?? []).map((n: any) => [n.situation_id, n.note])),
    streak: streak as Streak,
    myMood: ms.find((m) => m.user_id === uid) ?? null,
    partnerMood: ms.find((m) => m.user_id === pid) ?? null,
    nextEvent: ((ev ?? [])[0] as EventRow) ?? null,
    dailyAnsweredToday: (myDaily ?? []).length > 0,
    unreadNotes: count ?? 0,
  });
}

export async function refreshStreak() {
  const { data } = await supabase.rpc("couple_streak");
  if (data) set({ streak: data as Streak });
  pushWidget();
}

// ───────────── Quiz ─────────────
export async function saveAnswer(questionId: string, value: number | string) {
  const uid = get().session?.user.id;
  if (!uid) return;
  const myAnswers = { ...get().myAnswers, [questionId]: value };
  set({ myAnswers });
  await supabase.from("answers").upsert({ user_id: uid, question_id: questionId, value, updated_at: new Date().toISOString() });
}

export async function savePersonality() {
  const uid = get().session?.user.id;
  if (!uid) return;
  const p = buildProfile(get().myAnswers);
  set({ myProfile: p });
  await supabase.from("personality").upsert({
    user_id: uid, traits: p.traits, archetype: p.archetype, love_want: p.loveWant, love_show: p.loveShow,
    attachment: p.attachment, conflict: p.conflict, progress: p.progress, updated_at: new Date().toISOString(),
  });
}

export async function saveDecoderNote(situationId: string, note: string) {
  const uid = get().session?.user.id;
  if (!uid) return;
  const clean = note.trim().slice(0, 280);
  set({ myNotes: { ...get().myNotes, [situationId]: clean } });
  if (!clean) await supabase.from("decoder_notes").delete().eq("user_id", uid).eq("situation_id", situationId);
  else await supabase.from("decoder_notes").upsert({ user_id: uid, situation_id: situationId, note: clean });
}

// ───────────── Daily actions ─────────────
export async function setMood(mood: string, note?: string) {
  const c = coupleId(); const uid = get().session?.user.id;
  if (!c || !uid) return;
  const { data } = await supabase.from("moods").insert({ couple_id: c, user_id: uid, mood, note: note?.slice(0, 120) || null }).select().single();
  set({ myMood: data as MoodRow });
  const m = MOODS.find((x) => x.id === mood);
  notifyPartner("mood", m ? `${m.emoji} ${trg(m.label, myGender(), partnerGender())}` : undefined);
  refreshStreak();
}

export async function sendTap(tapId: string, text: string) {
  const c = coupleId(); const uid = get().session?.user.id;
  if (!c || !uid) return;
  await supabase.from("notes").insert({ couple_id: c, from_id: uid, kind: "tap", body: tapId });
  notifyPartner("tap", text);
  refreshStreak();
}

export async function sendNote(body: string, audioPath?: string) {
  const c = coupleId(); const uid = get().session?.user.id;
  if (!c || !uid) return;
  await supabase.from("notes").insert({ couple_id: c, from_id: uid, kind: audioPath ? "voice" : "text", body: body.slice(0, 1000) || null, audio_path: audioPath ?? null });
  notifyPartner("note");
  refreshStreak();
}

export function todaysQuestion() {
  const c = get().couple;
  const idx = dailyIndex(today(), c?.seed ?? 0);
  return { idx, q: DAILY[idx] };
}

export async function answerDaily(answer: string) {
  const c = coupleId(); const uid = get().session?.user.id;
  if (!c || !uid) return;
  const { idx } = todaysQuestion();
  const { error } = await supabase.from("daily_answers").insert({ couple_id: c, user_id: uid, day: today(), question_idx: idx, answer: answer.trim().slice(0, 500) });
  if (error) throw error;
  set({ dailyAnsweredToday: true });
  notifyPartner("daily");
  refreshStreak();
}

// ───────────── Widget ─────────────
export function pushWidget() {
  const s = get();
  const lang = useLang.getState().lang;
  const st = s.streak;
  const whoseTurn = !st ? "none" : st.today_me && st.today_partner ? "both" : st.today_me ? "partner" : "you";
  const mood = MOODS.find((m) => m.id === s.partnerMood?.mood);
  syncWidget({
    streak: st?.current ?? 0,
    todayDone: !!(st?.today_me || st?.today_partner),
    whoseTurn,
    partnerName: s.partner?.name ?? "",
    partnerMood: mood?.emoji ?? "",
    partnerMoodLabel: mood ? trg(mood.label, partnerGender(), myGender()) : "",
    question: trg(todaysQuestion().q, myGender(), partnerGender()),
    answeredToday: s.dailyAnsweredToday,
    countdownTitle: s.nextEvent?.title ?? "",
    countdownDate: s.nextEvent?.starts_at ?? "",
    togetherSince: s.couple?.together_since ?? "",
    lang,
  });
}

// ───────────── Realtime ─────────────
let channel: ReturnType<typeof supabase.channel> | null = null;
export function subscribeRealtime() {
  const c = coupleId();
  if (!c || channel) return;
  const reload = () => loadPartner().then(pushWidget);
  channel = supabase
    .channel(`couple:${c}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "moods", filter: `couple_id=eq.${c}` }, reload)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notes", filter: `couple_id=eq.${c}` }, reload)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "daily_answers", filter: `couple_id=eq.${c}` }, reload)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity", filter: `couple_id=eq.${c}` }, () => refreshStreak())
    .on("postgres_changes", { event: "*", schema: "public", table: "couples", filter: `id=eq.${c}` }, () => loadAll())
    .subscribe();
}
export function unsubscribeRealtime() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
}

export async function signOut() {
  unsubscribeRealtime();
  await supabase.auth.signOut();
  set({ ...initial, ready: true });
}
