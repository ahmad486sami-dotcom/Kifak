import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { Screen, T, Button, Big, Card, Chip } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { useApp, loadAll, partnerName } from "@/store/app";

/** Shown right after linking: celebrate + set "together since" */
export default function Linked() {
  const { t } = useT();
  const partner = useApp((s) => s.partner);
  const [date, setDate] = useState(new Date());
  const [skip, setSkip] = useState(false);

  async function go() {
    if (!skip) {
      const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      await supabase.rpc("set_together_since", { d });
    }
    await loadAll();
    router.replace("/home");
  }

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: 10, marginTop: 40 }}>
        <Big emoji="💞" size={80} />
        <T v="h1" center>{t("linked_title", { name: partner?.name || partnerName() })}</T>
        <T c={colors.muted} center>{t("linked_sub")}</T>
      </View>
      <Card>
        <T v="h3">📅 {t("together_since_q")}</T>
        {!skip && <DateTimePicker value={date} mode="date" display="spinner" themeVariant="dark" maximumDate={new Date()} onChange={(_, d) => d && setDate(d)} />}
        <Chip label={t("skip_for_now")} selected={skip} onPress={() => setSkip(!skip)} />
        <T v="small" c={colors.faint}>{t("together_since_hint")}</T>
      </Card>
      <Button label={t("lets_go")} onPress={go} />
    </Screen>
  );
}
