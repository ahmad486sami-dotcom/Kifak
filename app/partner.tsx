import React from "react";
import { Screen, T, Card, Empty } from "@/components/ui";
import { ProfileCard } from "@/components/ProfileCard";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { useApp, partnerName } from "@/store/app";

export default function PartnerProfile() {
  const { t } = useT();
  const p = useApp((s) => s.partnerProfile);
  const name = partnerName();
  return (
    <Screen back title={t("their_profile", { name })}>
      {!p ? <Empty emoji="⏳" title={t("partner_quiz_pending", { name })} body={t("partner_quiz_pending_body")} /> : (
        <>
          <ProfileCard p={p} self={false} />
          <Card>
            <T v="h3">💡 {t("how_to_love_them", { name })}</T>
            <T c={colors.muted}>{t(("love_tip_" + p.loveWant) as any, { name })}</T>
            <T c={colors.muted}>{t(("conflict_tip_" + p.conflict) as any, { name })}</T>
            <T c={colors.muted}>{t(("attach_tip_" + p.attachment) as any, { name })}</T>
          </Card>
          <T v="small" c={colors.faint} center>{t("quiz_progress_partner", { name, pct: Math.round(p.progress * 100) })}</T>
        </>
      )}
    </Screen>
  );
}
