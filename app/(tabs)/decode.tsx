import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen, T, Card, GradientCard, Row, Section, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { SITUATIONS } from "@/data/situations";
import { useApp, partnerName, myGender, partnerGender } from "@/store/app";

export default function DecodeTab() {
  const { t } = useT();
  const pAns = useApp((s) => s.partnerAnswers);
  const pProfile = useApp((s) => s.partnerProfile);
  const name = partnerName();
  const me = myGender(), them = partnerGender();

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 8 }}>{t("decode_title", { name })}</T>
      <T c={colors.muted}>{t("decode_sub", { name })}</T>

      {!pProfile && (
        <Card glow>
          <T v="h3">⏳ {t("partner_quiz_pending", { name })}</T>
          <T c={colors.muted}>{t("partner_quiz_pending_body")}</T>
        </Card>
      )}

      <GradientCard onPress={() => router.push("/match")}>
        <Row>
          <Big emoji="💘" size={36} />
          <View style={{ flex: 1 }}>
            <T v="h3">{t("match_report")}</T>
            <T v="small" c={colors.muted}>{t("match_report_sub", { name })}</T>
          </View>
          <T v="h3">›</T>
        </Row>
      </GradientCard>

      <Row>
        <Card onPress={() => router.push("/partner")} style={{ flex: 1 }}>
          <T v="h2">🪪</T>
          <T v="h3">{t("their_profile", { name })}</T>
        </Card>
        <Card onPress={() => router.push("/translate")} style={{ flex: 1 }}>
          <T v="h2">🗣️</T>
          <T v="h3">{t("translate_feelings")}</T>
        </Card>
      </Row>

      <Section title={t("what_does_it_mean")} />
      {SITUATIONS.map((s) => {
        const answered = pAns[s.meaningQ] !== undefined || pAns[s.wantQ] !== undefined;
        return (
          <Card key={s.id} onPress={() => router.push(`/decode/${s.id}`)} style={{ paddingVertical: 14 }}>
            <Row>
              <T v="h2">{s.emoji}</T>
              <T v="h3" style={{ flex: 1 }}>{trg(s.title, me, them, { name })}</T>
              <T c={answered ? colors.ok : colors.faint}>{answered ? "›" : "…"}</T>
            </Row>
          </Card>
        );
      })}

      <Card onPress={() => router.push("/settings/decoder-notes")}>
        <T v="h3">✍️ {t("my_notes_title")}</T>
        <T v="small" c={colors.muted}>{t("my_notes_sub", { name })}</T>
      </Card>
    </Screen>
  );
}
