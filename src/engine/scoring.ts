import { QUESTIONS, SECTIONS } from "../data/quiz";
import { TRAITS, Trait, Question } from "../data/types";
import { ARCHETYPES } from "../data/extras";

export type Answers = Record<string, number | string>;
export type Traits = Record<Trait, number>;

export type Profile = {
  traits: Traits;
  archetype: string;
  attachment: "secure" | "anxious" | "avoidant" | "mixed";
  conflict: "talker" | "withdrawer" | "volatile" | "avoider" | "balanced";
  loveWant: LoveLang;
  loveShow: LoveLang;
  completedSections: string[];
  /** 0..1 how much of the quiz is done */
  progress: number;
};

export type LoveLang = "words" | "time" | "gifts" | "acts" | "touch";
const LOVE: LoveLang[] = ["words", "time", "gifts", "acts", "touch"];
const SHOW: Record<LoveLang, Trait> = { words: "sWords", time: "sTime", gifts: "sGifts", acts: "sActs", touch: "sTouch" };

function emptyTraits(): Traits {
  return Object.fromEntries(TRAITS.map((t) => [t, 0])) as Traits;
}

/** largest possible |contribution| per trait — used to normalise to -1..1 */
const MAX: Traits = (() => {
  const m = emptyTraits();
  for (const q of QUESTIONS) {
    if (q.kind === "scale" && q.w) for (const [t, w] of Object.entries(q.w)) m[t as Trait] += Math.abs(w!);
    if (q.kind === "choice" && q.options) {
      const per = emptyTraits();
      for (const o of q.options) for (const [t, w] of Object.entries(o.w ?? {})) per[t as Trait] = Math.max(per[t as Trait], Math.abs(w!));
      for (const t of TRAITS) m[t] += per[t];
    }
  }
  return m;
})();

function contribution(q: Question, a: number | string | undefined, out: Traits) {
  if (a === undefined) return;
  if (q.kind === "scale" && typeof a === "number" && q.w) {
    const k = (a - 3) / 2; // -1..1
    for (const [t, w] of Object.entries(q.w)) out[t as Trait] += k * w!;
  }
  if (q.kind === "choice" && typeof a === "string") {
    const opt = q.options?.find((o) => o.id === a);
    for (const [t, w] of Object.entries(opt?.w ?? {})) out[t as Trait] += w!;
  }
}

export function scoreTraits(answers: Answers): Traits {
  const raw = emptyTraits();
  for (const q of QUESTIONS) contribution(q, answers[q.id], raw);
  const out = emptyTraits();
  for (const t of TRAITS) out[t] = MAX[t] ? Math.max(-1, Math.min(1, raw[t] / (MAX[t] * 0.6))) : 0;
  return out;
}

function topOf<T extends string>(keys: T[], val: (k: T) => number): T {
  return keys.reduce((best, k) => (val(k) > val(best) ? k : best), keys[0]);
}

export function buildProfile(answers: Answers): Profile {
  const tr = scoreTraits(answers);
  const completedSections = SECTIONS.filter((s) => QUESTIONS.filter((q) => q.section === s.id).every((q) => answers[q.id] !== undefined)).map((s) => s.id);
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;

  const attachment: Profile["attachment"] =
    tr.anxious > 0.3 && tr.avoidant > 0.3 ? "mixed" : tr.anxious > 0.3 ? "anxious" : tr.avoidant > 0.3 ? "avoidant" : "secure";

  const conflict: Profile["conflict"] =
    tr.heat > 0.35 ? "volatile"
    : tr.pursue > 0.3 && tr.pursue >= tr.withdraw ? "talker"
    : tr.withdraw > 0.3 && tr.direct < 0 ? "avoider"
    : tr.withdraw > 0.3 ? "withdrawer"
    : "balanced";

  const loveWant = topOf(LOVE, (k) => tr[k]);
  const loveShow = topOf(LOVE, (k) => tr[SHOW[k]]);

  const scores: Record<string, number> = {
    fire: tr.heat + tr.repairFast * 0.5,
    slow_burner: tr.avoidant + tr.withdraw * 0.6,
    deep_feeler: tr.anxious + tr.words * 0.4,
    free_spirit: tr.space + tr.adventure * 0.3,
    quiet_protector: (tr.acts + tr.sActs) * 0.6 - tr.direct * 0.2,
    spark: tr.social * 0.8 + tr.adventure * 0.5,
    romantic: tr.romance * 0.75 + tr.words * 0.15 + tr.touch * 0.15,
    open_book: tr.direct - tr.anxious * 0.3,
    anchor: 0.3 - Math.max(0, tr.anxious) * 0.6 - Math.max(0, tr.avoidant) * 0.6 - Math.max(0, tr.heat) * 0.4 + Math.max(0, -tr.anxious) * 0.3 + Math.max(0, -tr.avoidant) * 0.3 + tr.repairFast * 0.2,
  };
  const archetype = topOf(Object.keys(scores), (k) => scores[k]);
  return { traits: tr, archetype: ARCHETYPES[archetype] ? archetype : "anchor", attachment, conflict, loveWant, loveShow, completedSections, progress: answered / QUESTIONS.length };
}
