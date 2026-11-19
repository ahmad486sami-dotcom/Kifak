import React from "react";
import { Share, View } from "react-native";
import { router } from "expo-router";
import { Screen, T, Card, Button, Row, Progress } from "@/components/ui";
import { ProfileCard } from "@/components/ProfileCard";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { ARCHETYPES } from "@/data/extras";
import { useApp, myGender, partnerGender } from "@/store/app";

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}><T v="small">{label}</T><T v="small" c={colors.muted}>{Math.round(((v + 1) / 2) * 100)}</T></Row>
      <Progress value={(v + 1) / 2} />
    </View>
  );
}

export default function Result() {
  const { t } = useT();
  const p = useApp((s) => s.myProfile);
  const linked = useApp((s) => !!s.couple?.user_b);
  const access = useApp((s) => s.access);
  if (!p) return null;
  const tr = p.traits;
  const a = ARCHETYPES[p.archetype];

  return (
    <Screen back title={t("your_profile")}>
      <ProfileCard p={p} self />
      <Card>
        <T v="h3">{t("your_traits")}</T>
        <Bar label={t("trait_closeness")} v={(tr.anxious - tr.avoidant) / 2 + tr.contact / 2} />
        <Bar label={t("trait_space")} v={tr.space} />
        <Bar label={t("trait_direct")} v={tr.direct} />
        <Bar label={t("trait_heat")} v={tr.heat} />
        <Bar label={t("trait_repair")} v={tr.repairFast} />
        <Bar label={t("trait_social")} v={tr.social} />
        <Bar label={t("trait_planner")} v={tr.planner} />
        <Bar label={t("trait_adventure")} v={tr.adventure} />
        <Bar label={t("trait_romance")} v={tr.romance} />
      </Card>
      <Card>
        <T v="h3">💡 {t("what_this_means")}</T>
        <T c={colors.muted}>{t(("attach_" + p.attachment + "_body") as any)}</T>
        <T c={colors.muted}>{t(("conflict_" + p.conflict + "_body") as any)}</T>
      </Card>
      <Button kind="soft" icon="📤" label={t("share_my_type")} onPress={() => Share.share({ message: `${a.emoji} ${trg(a.name, myGender(), partnerGender())} — ${t("share_type_msg")}` })} />
      {!linked ? (
        <Button label={t("next_connect")} onPress={() => router.replace(access ? "/connect" : "/paywall")} />
      ) : (
        <Button label={t("back_home")} onPress={() => router.replace("/home")} />
      )}
      {p.progress < 1 && <Button kind="ghost" label={t("finish_rest_quiz")} onPress={() => router.replace("/quiz")} />}
    </Screen>
  );
}
