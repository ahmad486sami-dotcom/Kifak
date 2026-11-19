import React, { useState } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, T, Input, Button, Row, Chip } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { loadAll } from "@/store/app";

/** Email + password. New accounts are created already confirmed — no codes, no emails. */
export default function EmailAuth() {
  const { t } = useT();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const e = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && password.length >= 6;

  async function submit() {
    setBusy(true); setErr("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.functions.invoke("signup", { body: { email: e, password } });
        if (error) {
          let code = "";
          try { code = (await (error as any).context?.json())?.error ?? ""; } catch {}
          if (code === "exists") { setMode("login"); setErr(t("auth_exists")); return; }
          setErr(code === "weak_password" ? t("auth_password_min") : t("error_generic"));
          return;
        }
        if (!data?.ok) { setErr(t("error_generic")); return; }
      }
      const { error } = await supabase.auth.signInWithPassword({ email: e, password });
      if (error) { setErr(error.status === 429 ? t("error_too_many") : t("auth_wrong")); return; }
      await loadAll();
      router.replace("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen back title="">
      <T v="h1">{mode === "signup" ? t("auth_create_title") : t("auth_login_title")}</T>
      <Row>
        <Chip label={t("auth_create")} selected={mode === "signup"} onPress={() => { setMode("signup"); setErr(""); }} />
        <Chip label={t("auth_login")} selected={mode === "login"} onPress={() => { setMode("login"); setErr(""); }} />
      </Row>
      <Input value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" maxLength={120} />
      <Input
        value={password} onChangeText={setPassword} placeholder={t("auth_password")} secureTextEntry={!show} autoCapitalize="none"
        textContentType={mode === "signup" ? "newPassword" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} maxLength={72}
      />
      <Pressable onPress={() => setShow(!show)} hitSlop={8}><T v="small" c={colors.muted}>{show ? t("auth_hide") : t("auth_show")}</T></Pressable>
      {mode === "signup" && <T v="small" c={colors.faint}>{t("auth_password_min")}</T>}
      {err ? <T c={colors.accent}>{err}</T> : null}
      <Button label={mode === "signup" ? t("auth_create") : t("auth_login")} disabled={!valid} loading={busy} onPress={submit} />
    </Screen>
  );
}
