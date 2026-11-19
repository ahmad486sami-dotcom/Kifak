import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAudioPlayer } from "expo-audio";
import { Screen, T, Card, Button, Row, Empty, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { supabase, signedUrl } from "@/lib/supabase";
import { TAPS } from "@/data/extras";
import { useApp, coupleId, partnerName, loadPartner, myGender, partnerGender } from "@/store/app";

type Note = { id: string; from_id: string; kind: "text" | "voice" | "tap"; body: string | null; audio_path: string | null; opened_at: string | null; created_at: string };

function Voice({ path }: { path: string }) {
  const { t } = useT();
  const [url, setUrl] = useState<string | null>(null);
  const player = useAudioPlayer(url ?? undefined);
  return (
    <Button kind="soft" icon="▶️" label={t("play")} onPress={async () => {
      if (!url) { const u = await signedUrl(path); if (u) setUrl(u); setTimeout(() => player.play(), 300); }
      else { player.seekTo(0); player.play(); }
    }} />
  );
}

export default function Notes() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const name = partnerName();
  const [notes, setNotes] = useState<Note[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const load = async () => {
    const c = coupleId();
    if (!c) return;
    const { data } = await supabase.from("notes").select("*").eq("couple_id", c).order("created_at", { ascending: false }).limit(100);
    setNotes((data ?? []) as Note[]);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  async function open(n: Note) {
    haptic("medium");
    setRevealed({ ...revealed, [n.id]: true });
    if (n.from_id !== uid && !n.opened_at) {
      await supabase.from("notes").update({ opened_at: new Date().toISOString() }).eq("id", n.id);
      loadPartner();
    }
  }

  return (
    <Screen back title={t("love_notes")} right={<Pressable onPress={() => router.push("/notes/new")}><T v="h2">＋</T></Pressable>}>
      {notes.length === 0 && <Empty emoji="💌" title={t("no_notes")} body={t("no_notes_body", { name })} cta={t("write_note")} onPress={() => router.push("/notes/new")} />}
      {notes.map((n) => {
        const mine = n.from_id === uid;
        const sealed = !mine && !n.opened_at && !revealed[n.id] && n.kind !== "tap";
        const tap = n.kind === "tap" ? TAPS.find((x) => x.id === n.body) : null;
        return (
          <Card key={n.id} onPress={sealed ? () => open(n) : undefined} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "88%", backgroundColor: mine ? colors.card2 : colors.card }} glow={sealed}>
            <T v="tiny" c={colors.faint}>{mine ? t("you") : name} · {new Date(n.created_at).toLocaleString()}</T>
            {sealed ? (
              <T v="h3">💌 {t("tap_to_open")}</T>
            ) : tap ? (
              <T v="h3">{tap.emoji} {trg(tap.label, mine ? myGender() : partnerGender(), mine ? partnerGender() : myGender())}</T>
            ) : (
              <View style={{ gap: 8 }}>
                {n.body ? <T v="h3">{n.body}</T> : null}
                {n.audio_path ? <Voice path={n.audio_path} /> : null}
              </View>
            )}
            {mine && n.kind !== "tap" && <T v="tiny" c={colors.faint}>{n.opened_at ? `✓ ${t("opened")}` : t("not_opened")}</T>}
          </Card>
        );
      })}
    </Screen>
  );
}
