import React, { useState } from "react";
import { Image, Alert } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Screen, T, Input, Button, haptic } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase, uploadCoupleFile } from "@/lib/supabase";
import { useApp, coupleId } from "@/store/app";

export default function NewMemory() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(new Date());
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [4, 3] });
    if (!r.canceled) setPhoto(r.assets[0].uri);
  }

  async function save() {
    setBusy(true);
    try {
      const c = coupleId()!;
      const path = photo ? await uploadCoupleFile(c, photo, "jpg", "image/jpeg") : null;
      const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const { error } = await supabase.from("memories").insert({ couple_id: c, created_by: uid, title: title.trim().slice(0, 80), body: body.trim().slice(0, 1000) || null, photo_path: path, happened_on: d });
      if (error) throw error;
      haptic("success");
      router.back();
    } catch {
      Alert.alert(t("error_generic"));
    }
    setBusy(false);
  }

  return (
    <Screen back title={t("add_memory")}>
      {photo ? <Image source={{ uri: photo }} style={{ width: "100%", height: 220, borderRadius: radius.md }} /> : null}
      <Button kind="soft" icon="🖼️" label={photo ? t("change_photo") : t("add_photo")} onPress={pick} />
      <Input value={title} onChangeText={setTitle} placeholder={t("memory_title_ph")} maxLength={80} />
      <Input multiline value={body} onChangeText={setBody} placeholder={t("memory_body_ph")} maxLength={1000} />
      <T v="tiny" c={colors.muted}>{t("when").toUpperCase()}</T>
      <DateTimePicker value={date} mode="date" display="compact" themeVariant="dark" maximumDate={new Date()} onChange={(_, d) => d && setDate(d)} />
      <Button label={t("save")} disabled={!title.trim()} loading={busy} onPress={save} />
    </Screen>
  );
}
