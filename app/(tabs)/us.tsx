import React, { useCallback, useState } from "react";
import { View, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen, T, Card, GradientCard, Row, Section, Empty, Big, Button } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase, signedUrl } from "@/lib/supabase";
import { useApp, coupleId, partnerName } from "@/store/app";

type Memory = { id: string; title: string; body: string | null; photo_path: string | null; happened_on: string };

function Photo({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { signedUrl(path).then((u) => u && setUrl(u)); }, [path]));
  return url ? <Image source={{ uri: url }} style={{ width: "100%", height: 200, borderRadius: radius.md }} /> : <View style={{ height: 200, borderRadius: radius.md, backgroundColor: colors.card2 }} />;
}

export default function UsTab() {
  const { t, lang } = useT();
  const couple = useApp((s) => s.couple);
  const me = useApp((s) => s.me);
  const name = partnerName();
  const [memories, setMemories] = useState<Memory[]>([]);

  useFocusEffect(useCallback(() => {
    const c = coupleId();
    if (!c) return;
    supabase.from("memories").select("*").eq("couple_id", c).order("happened_on", { ascending: false }).limit(100).then(({ data }) => setMemories((data ?? []) as Memory[]));
  }, []));

  const since = couple?.together_since ? new Date(couple.together_since + "T00:00:00") : null;
  const days = since ? Math.floor((Date.now() - since.getTime()) / 86400000) : null;
  const nextAnniv = since ? (() => {
    const n = new Date(since); n.setFullYear(new Date().getFullYear());
    if (n.getTime() < Date.now()) n.setFullYear(n.getFullYear() + 1);
    return Math.ceil((n.getTime() - Date.now()) / 86400000);
  })() : null;

  return (
    <Screen>
      <GradientCard style={{ alignItems: "center", paddingVertical: 26 }}>
        <T v="h3">{me?.name} 💞 {name}</T>
        {days !== null ? (
          <>
            <T v="h1" style={{ fontSize: 54 }}>{days}</T>
            <T c={colors.muted}>{t("days_together_label")}</T>
            <T v="small" c={colors.accent2}>💍 {t("anniversary_in", { n: nextAnniv ?? 0 })}</T>
          </>
        ) : (
          <Button kind="soft" label={t("set_together_since")} onPress={() => router.push("/linked")} />
        )}
      </GradientCard>

      <Row>
        <Card onPress={() => router.push("/us/wishlist")} style={{ flex: 1 }}>
          <T v="h2">🎁</T>
          <T v="h3">{t("wishlists")}</T>
          <T v="small" c={colors.muted}>{t("wishlists_sub")}</T>
        </Card>
        <Card onPress={() => router.push("/us/recap")} style={{ flex: 1 }}>
          <T v="h2">📊</T>
          <T v="h3">{t("monthly_recap")}</T>
          <T v="small" c={colors.muted}>{t("monthly_recap_sub")}</T>
        </Card>
      </Row>

      <Section title={t("our_timeline")} action={t("add")} onAction={() => router.push("/us/memory")} />
      {memories.length === 0 && <Empty emoji="📸" title={t("no_memories")} body={t("no_memories_body")} cta={t("add_memory")} onPress={() => router.push("/us/memory")} />}
      {memories.map((m) => (
        <Card key={m.id}>
          {m.photo_path && <Photo path={m.photo_path} />}
          <T v="tiny" c={colors.faint}>{new Date(m.happened_on + "T00:00:00").toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</T>
          <T v="h3">{m.title}</T>
          {m.body ? <T c={colors.muted}>{m.body}</T> : null}
        </Card>
      ))}
    </Screen>
  );
}
