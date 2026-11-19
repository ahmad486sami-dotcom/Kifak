import React, { useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, T, Option, Progress, Button, Row, haptic } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { SECTIONS, questionsBySection, SCALE_LABELS } from "@/data/quiz";
import type { SectionId } from "@/data/types";
import { useApp, saveAnswer, savePersonality, myGender, partnerGender } from "@/store/app";
import { MIN_SECTIONS } from "@/lib/constants";

export default function QuizSection() {
  const { t, tr } = useT();
  const { section } = useLocalSearchParams<{ section: SectionId }>();
  const meta = SECTIONS.find((s) => s.id === section)!;
  const qs = useMemo(() => questionsBySection(section), [section]);
  const answers = useApp((s) => s.myAnswers);
  const firstOpen = Math.max(0, qs.findIndex((q) => answers[q.id] === undefined));
  const [i, setI] = useState(firstOpen === -1 ? 0 : firstOpen);
  const q = qs[i];
  const me = myGender(), them = partnerGender();
  const value = answers[q.id];

  async function finish() {
    await savePersonality();
    haptic("success");
    const doneCount = useApp.getState().myProfile?.completedSections.length ?? 0;
    const nextSection = SECTIONS.find((s) => !useApp.getState().myProfile?.completedSections.includes(s.id));
    if (doneCount === MIN_SECTIONS || !nextSection) router.replace("/quiz/result");
    else router.replace("/quiz");
  }

  async function choose(v: number | string) {
    await saveAnswer(q.id, v);
    setTimeout(() => (i < qs.length - 1 ? setI(i + 1) : finish()), 180);
  }

  return (
    <Screen back title={`${meta.emoji} ${tr(meta.title)}`}>
      <Row style={{ justifyContent: "space-between" }}>
        <T v="small" c={colors.muted}>{t("question_x_of_y", { x: i + 1, y: qs.length })}</T>
        {i > 0 && <Pressable onPress={() => setI(i - 1)} hitSlop={10}><T v="small" c={colors.accent}>{t("previous")}</T></Pressable>}
      </Row>
      <Progress value={(i + (value !== undefined ? 1 : 0)) / qs.length} />
      <T v="h2" style={{ marginVertical: 14 }}>{trg(q.text, me, them)}</T>

      {q.kind === "scale" ? (
        <View style={{ gap: 10 }}>
          {SCALE_LABELS.map((l, idx) => {
            const v = idx + 1;
            const sel = value === v;
            return (
              <Pressable key={v} onPress={() => { haptic(); choose(v); }}
                style={{ padding: 16, borderRadius: radius.md, borderWidth: 1.5, borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.accent + "1F" : colors.card, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 14 + idx * 4, height: 14 + idx * 4, borderRadius: 99, backgroundColor: sel ? colors.accent : colors.card2, borderWidth: 1, borderColor: colors.border }} />
                <T>{tr(l)}</T>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {q.options!.map((o) => (
            <Option key={o.id} emoji={o.emoji} label={trg(o.label, me, them)} selected={value === o.id} onPress={() => choose(o.id)} />
          ))}
        </View>
      )}

      {q.decodes && <T v="small" c={colors.faint} style={{ marginTop: 8 }}>🔓 {t("quiz_decoder_hint")}</T>}
      {value !== undefined && i === qs.length - 1 && <Button label={t("done")} onPress={finish} style={{ marginTop: 10 }} />}
    </Screen>
  );
}
