import React, { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Screen, T, Input, Button, Row, Chip } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { notifyPartner } from "@/lib/notifications";
import { useApp, coupleId, loadPartner, pushWidget } from "@/store/app";

const KINDS = ["date", "anniversary", "birthday", "trip", "other"] as const;

export default function NewEvent() {
  const { t } = useT();
  const params = useLocalSearchParams<{ title?: string; plan?: string }>();
  const uid = useApp((s) => s.session?.user.id);
  const [title, setTitle] = useState(params.title ?? "");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("date");
  const start = new Date(Date.now() + 86400000);
  start.setHours(20, 0, 0, 0);
  const [when, setWhen] = useState(start);
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState(false);

  const valid = title.trim().length > 0;

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("events").insert({
      couple_id: coupleId(), created_by: uid, title: title.trim().slice(0, 80), starts_at: when.toISOString(), kind,
      plan: params.plan ? JSON.parse(params.plan) : null, repeats_yearly: yearly || kind === "anniversary" || kind === "birthday",
    });
    setBusy(false);
    if (error) return Alert.alert(t("error_generic"));
    // reminder 2 hours before on this phone
    const remindAt = new Date(when.getTime() - 2 * 3600_000);
    if (remindAt.getTime() > Date.now()) {
      Notifications.scheduleNotificationAsync({
        content: { title: `⏰ ${title.trim()}`, body: t("event_reminder_body") },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: remindAt },
      }).catch(() => {});
    }
    notifyPartner("event", title.trim());
    await loadPartner(); pushWidget();
    router.back();
  }

  return (
    <Screen back title={t("add_date")}>
      <T v="tiny" c={colors.muted}>{t("what").toUpperCase()}</T>
      <Input value={title} onChangeText={setTitle} placeholder={t("event_title_ph")} maxLength={80} />
      <Row wrap gap={8}>{KINDS.map((k) => <Chip key={k} label={t(("kind_" + k) as any)} selected={kind === k} onPress={() => setKind(k)} />)}</Row>
      <T v="tiny" c={colors.muted}>{t("when").toUpperCase()}</T>
      <DateTimePicker value={when} mode="datetime" display="inline" themeVariant="dark" accentColor={colors.accent} minimumDate={new Date()} onChange={(_, d) => d && setWhen(d)} />
      <Chip label={t("repeat_yearly")} selected={yearly} onPress={() => setYearly(!yearly)} />
      <Button label={t("save")} disabled={!valid} loading={busy} onPress={save} />
    </Screen>
  );
}
