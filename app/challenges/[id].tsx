import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Screen, T, Card, Row, GradientCard, Big, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, tr, trg } from "@/i18n";
import { CHALLENGES } from "@/data/extras";
import { supabase } from "@/lib/supabase";
import { useApp, coupleId, partnerName, myGender, partnerGender, refreshStreak } from "@/store/app";

export default function ChallengeDetail() {
  const { t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = CHALLENGES.find((x) => x.id === id)!;
  const uid = useApp((s) => s.session?.user.id);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const [rows, setRows] = useState<{ day: number; user_id: string }[]>([]);

  const load = () => supabase.from("challenge_progress").select("day, user_id").eq("couple_id", coupleId()).eq("challenge_id", id).then(({ data }) => setRows(data ?? []));
  useFocusEffect(useCallback(() => { load(); }, [id]));

  async function toggle(day: number) {
    const mine = rows.some((r) => r.day === day && r.user_id === uid);
    haptic(mine ? "light" : "success");
    if (mine) await supabase.from("challenge_progress").delete().eq("couple_id", coupleId()).eq("challenge_id", id).eq("day", day).eq("user_id", uid);
    else { await supabase.from("challenge_progress").insert({ couple_id: coupleId(), challenge_id: id, day, user_id: uid }); refreshStreak(); }
    load();
  }

  if (!c) return null;
  return (
    <Screen back title={tr(c.title)}>
      <GradientCard style={{ alignItems: "center" }}>
        <Big emoji={c.emoji} size={52} />
        <T v="h2" center>{tr(c.title)}</T>
        <T c={colors.muted} center>{t("challenge_rule", { name })}</T>
      </GradientCard>
      {c.days.map((d, i) => {
        const day = i + 1;
        const meDone = rows.some((r) => r.day === day && r.user_id === uid);
        const themDone = rows.some((r) => r.day === day && r.user_id !== uid);
        return (
          <Card key={day} glow={meDone && themDone}>
            <Row style={{ alignItems: "flex-start" }}>
              <T v="h3" c={colors.muted}>{day}</T>
              <View style={{ flex: 1, gap: 6 }}>
                <T v="h3">{trg(d, me, them)}</T>
                <Row gap={8}>
                  <Pressable onPress={() => toggle(day)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: meDone ? colors.ok + "33" : colors.card2 }}>
                    <T v="small">{meDone ? "✓" : "○"} {t("you")}</T>
                  </Pressable>
                  <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, backgroundColor: themDone ? colors.ok + "33" : colors.card2 }}>
                    <T v="small">{themDone ? "✓" : "○"} {name}</T>
                  </View>
                </Row>
              </View>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
