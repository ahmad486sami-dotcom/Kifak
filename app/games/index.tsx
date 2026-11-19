import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen, T, Card, GradientCard, Option, Button, Row, Empty, haptic, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { QUESTIONS } from "@/data/quiz";
import { supabase } from "@/lib/supabase";
import { useApp, coupleId, partnerName, myGender, partnerGender } from "@/store/app";

const ROUND = 10;

export default function KnowMe() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const pAns = useApp((s) => s.partnerAnswers);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const pool = useMemo(() => QUESTIONS.filter((q) => q.kind === "choice" && typeof pAns[q.id] === "string"), [pAns]);
  const [round, setRound] = useState<typeof pool>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState<{ mine: [number, number]; theirs: [number, number] }>({ mine: [0, 0], theirs: [0, 0] });

  useFocusEffect(useCallback(() => {
    supabase.from("game_rounds").select("guesser_id, correct").eq("couple_id", coupleId()).then(({ data }) => {
      const m = (data ?? []).filter((r: any) => r.guesser_id === uid), p = (data ?? []).filter((r: any) => r.guesser_id !== uid);
      setStats({ mine: [m.filter((r: any) => r.correct).length, m.length], theirs: [p.filter((r: any) => r.correct).length, p.length] });
    });
  }, [round.length === 0]));

  function start() {
    setRound([...pool].sort(() => Math.random() - 0.5).slice(0, ROUND));
    setI(0); setScore(0); setPicked(null);
  }

  async function guess(optId: string) {
    if (picked) return;
    const q = round[i];
    const correct = pAns[q.id] === optId;
    setPicked(optId);
    haptic(correct ? "success" : "light");
    if (correct) setScore((s) => s + 1);
    supabase.from("game_rounds").insert({ couple_id: coupleId(), guesser_id: uid, question_id: q.id, guess: optId, correct }).then(() => {});
  }

  const pct = (a: [number, number]) => (a[1] ? Math.round((a[0] / a[1]) * 100) : 0);

  if (pool.length < 5) {
    return <Screen back title={t("games")}><Empty emoji="🎲" title={t("game_need_quiz", { name })} body={t("partner_quiz_pending_body")} /></Screen>;
  }

  if (!round.length || i >= round.length) {
    const finished = round.length > 0 && i >= round.length;
    return (
      <Screen back title={t("games")}>
        <GradientCard style={{ alignItems: "center", paddingVertical: 26 }}>
          <Big emoji="🎲" size={56} />
          <T v="h1" center>{t("know_me_title", { name })}</T>
          <T c={colors.muted} center>{t("know_me_sub", { name })}</T>
          {finished && <T v="h2" c={colors.accent2}>{t("you_scored", { score, total: round.length })}</T>}
        </GradientCard>
        <Row>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <T v="h1">{pct(stats.mine)}%</T>
            <T v="small" c={colors.muted} center>{t("you_know_them", { name })}</T>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <T v="h1">{pct(stats.theirs)}%</T>
            <T v="small" c={colors.muted} center>{t("they_know_you", { name })}</T>
          </Card>
        </Row>
        <Button label={finished ? t("play_again") : t("start_game")} onPress={start} />
      </Screen>
    );
  }

  const q = round[i];
  const correctId = pAns[q.id];
  return (
    <Screen back title={`${i + 1}/${round.length}`}>
      <T v="tiny" c={colors.muted}>{t("guess_how_name_answered", { name }).toUpperCase()}</T>
      <T v="h2">“{trg(q.text, them, me)}”</T>
      <View style={{ gap: 10 }}>
        {q.options!.map((o) => (
          <View key={o.id} style={{ opacity: picked && o.id !== correctId && o.id !== picked ? 0.4 : 1 }}>
            <Option emoji={picked ? (o.id === correctId ? "✅" : o.id === picked ? "❌" : o.emoji) : o.emoji} label={trg(o.label, them, me)} selected={picked === o.id} onPress={() => guess(o.id)} />
          </View>
        ))}
      </View>
      {picked && <Button label={i === round.length - 1 ? t("see_score") : t("next")} onPress={() => { setPicked(null); setI(i + 1); }} />}
    </Screen>
  );
}
