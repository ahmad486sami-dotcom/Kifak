import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from "expo-audio";
import { Screen, T, Input, Button, Row, Chip, haptic, Card } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { uploadCoupleFile } from "@/lib/supabase";
import { sendNote, coupleId, partnerName } from "@/store/app";

const PROMPTS = ["note_prompt_1", "note_prompt_2", "note_prompt_3", "note_prompt_4"] as const;

export default function NewNote() {
  const { t } = useT();
  const params = useLocalSearchParams<{ voice?: string; text?: string }>();
  const [mode, setMode] = useState<"text" | "voice">(params.voice ? "voice" : "text");
  const [text, setText] = useState(params.text ?? "");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recUri, setRecUri] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const name = partnerName();

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSecs((s) => { if (s >= 119) stop(); return s + 1; }), 1000);
    return () => clearInterval(id);
  }, [recording]);

  async function start() {
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) return Alert.alert(t("mic_needed"));
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecUri(null); setSecs(0); setRecording(true); haptic("medium");
  }
  async function stop() {
    await recorder.stop();
    setRecording(false);
    setRecUri(recorder.uri);
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  }

  async function send() {
    setBusy(true);
    try {
      let path: string | undefined;
      if (mode === "voice" && recUri) path = await uploadCoupleFile(coupleId()!, recUri, "m4a", "audio/mp4");
      await sendNote(text.trim(), path);
      haptic("success");
      router.back();
    } catch {
      Alert.alert(t("error_generic"));
    }
    setBusy(false);
  }

  const canSend = mode === "text" ? text.trim().length > 0 : !!recUri;

  return (
    <Screen back title={t("new_note")}>
      <Row>
        <Chip emoji="✍️" label={t("text")} selected={mode === "text"} onPress={() => setMode("text")} />
        <Chip emoji="🎙️" label={t("voice")} selected={mode === "voice"} onPress={() => setMode("voice")} />
      </Row>
      <T c={colors.muted}>{t("note_sub", { name })}</T>
      {mode === "text" ? (
        <>
          <Input multiline value={text} onChangeText={setText} placeholder={t("note_ph")} maxLength={1000} autoFocus />
          <Row wrap gap={8}>
            {PROMPTS.map((p) => <Chip key={p} label={t(p)} onPress={() => setText(t(p) + " ")} />)}
          </Row>
        </>
      ) : (
        <Card style={{ alignItems: "center", paddingVertical: 30 }}>
          <T v="h1">{recording ? "🔴" : recUri ? "✅" : "🎙️"}</T>
          <T v="h2">{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}</T>
          <Button label={recording ? t("stop") : recUri ? t("record_again") : t("record")} onPress={recording ? stop : start} style={{ alignSelf: "stretch" }} />
          <T v="small" c={colors.faint}>{t("voice_limit")}</T>
          <Input value={text} onChangeText={setText} placeholder={t("caption_optional")} maxLength={140} style={{ alignSelf: "stretch" }} />
        </Card>
      )}
      <Button label={t("send")} disabled={!canSend || recording} loading={busy} onPress={send} />
      <T v="small" c={colors.faint} center>{t("note_sealed")}</T>
    </Screen>
  );
}
