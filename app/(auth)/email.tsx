import React, { useState } from "react";
import { router } from "expo-router";
import { Screen, T, Input, Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";

export default function Email() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function send() {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setErr(error.status === 429 ? t("error_too_many") : t("error_generic"));
    router.push({ pathname: "/code", params: { email: email.trim().toLowerCase() } });
  }

  return (
    <Screen back title="">
      <T v="h1">{t("email_title")}</T>
      <T c={colors.muted}>{t("email_sub")}</T>
      <Input value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoFocus maxLength={120} />
      {err ? <T c={colors.accent}>{err}</T> : null}
      <Button label={t("send_code")} disabled={!valid} loading={busy} onPress={send} />
    </Screen>
  );
}
