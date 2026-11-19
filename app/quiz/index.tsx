import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen, T, Card, Progress, Button, Row, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { SECTIONS, questionsBySection } from "@/data/quiz";
import { useApp } from "@/store/app";
import { MIN_SECTIONS } from "@/lib/constants";

export default function QuizHub() {
  const { t, tr } = useT();
  const answers = useApp((s) => s.myAnswers);
  const profile = useApp((s) => s.myProfile);
  const linked = useApp((s) => !!s.couple?.user_b);
  const done = profile?.completedSections ?? [];
  const next = SECTIONS.find((s) => !done.includes(s.id));
  const total = SECTIONS.length;

  return (
    <Screen back={linked} title={linked ? t("quiz_title") : undefined}>
      {!linked && <T v="h1" style={{ marginTop: 12 }}>{t("quiz_title")}</T>}
      <T c={colors.muted}>{t("quiz_sub")}</T>
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h3">{t("quiz_progress", { done: done.length, total })}</T>
          <T c={colors.muted}>{Math.round((profile?.progress ?? 0) * 100)}%</T>
        </Row>
        <Progress value={profile?.progress ?? 0} />
      </Card>

      {SECTIONS.map((s, i) => {
        const qs = questionsBySection(s.id);
        const answered = qs.filter((q) => answers[q.id] !== undefined).length;
        const complete = answered === qs.length;
        return (
          <Card key={s.id} onPress={() => router.push(`/quiz/${s.id}`)} glow={next?.id === s.id}>
            <Row>
              <Big emoji={s.emoji} size={30} />
              <View style={{ flex: 1, gap: 2 }}>
                <T v="h3">{i + 1}. {tr(s.title)}</T>
                <T v="small" c={colors.muted}>{tr(s.subtitle)}</T>
              </View>
              <T c={complete ? colors.ok : colors.muted}>{complete ? "✓" : `${answered}/${qs.length}`}</T>
            </Row>
          </Card>
        );
      })}

      {next && <Button label={done.length ? t("quiz_continue") : t("quiz_start")} onPress={() => router.push(`/quiz/${next.id}`)} />}
      {done.length >= MIN_SECTIONS && (
        <Button kind={next ? "soft" : "primary"} label={t("quiz_see_profile")} onPress={() => router.push("/quiz/result")} />
      )}
      {!linked && done.length < MIN_SECTIONS && <T v="small" c={colors.faint} center>{t("quiz_min_note", { n: MIN_SECTIONS })}</T>}
    </Screen>
  );
}
