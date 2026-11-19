import React from "react";
import { View } from "react-native";
import { T, GradientCard, Big, Row } from "./ui";
import { colors } from "../lib/theme";
import { useT, trg } from "../i18n";
import { ARCHETYPES } from "../data/extras";
import { myGender, partnerGender } from "../store/app";
import type { Profile } from "../engine/scoring";

const LOVE_EMOJI: Record<string, string> = { words: "💬", time: "⏳", gifts: "🎁", acts: "🛠️", touch: "🤗" };

export function ProfileCard({ p, self }: { p: Profile; self: boolean }) {
  const { t } = useT();
  const a = ARCHETYPES[p.archetype];
  const g1 = self ? myGender() : partnerGender();
  const g2 = self ? partnerGender() : myGender();
  return (
    <GradientCard style={{ alignItems: "center", gap: 10, paddingVertical: 28 }}>
      <Big emoji={a.emoji} size={64} />
      <T v="h1" center>{trg(a.name, g1, g2)}</T>
      <T c={colors.muted} center>{trg(a.line, g1, g2)}</T>
      <Row wrap style={{ justifyContent: "center", marginTop: 10 }}>
        <Pill label={`${LOVE_EMOJI[p.loveWant]} ${t("love_" + p.loveWant as any)}`} />
        <Pill label={t(("attach_" + p.attachment) as any)} />
        <Pill label={t(("conflict_" + p.conflict) as any)} />
      </Row>
    </GradientCard>
  );
}

function Pill({ label }: { label: string }) {
  return <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: "#ffffff14" }}><T v="small">{label}</T></View>;
}

