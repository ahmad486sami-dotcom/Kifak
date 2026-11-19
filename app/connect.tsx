import React, { useEffect, useState } from "react";
import { Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, T, Card, Button, Input, Big, Row, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { useApp, loadAll } from "@/store/app";

export default function Connect() {
  const { t } = useT();
  const params = useLocalSearchParams<{ code?: string }>();
  const me = useApp((s) => s.me);
  const couple = useApp((s) => s.couple);
  const [myCode, setMyCode] = useState<string | null>(couple && !couple.user_b ? couple.invite_code : null);
  const [code, setCode] = useState((params.code ?? "").toUpperCase());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!myCode) supabase.rpc("create_invite").then(({ data }) => data && setMyCode(data as string));
  }, []);

  // wait for partner to join with my code
  useEffect(() => {
    if (!me) return;
    const ch = supabase
      .channel(`invite:${me.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "couples", filter: `user_a=eq.${me.id}` }, async (p: any) => {
        if (p.new?.user_b) { haptic("success"); await loadAll(); router.replace("/linked"); }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me?.id]);

  async function join() {
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("join_couple", { code: code.trim().toUpperCase() });
    setBusy(false);
    if (error) {
      const m = error.message;
      return setErr(m.includes("own_code") ? t("connect_own") : m.includes("already_linked") ? t("connect_already") : t("connect_invalid"));
    }
    haptic("success");
    await loadAll();
    router.replace("/linked");
  }

  const link = myCode ? `kifak://join/${myCode}` : "";
  const msg = t("invite_msg", { name: me?.name ?? "", code: myCode ?? "" });

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: 6, marginTop: 16 }}>
        <Big emoji="🔗" size={56} />
        <T v="h1" center>{t("connect_title")}</T>
        <T c={colors.muted} center>{t("connect_sub")}</T>
      </View>

      <Card style={{ alignItems: "center" }}>
        <T v="tiny" c={colors.muted}>{t("your_code").toUpperCase()}</T>
        <T v="h1" style={{ letterSpacing: 8, fontSize: 40 }}>{myCode ?? "······"}</T>
        <Row>
          <Button kind="soft" label={copied ? t("copied") : t("copy")} onPress={async () => { if (myCode) { await Clipboard.setStringAsync(myCode); setCopied(true); } }} style={{ flex: 1 }} />
          <Button label={t("send_invite")} onPress={() => Share.share({ message: `${msg}\n${link}` })} style={{ flex: 1 }} />
        </Row>
        <T v="small" c={colors.faint} center>{t("connect_waiting")}</T>
      </Card>

      <T v="tiny" c={colors.muted} center>{t("or").toUpperCase()}</T>

      <Card>
        <T v="h3">{t("have_code")}</T>
        <Input big value={code} onChangeText={(v) => setCode(v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())} maxLength={6} autoCapitalize="characters" placeholder="ABC123" />
        {err ? <T c={colors.accent}>{err}</T> : null}
        <Button label={t("connect_btn")} disabled={code.length !== 6} loading={busy} onPress={join} />
      </Card>
    </Screen>
  );
}
