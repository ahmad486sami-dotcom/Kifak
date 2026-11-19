import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen, T, Card, Row, Progress, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, tr } from "@/i18n";
import { CHALLENGES } from "@/data/extras";
import { supabase } from "@/lib/supabase";
import { coupleId } from "@/store/app";

export default function Challenges() {
  const { t } = useT();
  const [done, setDone] = useState<Record<string, Set<number>>>({});

  useFocusEffect(useCallback(() => {
    supabase.from("challenge_progress").select("challenge_id, day, user_id").eq("couple_id", coupleId()).then(({ data }) => {
      // a day counts when both of you ticked it
      const byDay: Record<string, Record<number, Set<string>>> = {};
      for (const r of data ?? []) { ((byDay[r.challenge_id] ??= {})[r.day] ??= new Set()).add(r.user_id); }
      const out: Record<string, Set<number>> = {};
      for (const [cid, days] of Object.entries(byDay)) out[cid] = new Set(Object.entries(days).filter(([, u]) => u.size >= 2).map(([d]) => Number(d)));
      setDone(out);
    });
  }, []));

  return (
    <Screen back title={t("challenges")}>
      <T c={colors.muted}>{t("challenges_sub")}</T>
      {CHALLENGES.map((c) => {
        const n = done[c.id]?.size ?? 0;
        return (
          <Card key={c.id} onPress={() => router.push(`/challenges/${c.id}`)}>
            <Row>
              <Big emoji={c.emoji} size={32} />
              <View style={{ flex: 1, gap: 4 }}>
                <T v="h3">{tr(c.title)}</T>
                <Progress value={n / c.days.length} color={n === c.days.length ? colors.ok : colors.accent} />
              </View>
              <T c={colors.muted}>{n}/{c.days.length}</T>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
