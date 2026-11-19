import React, { useState } from "react";
import { Alert, Linking } from "react-native";
import { router } from "expo-router";
import { Screen, T, Card, Row, Chip, Button, Section, Input } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, setLang, Gender } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { restore, logOutBilling } from "@/lib/billing";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { useApp, loadAll, refreshAccess, signOut, partnerName } from "@/store/app";

export default function Settings() {
  const { t, lang } = useT();
  const me = useApp((s) => s.me);
  const linked = useApp((s) => !!s.couple?.user_b);
  const access = useApp((s) => s.access);
  const name = partnerName();
  const [newName, setNewName] = useState(me?.name ?? "");
  const [showDanger, setShowDanger] = useState(false);

  async function saveName() {
    const n = newName.trim().replace(/\s+/g, " ").slice(0, 40);
    if (n.length < 2 || !me) return;
    await supabase.from("profiles").update({ name: n }).eq("id", me.id);
    loadAll();
  }
  async function setGender(g: Gender) {
    if (!me) return;
    await supabase.from("profiles").update({ gender: g }).eq("id", me.id);
    loadAll();
  }
  async function changeLang(l: "en" | "ar") {
    if (me) await supabase.from("profiles").update({ lang: l }).eq("id", me.id);
    setLang(l);
  }

  function unlink() {
    Alert.alert(t("unlink_title", { name }), t("unlink_body"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("unlink"), style: "destructive", onPress: async () => { await supabase.rpc("leave_couple"); await loadAll(); router.replace("/"); } },
    ]);
  }

  function deleteAccount() {
    Alert.alert(t("delete_title"), t("delete_body"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete_forever"), style: "destructive", onPress: async () => {
          const { error } = await supabase.functions.invoke("delete-account");
          if (error) return Alert.alert(t("error_generic"));
          await logOutBilling();
          await signOut();
          router.replace("/welcome");
        },
      },
    ]);
  }

  return (
    <Screen back title={t("settings")}>
      <Section title={t("profile")} />
      <Card>
        <Input value={newName} onChangeText={setNewName} onEndEditing={saveName} maxLength={40} />
        <Row>
          <Chip emoji="🙋‍♂️" label={t("male")} selected={me?.gender === "m"} onPress={() => setGender("m")} />
          <Chip emoji="🙋‍♀️" label={t("female")} selected={me?.gender === "f"} onPress={() => setGender("f")} />
        </Row>
      </Card>

      <Section title={t("language")} />
      <Row>
        <Chip label="English" selected={lang === "en"} onPress={() => changeLang("en")} />
        <Chip label="عربي" selected={lang === "ar"} onPress={() => changeLang("ar")} />
      </Row>

      <Section title={t("subscription")} />
      <Card>
        <T>{access ? `✅ ${t("sub_active")}` : `🔒 ${t("sub_inactive")}`}</T>
        <T v="small" c={colors.muted}>{t("pw_covers_both")}</T>
        <Row>
          {!access && <Button label={t("pw_subscribe")} onPress={() => router.push("/paywall")} style={{ flex: 1 }} />}
          <Button kind="soft" label={t("manage")} onPress={() => Linking.openURL("https://apps.apple.com/account/subscriptions")} style={{ flex: 1 }} />
        </Row>
        <Button kind="ghost" label={t("restore")} onPress={async () => { const ok = await restore().catch(() => false); await refreshAccess(); Alert.alert(ok ? t("restored") : t("restore_none")); }} />
      </Card>

      <Section title={t("notifications")} />
      <Card onPress={() => Linking.openSettings()}>
        <T>🔔 {t("notif_settings")}</T>
      </Card>

      <Section title={t("help")} />
      <Card onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}><T>✉️ {t("contact_support")}</T></Card>
      <Card onPress={() => router.push("/legal/terms")}><T>📄 {t("terms")}</T></Card>
      <Card onPress={() => router.push("/legal/privacy")}><T>🔒 {t("privacy")}</T></Card>

      <Section title={t("account")} />
      <Button kind="soft" label={t("sign_out")} onPress={async () => { await logOutBilling(); await signOut(); router.replace("/welcome"); }} />
      {linked && <Button kind="ghost" label={t("unlink_partner", { name })} onPress={unlink} />}
      <Button kind="ghost" label={showDanger ? t("hide") : t("more_options")} onPress={() => setShowDanger(!showDanger)} />
      {showDanger && <Button kind="danger" label={t("delete_account")} onPress={deleteAccount} />}
      <T v="tiny" c={colors.faint} center>Kifak · v1.0.0</T>
    </Screen>
  );
}
