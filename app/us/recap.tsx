import React, { useEffect, useState } from "react";
import { Share, View } from "react-native";
import { Screen, T, GradientCard, Card, Row, Big, Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/data/extras";
import { useApp, coupleId, partnerName, myGender, partnerGender } from "@/store/app";

type Stats = { activeDays: number; bothDays: number; notes: number; taps: number; dates: number; memories: number; daily: number; topMood?: string; best: number };

export default function Recap() {
  const { t, lang } = useT();
  const streak = useApp((s) => s.streak);
  const name = partnerName();
  const [month, setMonth] = useState(0); // 0 = this month, 1 = last month
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const c = coupleId();
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - month, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - month + 1, 1);
      const f = from.toISOString(), tt = to.toISOString();
      const fd = f.slice(0, 10), td = tt.slice(0, 10);
      const [act, notes, ev, mem, daily, moods] = await Promise.all([
        supabase.from("activity").select("day, user_id").eq("couple_id", c).gte("day", fd).lt("day", td),
        supabase.from("notes").select("kind").eq("couple_id", c).gte("created_at", f).lt("created_at", tt),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("couple_id", c).gte("starts_at", f).lt("starts_at", tt),
        supabase.from("memories").select("id", { count: "exact", head: true }).eq("couple_id", c).gte("happened_on", fd).lt("happened_on", td),
        supabase.from("daily_answers").select("day").eq("couple_id", c).gte("day", fd).lt("day", td),
        supabase.from("moods").select("mood").eq("couple_id", c).gte("created_at", f).lt("created_at", tt),
      ]);
      const days = new Map<string, Set<string>>();
      for (const r of act.data ?? []) { if (!days.has(r.day)) days.set(r.day, new Set()); days.get(r.day)!.add(r.user_id); }
      const sorted = [...days.keys()].sort();
      let best = 0, run = 0, prev: number | null = null;
      for (const d of sorted) { const n = Date.parse(d) / 86400000; run = prev !== null && n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; }
      const moodCount: Record<string, number> = {};
      for (const m of moods.data ?? []) moodCount[m.mood] = (moodCount[m.mood] ?? 0) + 1;
      const dailyDays = new Map<string, number>();
      for (const d of daily.data ?? []) dailyDays.set(d.day, (dailyDays.get(d.day) ?? 0) + 1);
      setS({
        activeDays: days.size,
        bothDays: [...days.values()].filter((v) => v.size === 2).length,
        notes: (notes.data ?? []).filter((n: any) => n.kind !== "tap").length,
        taps: (notes.data ?? []).filter((n: any) => n.kind === "tap").length,
        dates: ev.count ?? 0,
        memories: mem.count ?? 0,
        daily: [...dailyDays.values()].filter((n) => n === 2).length,
        topMood: Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0],
        best,
      });
    })();
  }, [month]);

  const monthName = new Date(new Date().getFullYear(), new Date().getMonth() - month, 1).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { month: "long", year: "numeric" });
  const mood = MOODS.find((m) => m.id === s?.topMood);

  const tiles = s ? [
    { e: "🔥", v: s.best, l: t("recap_best_streak") },
    { e: "📆", v: s.activeDays, l: t("recap_active_days") },
    { e: "🤝", v: s.bothDays, l: t("recap_both_days") },
    { e: "💌", v: s.notes, l: t("recap_notes") },
    { e: "💭", v: s.taps, l: t("recap_taps") },
    { e: "❓", v: s.daily, l: t("recap_daily") },
    { e: "🌙", v: s.dates, l: t("recap_dates") },
    { e: "📸", v: s.memories, l: t("recap_memories") },
  ] : [];

  return (
    <Screen back title={t("monthly_recap")}>
      <Row style={{ justifyContent: "center" }}>
        <Button kind={month === 1 ? "primary" : "ghost"} label={t("last_month")} onPress={() => setMonth(1)} style={{ flex: 1 }} />
        <Button kind={month === 0 ? "primary" : "ghost"} label={t("this_month")} onPress={() => setMonth(0)} style={{ flex: 1 }} />
      </Row>
      <GradientCard style={{ alignItems: "center" }}>
        <T v="tiny" c={colors.muted}>{t("you_and", { name }).toUpperCase()}</T>
        <T v="h1" center>{monthName}</T>
        {mood && <T c={colors.muted} center>{t("recap_top_mood")}: {mood.emoji} {trg(mood.label, myGender(), partnerGender())}</T>}
      </GradientCard>
      <Row wrap gap={10}>
        {tiles.map((x) => (
          <Card key={x.l} style={{ width: "47%", flexGrow: 1, alignItems: "center" }}>
            <Big emoji={x.e} size={26} />
            <T v="h1">{x.v}</T>
            <T v="small" c={colors.muted} center>{x.l}</T>
          </Card>
        ))}
      </Row>
      {s && <Button kind="soft" icon="📤" label={t("share_recap")} onPress={() => Share.share({ message: t("share_recap_msg", { month: monthName, best: s.best, notes: s.notes, dates: s.dates }) })} />}
    </Screen>
  );
}
