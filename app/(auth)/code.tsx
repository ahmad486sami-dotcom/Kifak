import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, T, Input, Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { loadAll } from "@/store/app";

export default function Code() {
  const { t } = useT();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function verify(value = code) {
    if (value.length !== 6) return;
    setBusy(true); setErr("");
    const { error } = await supabase.auth.verifyOtp({ email: String(email), token: value, type: "email" });
    setBusy(false);
    if (error) return setErr(t("error_code"));
    await loadAll();
    router.replace("/");
  }

  async function resend() {
    await supabase.auth.signInWithOtp({ email: String(email) });
    setErr(t("code_resent"));
  }

  return (
    <Screen back title="">
      <T v="h1">{t("code_title")}</T>
      <T c={colors.muted}>{t("code_sub", { email: String(email) })}</T>
      <Input
        big value={code} autoFocus keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode"
        onChangeText={(v) => { const c = v.replace(/\D/g, ""); setCode(c); if (c.length === 6) verify(c); }}
        placeholder="••••••"
      />
      {err ? <T c={colors.accent}>{err}</T> : null}
      <Button label={t("verify")} disabled={code.length !== 6} loading={busy} onPress={() => verify()} />
      <Button kind="ghost" label={t("resend_code")} onPress={resend} />
    </Screen>
  );
}
