import React, { useMemo } from "react";
import { Share, View } from "react-native";
import { Screen, T, Card, GradientCard, Empty, Row, Big, Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { buildMatch } from "@/engine/match";
import { useApp, partnerName, myGender, partnerGender } from "@/store/app";

const KIND_COLOR = { strength: colors.ok, clash: colors.accent, tip: colors.blue };

export default function Match() {
  const { t } = useT();
  const me = useApp((s) => s.myProfile);
  const p = useApp((s) => s.partnerProfile);
  const name = partnerName();
  const g1 = myGender(), g2 = partnerGender();
  const report = useMemo(() => (me && p ? buildMatch(me, p) : null), [me, p]);

  if (!report) {
    return (
      <Screen back title={t("match_report")}>
        <Empty emoji="⏳" title={t("partner_quiz_pending", { name })} body={t("partner_quiz_pending_body")} />
      </Screen>
    );
  }

  const groups: ("strength" | "clash" | "tip")[] = ["strength", "clash", "tip"];
  return (
    <Screen back title={t("match_report")}>
      <GradientCard style={{ alignItems: "center", paddingVertical: 28 }}>
        <T v="tiny" c={colors.muted}>{t("you_and", { name }).toUpperCase()}</T>
        <T v="h1" style={{ fontSize: 64 }}>{report.score}%</T>
        <T v="h3" center>{trg(report.headline, g1, g2, { name })}</T>
      </GradientCard>
      {groups.map((k) => {
        const items = report.items.filter((i) => i.kind === k);
        if (!items.length) return null;
        return (
          <View key={k} style={{ gap: 10 }}>
            <T v="tiny" c={KIND_COLOR[k]} style={{ marginTop: 8 }}>{t(("match_" + k) as any).toUpperCase()}</T>
            {items.map((i, idx) => (
              <Card key={idx}>
                <Row><Big emoji={i.emoji} size={26} /><T v="h3" style={{ flex: 1 }}>{trg(i.title, g1, g2, { name })}</T></Row>
                <T c={colors.muted}>{trg(i.body, g1, g2, { name })}</T>
              </Card>
            ))}
          </View>
        );
      })}
      <Button kind="soft" icon="📤" label={t("share_score")} onPress={() => Share.share({ message: t("share_score_msg", { score: report.score }) })} />
    </Screen>
  );
}
