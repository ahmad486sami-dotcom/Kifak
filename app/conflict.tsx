import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Screen, T, Card, Button, Row, Chip, GradientCard, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { CONFLICT_STEPS } from "@/data/extras";
import { decode } from "@/engine/decoder";
import { supabase } from "@/lib/supabase";
import { notifyPartner } from "@/lib/notifications";
import { useApp, coupleId, partnerName, myGender, partnerGender } from "@/store/app";

export default function Conflict() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const pAns = useApp((s) => s.partnerAnswers);
  const myTraits = useApp((s) => s.myProfile?.traits ?? null);
  const pTraits = useApp((s) => s.partnerProfile?.traits);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  // longer cool-down suggested if either of you needs time
  const suggested = (pTraits?.withdraw ?? 0) > 0.25 || (myTraits?.withdraw ?? 0) > 0.25 ? 30 : 15;
  const [minutes, setMinutes] = useState(suggested);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [step, setStep] = useState(0);
  const [conflictId, setConflictId] = useState<string | null>(null);

  useEffect(() => {
    // join an active pause if partner started one
    const c = coupleId();
    if (!c) return;
    supabase.from("conflicts").select("*").eq("couple_id", c).is("resolved_at", null).order("started_at", { ascending: false }).limit(1).then(({ data }) => {
      const r = data?.[0];
      if (r && Date.now() - new Date(r.started_at).getTime() < 6 * 3600_000) {
        setConflictId(r.id); setMinutes(r.cooldown_minutes); setStartedAt(new Date(r.started_at).getTime()); setStep(1);
      }
    });
  }, []);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const left = startedAt ? Math.max(0, startedAt + minutes * 60000 - now) : minutes * 60000;
  const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
  const repair = useMemo(() => decode("after_fight", pAns, myTraits), [pAns, myTraits]);

  async function begin() {
    haptic("medium");
    const c = coupleId();
    const { data } = await supabase.from("conflicts").insert({ couple_id: c, started_by: uid, cooldown_minutes: minutes }).select().single();
    setConflictId(data?.id ?? null);
    setStartedAt(Date.now());
    setStep(1);
    notifyPartner("conflict", t("conflict_push", { min: minutes }));
  }
  async function resolve() {
    if (conflictId) await supabase.from("conflicts").update({ resolved_at: new Date().toISOString() }).eq("id", conflictId);
    haptic("success");
    router.back();
  }

  const s = CONFLICT_STEPS[step];
  return (
    <Screen back title={t("conflict_mode")}>
      <GradientCard style={{ alignItems: "center" }}>
        <T v="tiny" c={colors.muted}>{t("step_x", { x: step + 1, y: CONFLICT_STEPS.length }).toUpperCase()}</T>
        <T v="h2" center>{trg(s.title, me, them)}</T>
        <T c={colors.muted} center>{trg(s.body, me, them)}</T>
      </GradientCard>

      {step === 0 && (
        <Card>
          <T v="h3">⏱️ {t("cooldown_length")}</T>
          <Row wrap gap={8}>
            {[10, 15, 20, 30, 45, 60].map((m) => <Chip key={m} label={`${m} ${t("min")}`} selected={minutes === m} onPress={() => setMinutes(m)} />)}
          </Row>
          <T v="small" c={colors.faint}>{t("cooldown_suggested", { n: suggested })}</T>
          <Button label={t("start_pause")} onPress={begin} />
        </Card>
      )}

      {step === 1 && (
        <Card style={{ alignItems: "center", paddingVertical: 30 }}>
          <T v="h1" style={{ fontSize: 64 }}>{`${mm}:${String(ss).padStart(2, "0")}`}</T>
          <T c={colors.muted} center>{left > 0 ? t("cooldown_running") : t("cooldown_done")}</T>
        </Card>
      )}

      {step === CONFLICT_STEPS.length - 1 && repair.want && (
        <Card glow>
          <T v="tiny" c={colors.love}>{t("repair_for", { name }).toUpperCase()}</T>
          <T v="h3">“{trg(repair.want.label, them, me)}”</T>
          {repair.action && <T c={colors.muted}>{trg(repair.action.do, me, them, { name })}</T>}
        </Card>
      )}

      {step > 0 && (
        <Row>
          {step > 1 && <Button kind="soft" label={t("previous")} onPress={() => setStep(step - 1)} style={{ flex: 1 }} />}
          {step < CONFLICT_STEPS.length - 1 ? (
            <Button label={t("next")} onPress={() => setStep(step + 1)} style={{ flex: 1 }} />
          ) : (
            <Button label={t("we_made_up")} onPress={resolve} style={{ flex: 1 }} />
          )}
        </Row>
      )}
      <View style={{ height: 10 }} />
      <T v="small" c={colors.faint} center>{t("conflict_disclaimer")}</T>
    </Screen>
  );
}
