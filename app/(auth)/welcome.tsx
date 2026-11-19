import React, { useState } from "react";
import { View, Platform } from "react-native";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { T, Button, Row, Chip, Big } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, setLang } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { loadAll } from "@/store/app";

export default function Welcome() {
  const { t, lang } = useT();
  const [err, setErr] = useState("");

  async function apple() {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!cred.identityToken) throw new Error("no token");
      const { error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: cred.identityToken });
      if (error) throw error;
      const given = cred.fullName?.givenName;
      const { data } = await supabase.auth.getUser();
      if (given && data.user) await supabase.from("profiles").update({ name: given }).eq("id", data.user.id);
      await loadAll();
      router.replace("/");
    } catch (e: any) {
      if (e?.code !== "ERR_REQUEST_CANCELED") setErr(t("error_generic"));
    }
  }

  return (
    <LinearGradient colors={["#2A1030", colors.bg, colors.bg]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: "space-between" }}>
        <Row style={{ justifyContent: "flex-end" }}>
          <Chip label="English" selected={lang === "en"} onPress={() => setLang("en")} />
          <Chip label="عربي" selected={lang === "ar"} onPress={() => setLang("ar")} />
        </Row>
        <View style={{ gap: 14, alignItems: "center" }}>
          <Big emoji="💞" size={72} />
          <T v="h1" center style={{ fontSize: 44 }}>{lang === "ar" ? "كيفك" : "Kifak"}</T>
          <T v="h3" c={colors.muted} center>{t("welcome_tagline")}</T>
          <View style={{ gap: 6, marginTop: 18 }}>
            <T c={colors.muted} center>🧠  {t("welcome_point1")}</T>
            <T c={colors.muted} center>🔓  {t("welcome_point2")}</T>
            <T c={colors.muted} center>🔥  {t("welcome_point3")}</T>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={999}
              style={{ height: 54 }}
              onPress={apple}
            />
          )}
          <Button kind="ghost" label={t("continue_email")} onPress={() => router.push("/email")} />
          {err ? <T c={colors.accent} center>{err}</T> : null}
          <T v="small" c={colors.faint} center>{t("welcome_legal")}</T>
          <Row style={{ justifyContent: "center" }} gap={18}>
            <Button kind="ghost" label={t("terms")} onPress={() => router.push("/legal/terms")} style={{ flex: 1 }} />
            <Button kind="ghost" label={t("privacy")} onPress={() => router.push("/legal/privacy")} style={{ flex: 1 }} />
          </Row>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
