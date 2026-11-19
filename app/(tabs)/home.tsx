import React, { useCallback, useState } from "react";
import { View, Pressable, RefreshControl, ScrollView, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { T, Card, GradientCard, Row, Button, Section, haptic, Big } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { MOODS, TAPS } from "@/data/extras";
import { supabase } from "@/lib/supabase";
import {
  useApp, loadPartner, setMood, sendTap, todaysQuestion, myGender, partnerGender, partnerName, refreshStreak, pushWidget,
} from "@/store/app";

const MOOD_TO_SITUATION: Record<string, string> = { stressed: "stressed", low: "sad", space: "alone_time", tired: "short_answers" };

function daysBetween(from: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(from + "T00:00:00").getTime()) / 86400000));
}
function timeAgo(iso: string, lang: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return lang === "ar" ? "هلق" : "just now";
  if (m < 60) return lang === "ar" ? `من ${m} دقيقة` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "ar" ? `من ${h} ساعة` : `${h}h ago`;
  return lang === "ar" ? `من ${Math.floor(h / 24)} يوم` : `${Math.floor(h / 24)}d ago`;
}

export default function Home() {
  const { t, lang } = useT();
  const s = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [sentTap, setSentTap] = useState<string | null>(null);
  const me = myGender(), them = partnerGender();
  const name = partnerName();
  const st = s.streak;
  const { q } = todaysQuestion();
  const pMood = MOODS.find((m) => m.id === s.partnerMood?.mood);
  const myMood = MOODS.find((m) => m.id === s.myMood?.mood);

  useFocusEffect(useCallback(() => { loadPartner().then(pushWidget); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadPartner(); pushWidget(); setRefreshing(false); };

  const turn = !st ? "" : st.today_me && st.today_partner ? t("streak_both") : st.today_me ? t("streak_waiting", { name }) : st.today_partner ? t("streak_your_move", { name }) : t("streak_start");

  async function saveStreak() {
    const { data } = await supabase.rpc("save_streak");
    if (data) { haptic("success"); refreshStreak(); Alert.alert("🔥", t("streak_saved")); }
    else Alert.alert(t("streak_save_used"));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <T v="h1">{t("hi_name", { name: s.me?.name ?? "" })}</T>
            {s.couple?.together_since ? (
              <T c={colors.muted}>💞 {t("days_together", { n: daysBetween(s.couple.together_since) })}</T>
            ) : <T c={colors.muted}>{t("home_sub", { name })}</T>}
          </View>
          <Pressable onPress={() => router.push("/notes")} style={{ padding: 6 }}>
            <T v="h2">💌</T>
            {s.unreadNotes > 0 && (
              <View style={{ position: "absolute", top: 0, right: 0, backgroundColor: colors.love, borderRadius: 99, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
                <T v="tiny">{s.unreadNotes}</T>
              </View>
            )}
          </Pressable>
        </Row>

        {!s.access && (
          <Card onPress={() => router.push("/paywall")} glow>
            <T v="h3">🔒 {t("access_ended_title")}</T>
            <T c={colors.muted}>{t("access_ended_body")}</T>
          </Card>
        )}

        {/* Streak */}
        <GradientCard>
          <Row style={{ justifyContent: "space-between" }}>
            <Row gap={8}>
              <T v="h1" style={{ fontSize: 40 }}>🔥 {st?.current ?? 0}</T>
              <T c={colors.muted}>{t("day_streak")}</T>
            </Row>
            <T v="small" c={colors.muted}>{t("best_x", { n: st?.best ?? 0 })}</T>
          </Row>
          <T>{turn}</T>
          <Row style={{ marginTop: 4 }}>
            <T v="small" c={colors.muted}>{t("started_by_you", { n: st?.started_by_me ?? 0 })}</T>
            <T v="small" c={colors.faint}>·</T>
            <T v="small" c={colors.muted}>{t("started_by_them", { name, n: st?.started_by_partner ?? 0 })}</T>
          </Row>
          {st && st.current === 0 && st.best > 1 && (
            <Button kind="soft" label={t("save_streak")} onPress={saveStreak} style={{ marginTop: 6 }} />
          )}
        </GradientCard>

        {/* Partner mood */}
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <T v="tiny" c={colors.muted}>{t("partner_mood", { name }).toUpperCase()}</T>
            {s.partnerMood && <T v="small" c={colors.faint}>{timeAgo(s.partnerMood.created_at, lang)}</T>}
          </Row>
          {pMood ? (
            <Card onPress={() => (MOOD_TO_SITUATION[pMood.id] ? router.push(`/decode/${MOOD_TO_SITUATION[pMood.id]}`) : router.push("/notes/new"))} style={{ backgroundColor: colors.card2, padding: 12 }}>
              <Row>
                <Big emoji={pMood.emoji} size={34} />
                <View style={{ flex: 1 }}>
                  <T v="h3">{trg(pMood.label, them, me)}</T>
                  {s.partnerMood?.note ? <T c={colors.muted}>"{s.partnerMood.note}"</T> : null}
                  <T v="small" c={colors.accent}>{MOOD_TO_SITUATION[pMood.id] ? t("what_to_do") : t("send_something")} →</T>
                </View>
              </Row>
            </Card>
          ) : <T c={colors.muted}>{t("no_mood_yet", { name })}</T>}
          <T v="tiny" c={colors.muted} style={{ marginTop: 6 }}>{t("your_mood").toUpperCase()} {myMood ? `· ${myMood.emoji}` : ""}</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MOODS.map((m) => (
              <Pressable key={m.id} onPress={() => { haptic(); setMood(m.id); }}
                style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: s.myMood?.mood === m.id ? colors.accent + "33" : colors.card2, alignItems: "center", minWidth: 74 }}>
                <T v="h2">{m.emoji}</T>
                <T v="tiny" c={colors.muted} lines={1}>{trg(m.label, me, them)}</T>
              </Pressable>
            ))}
          </ScrollView>
        </Card>

        {/* Daily question */}
        <Card onPress={() => router.push("/daily")} glow={!s.dailyAnsweredToday}>
          <T v="tiny" c={colors.accent}>{t("todays_question").toUpperCase()}</T>
          <T v="h3">{trg(q, me, them)}</T>
          <T v="small" c={colors.muted}>{s.dailyAnsweredToday ? t("daily_see_answers") : t("daily_answer_cta")}</T>
        </Card>

        {/* Taps */}
        <Section title={t("send_a_feeling")} />
        <Row wrap gap={8}>
          {TAPS.map((tp) => (
            <Pressable key={tp.id} onPress={() => { haptic("medium"); sendTap(tp.id, `${tp.emoji} ${trg(tp.label, me, them)}`); setSentTap(tp.id); setTimeout(() => setSentTap(null), 1500); }}
              style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 99, backgroundColor: sentTap === tp.id ? colors.love + "44" : colors.card, borderWidth: 1, borderColor: colors.border }}>
              <T v="small">{sentTap === tp.id ? `✓ ${t("sent")}` : `${tp.emoji} ${trg(tp.label, me, them)}`}</T>
            </Pressable>
          ))}
        </Row>
        <Row>
          <Button kind="soft" icon="✍️" label={t("write_note")} onPress={() => router.push("/notes/new")} style={{ flex: 1 }} />
          <Button kind="soft" icon="🎙️" label={t("voice_note")} onPress={() => router.push({ pathname: "/notes/new", params: { voice: "1" } })} style={{ flex: 1 }} />
        </Row>

        {/* Countdown */}
        {s.nextEvent && (
          <Card onPress={() => router.push("/plan")}>
            <T v="tiny" c={colors.muted}>{t("next_up").toUpperCase()}</T>
            <Row style={{ justifyContent: "space-between" }}>
              <T v="h3" style={{ flex: 1 }}>{s.nextEvent.title}</T>
              <T v="h2" c={colors.accent2}>{t("in_days", { n: Math.max(0, Math.ceil((new Date(s.nextEvent.starts_at).getTime() - Date.now()) / 86400000)) })}</T>
            </Row>
          </Card>
        )}

        {/* Tools */}
        <Section title={t("tools")} />
        <Row wrap gap={10}>
          {[
            { e: "🕊️", l: t("conflict_mode"), to: "/conflict" },
            { e: "🗣️", l: t("translate_feelings"), to: "/translate" },
            { e: "🎲", l: t("games"), to: "/games" },
            { e: "🏆", l: t("challenges"), to: "/challenges" },
          ].map((x) => (
            <Card key={x.to} onPress={() => router.push(x.to as any)} style={{ width: 160, flexGrow: 1, alignItems: "flex-start" }}>
              <T v="h2">{x.e}</T>
              <T v="h3">{x.l}</T>
            </Card>
          ))}
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}
