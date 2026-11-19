import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Screen, T, Card, Input, Button, Section, GradientCard, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { supabase, today } from "@/lib/supabase";
import { DAILY } from "@/data/daily";
import { useApp, answerDaily, todaysQuestion, partnerName, myGender, partnerGender, coupleId } from "@/store/app";

type Row = { user_id: string; day: string; question_idx: number; answer: string };

export default function Daily() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const answered = useApp((s) => s.dailyAnsweredToday);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const { q } = todaysQuestion();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [partnerDone, setPartnerDone] = useState(false);

  async function load() {
    const c = coupleId();
    if (!c) return;
    const [{ data }, { data: pd }] = await Promise.all([
      supabase.from("daily_answers").select("user_id, day, question_idx, answer").eq("couple_id", c).order("day", { ascending: false }).limit(60),
      supabase.rpc("partner_answered", { d: today() }),
    ]);
    setRows((data ?? []) as Row[]);
    setPartnerDone(!!pd);
  }
  useEffect(() => { load(); }, [answered]);

  async function submit() {
    setBusy(true);
    try { await answerDaily(text); haptic("success"); setText(""); } catch {}
    setBusy(false);
  }

  const todayRows = rows.filter((r) => r.day === today());
  const mine = todayRows.find((r) => r.user_id === uid);
  const theirs = todayRows.find((r) => r.user_id !== uid);
  const past = Array.from(new Set(rows.filter((r) => r.day !== today()).map((r) => r.day))).slice(0, 30);

  return (
    <Screen back title={t("todays_question")}>
      <GradientCard>
        <T v="h2">{trg(q, me, them)}</T>
      </GradientCard>

      {!answered ? (
        <>
          <Input multiline value={text} onChangeText={setText} placeholder={t("daily_ph")} maxLength={500} />
          <T v="small" c={colors.muted}>{partnerDone ? `🔒 ${t("daily_partner_done", { name })}` : t("daily_reveal_rule", { name })}</T>
          <Button label={t("answer")} disabled={text.trim().length < 1} loading={busy} onPress={submit} />
        </>
      ) : (
        <>
          <Card>
            <T v="tiny" c={colors.muted}>{t("you").toUpperCase()}</T>
            <T v="h3">{mine?.answer}</T>
          </Card>
          <Card glow={!!theirs}>
            <T v="tiny" c={colors.love}>{name.toUpperCase()}</T>
            {theirs ? <T v="h3">{theirs.answer}</T> : <T c={colors.muted}>{t("daily_waiting", { name })}</T>}
          </Card>
        </>
      )}

      {past.length > 0 && <Section title={t("past_answers")} />}
      {past.map((day) => {
        const r = rows.filter((x) => x.day === day);
        const idx = r[0]?.question_idx ?? 0;
        const m = r.find((x) => x.user_id === uid);
        const p = r.find((x) => x.user_id !== uid);
        return (
          <Card key={day}>
            <T v="tiny" c={colors.faint}>{day}</T>
            <T v="h3">{trg(DAILY[idx], me, them)}</T>
            <View style={{ gap: 4 }}>
              {m && <T c={colors.muted}>{t("you")}: {m.answer}</T>}
              {p && <T c={colors.muted}>{name}: {p.answer}</T>}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
