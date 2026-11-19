import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { Screen, T, Card, Button, Row, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { getMonthlyPackage, buy, restore } from "@/lib/billing";
import { useApp, refreshAccess } from "@/store/app";

const FEATURES = ["pw_f1", "pw_f2", "pw_f3", "pw_f4", "pw_f5", "pw_f6"] as const;
const EMOJI = ["🔓", "💞", "🔥", "🗓️", "💌", "📱"];

export default function Paywall() {
  const { t } = useT();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const linked = useApp((s) => !!s.couple?.user_b);

  useEffect(() => { getMonthlyPackage().then(setPkg); }, []);

  async function done() {
    await refreshAccess();
    router.replace(linked ? "/home" : "/connect");
  }

  async function start() {
    if (!pkg) {
      if (__DEV__) return done(); // dev builds without store products
      return Alert.alert(t("error_generic"));
    }
    setBusy(true);
    try {
      const ok = await buy(pkg);
      if (ok) await done();
    } catch {
      Alert.alert(t("error_generic"));
    }
    setBusy(false);
  }

  async function doRestore() {
    setBusy(true);
    const ok = await restore().catch(() => false);
    setBusy(false);
    if (ok) done();
    else Alert.alert(t("restore_none"));
  }

  const price = pkg?.product.priceString;
  const intro = pkg?.product.introPrice;

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: 8, marginTop: 20 }}>
        <Big emoji="💞" size={60} />
        <T v="h1" center>{t("pw_title")}</T>
        <T c={colors.muted} center>{t("pw_sub")}</T>
      </View>
      <Card>
        {FEATURES.map((f, i) => (
          <Row key={f} style={{ paddingVertical: 4 }}>
            <T v="h3">{EMOJI[i]}</T>
            <T style={{ flex: 1 }}>{t(f)}</T>
          </Row>
        ))}
      </Card>
      <Card glow style={{ alignItems: "center" }}>
        <T v="h2" center>{t("pw_trial")}</T>
        <T c={colors.muted} center>{price ? t("pw_then", { price }) : t("pw_then_generic")}</T>
        <T v="small" c={colors.ok} center>{t("pw_covers_both")}</T>
      </Card>
      <Button label={intro ? t("pw_start_trial") : t("pw_subscribe")} loading={busy} onPress={start} />
      {!linked && <Button kind="soft" label={t("pw_partner_pays")} onPress={() => router.push("/connect")} />}
      <Row style={{ justifyContent: "space-between" }}>
        <Button kind="ghost" label={t("restore")} onPress={doRestore} style={{ flex: 1 }} />
        <Button kind="ghost" label={t("terms")} onPress={() => router.push("/legal/terms")} style={{ flex: 1 }} />
        <Button kind="ghost" label={t("privacy")} onPress={() => router.push("/legal/privacy")} style={{ flex: 1 }} />
      </Row>
      <T v="tiny" c={colors.faint} center>{t("pw_legal")}</T>
      <Button kind="ghost" label={`⚙️ ${t("settings")}`} onPress={() => router.push("/settings")} />
    </Screen>
  );
}
