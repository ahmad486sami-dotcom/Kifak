import React from "react";
import { router } from "expo-router";
import { Screen, T, Card, Row, Button, Section, Progress } from "@/components/ui";
import { ProfileCard } from "@/components/ProfileCard";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { useApp, partnerName } from "@/store/app";

export default function MeTab() {
  const { t } = useT();
  const p = useApp((s) => s.myProfile);
  const me = useApp((s) => s.me);
  const name = partnerName();

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between", marginTop: 8 }}>
        <T v="h1">{me?.name}</T>
        <Button kind="ghost" label="⚙️" onPress={() => router.push("/settings")} />
      </Row>
      {p && <ProfileCard p={p} self />}
      <Card onPress={() => router.push("/quiz")}>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h3">🧠 {t("my_quiz")}</T>
          <T c={colors.muted}>{Math.round((p?.progress ?? 0) * 100)}%</T>
        </Row>
        <Progress value={p?.progress ?? 0} />
        <T v="small" c={colors.muted}>{(p?.progress ?? 0) < 1 ? t("finish_quiz_hint", { name }) : t("retake_hint")}</T>
      </Card>
      <Card onPress={() => router.push("/quiz/result")}>
        <T v="h3">📊 {t("my_full_profile")}</T>
      </Card>
      <Card onPress={() => router.push("/settings/decoder-notes")}>
        <T v="h3">✍️ {t("my_notes_title")}</T>
        <T v="small" c={colors.muted}>{t("my_notes_sub", { name })}</T>
      </Card>
      <Section title={t("account")} />
      <Card onPress={() => router.push("/settings")}>
        <T v="h3">⚙️ {t("settings")}</T>
      </Card>
    </Screen>
  );
}
