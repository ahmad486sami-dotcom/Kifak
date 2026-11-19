import React, { useCallback, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen, T, Card, GradientCard, Row, Chip, Button, Section, Big, Empty, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, tr } from "@/i18n";
import { EMIRATES, VIBES, STAY_IN, DATE_JAR, buildPlan, DatePlan, Emirate, Vibe, TimeOfDay, Spot } from "@/data/dates";
import { getSpots } from "@/lib/spots";
import { supabase } from "@/lib/supabase";
import { coupleId, partnerName, sendNote, EventRow } from "@/store/app";

export default function PlanTab() {
  const { t, lang } = useT();
  const name = partnerName();
  const [emirate, setEmirate] = useState<Emirate>("abu_dhabi");
  const [vibe, setVibe] = useState<Vibe>("romantic");
  const [budget, setBudget] = useState<1 | 2 | 3>(2);
  const [time, setTime] = useState<TimeOfDay>("evening");
  const [plan, setPlan] = useState<DatePlan | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [jar, setJar] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getSpots().then(setSpots);
    AsyncStorage.getItem("emirate").then((e) => e && setEmirate(e as Emirate));
  }, []);

  useFocusEffect(useCallback(() => {
    const c = coupleId();
    if (!c) return;
    supabase.from("events").select("*").eq("couple_id", c).gte("starts_at", new Date(Date.now() - 86400000).toISOString()).order("starts_at").limit(20)
      .then(({ data }) => setEvents((data ?? []) as EventRow[]));
  }, []));

  function make() {
    haptic("medium");
    AsyncStorage.setItem("emirate", emirate);
    setSent(false);
    setPlan(buildPlan({ emirate, vibe, budget, time }, spots, Math.floor(Math.random() * 10000)));
  }

  const stops = plan ? ([["start", plan.start], ["main", plan.main], ["end", plan.end]] as const).filter(([, s]) => s) : [];
  const planText = stops.map(([k, s]) => `${s!.emoji} ${tr(s!.name)}`).join(" → ");

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 8 }}>{t("plan_title")}</T>
      <T c={colors.muted}>{t("plan_sub")}</T>

      {/* Planner */}
      <Card>
        <T v="h3">🌙 {t("night_out_planner")}</T>
        <T v="tiny" c={colors.muted}>{t("where").toUpperCase()}</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {EMIRATES.map((e) => <Chip key={e.id} label={tr(e.name)} selected={emirate === e.id} onPress={() => setEmirate(e.id)} />)}
        </ScrollView>
        <T v="tiny" c={colors.muted}>{t("vibe").toUpperCase()}</T>
        <Row wrap gap={8}>{VIBES.map((v) => <Chip key={v.id} emoji={v.emoji} label={tr(v.name)} selected={vibe === v.id} onPress={() => setVibe(v.id)} />)}</Row>
        <T v="tiny" c={colors.muted}>{t("budget").toUpperCase()}</T>
        <Row gap={8}>
          {([1, 2, 3] as const).map((b) => <Chip key={b} label={b === 1 ? t("budget_1") : b === 2 ? t("budget_2") : t("budget_3")} selected={budget === b} onPress={() => setBudget(b)} />)}
        </Row>
        <T v="tiny" c={colors.muted}>{t("when").toUpperCase()}</T>
        <Row gap={8}>
          {(["day", "evening", "night"] as const).map((x) => <Chip key={x} label={t(("time_" + x) as any)} selected={time === x} onPress={() => setTime(x)} />)}
        </Row>
        <Button label={plan ? t("shuffle") : t("plan_it")} icon="✨" onPress={make} />
      </Card>

      {plan && (
        <GradientCard>
          <T v="tiny" c={colors.accent2}>{t("your_plan").toUpperCase()}</T>
          {stops.map(([k, s], i) => (
            <Row key={k} style={{ alignItems: "flex-start" }}>
              <Big emoji={s!.emoji} size={28} />
              <View style={{ flex: 1 }}>
                <T v="small" c={colors.muted}>{t(("stop_" + k) as any)}</T>
                <T v="h3">{tr(s!.name)}</T>
                <T v="small" c={colors.muted}>{tr(s!.blurb)}</T>
              </View>
            </Row>
          ))}
          <Row>
            <Button kind="soft" label={sent ? t("sent") : t("send_to", { name })} disabled={sent} onPress={async () => { await sendNote(`🌙 ${t("date_idea")}: ${planText}`); setSent(true); }} style={{ flex: 1 }} />
            <Button label={t("lock_it_in")} onPress={() => router.push({ pathname: "/plan/event", params: { title: tr(plan.main?.name ?? plan.start?.name), plan: JSON.stringify({ start: plan.start?.id, main: plan.main?.id, end: plan.end?.id }) } })} style={{ flex: 1 }} />
          </Row>
        </GradientCard>
      )}

      {/* Swipe */}
      <Card onPress={() => router.push("/plan/swipe")}>
        <Row>
          <Big emoji="💞" size={32} />
          <View style={{ flex: 1 }}>
            <T v="h3">{t("swipe_title")}</T>
            <T v="small" c={colors.muted}>{t("swipe_sub", { name })}</T>
          </View>
          <T v="h3">›</T>
        </Row>
      </Card>

      {/* Upcoming */}
      <Section title={t("upcoming")} action={t("add")} onAction={() => router.push("/plan/event")} />
      {events.length === 0 ? (
        <Empty emoji="📅" title={t("no_events")} cta={t("add_date")} onPress={() => router.push("/plan/event")} />
      ) : events.map((e) => {
        const d = new Date(e.starts_at);
        const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
        return (
          <Card key={e.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <T v="h3">{e.kind === "anniversary" ? "💍 " : e.kind === "birthday" ? "🎂 " : e.kind === "trip" ? "✈️ " : "🌙 "}{e.title}</T>
                <T v="small" c={colors.muted}>{d.toLocaleString(lang === "ar" ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</T>
              </View>
              <T v="h3" c={colors.accent2}>{days <= 0 ? t("today") : t("in_days", { n: days })}</T>
            </Row>
          </Card>
        );
      })}

      {/* Date jar */}
      <Section title={t("date_jar")} />
      <Card onPress={() => { haptic("medium"); setJar(Math.floor(Math.random() * DATE_JAR.length)); }} style={{ alignItems: "center", paddingVertical: 22 }}>
        <Big emoji="🫙" size={40} />
        <T v="h3" center>{jar === null ? t("date_jar_tap") : tr(DATE_JAR[jar])}</T>
      </Card>

      {/* Stay in */}
      <Section title={t("stay_in")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {STAY_IN.map((s) => (
          <Card key={s.id} style={{ width: 200 }}>
            <T v="h2">{s.emoji}</T>
            <T v="h3">{tr(s.title)}</T>
            <T v="small" c={colors.muted}>{tr(s.how)}</T>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
