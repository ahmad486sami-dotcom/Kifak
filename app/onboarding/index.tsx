import React, { useState } from "react";
import { router } from "expo-router";
import { Screen, T, Input, Button, Row, Chip, Card } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, setLang, Gender } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { useApp, loadAll } from "@/store/app";

export default function Onboarding() {
  const { t, lang } = useT();
  const me = useApp((s) => s.me);
  const [name, setName] = useState(me?.name ?? "");
  const [gender, setGender] = useState<Gender | null>(me?.name ? me.gender : null);
  const [busy, setBusy] = useState(false);
  const clean = name.trim().replace(/\s+/g, " ");

  async function save() {
    if (!me || !gender || clean.length < 2) return;
    setBusy(true);
    await supabase.from("profiles").update({ name: clean.slice(0, 40), gender, lang }).eq("id", me.id);
    await loadAll();
    setBusy(false);
    router.replace("/quiz");
  }

  return (
    <Screen>
      <T v="h1" style={{ marginTop: 24 }}>{t("onb_title")}</T>
      <T c={colors.muted}>{t("onb_sub")}</T>

      <T v="tiny" c={colors.muted} style={{ marginTop: 10 }}>{t("onb_name").toUpperCase()}</T>
      <Input value={name} onChangeText={setName} placeholder={t("onb_name_ph")} maxLength={40} autoCapitalize="words" />

      <T v="tiny" c={colors.muted} style={{ marginTop: 10 }}>{t("onb_gender").toUpperCase()}</T>
      <Row>
        <Chip emoji="🙋‍♂️" label={t("male")} selected={gender === "m"} onPress={() => setGender("m")} />
        <Chip emoji="🙋‍♀️" label={t("female")} selected={gender === "f"} onPress={() => setGender("f")} />
      </Row>
      <T v="small" c={colors.faint}>{t("onb_gender_why")}</T>

      <T v="tiny" c={colors.muted} style={{ marginTop: 10 }}>{t("language").toUpperCase()}</T>
      <Row>
        <Chip label="English" selected={lang === "en"} onPress={() => setLang("en")} />
        <Chip label="عربي" selected={lang === "ar"} onPress={() => setLang("ar")} />
      </Row>

      <Card style={{ marginTop: 16 }}>
        <T v="h3">🧠 {t("onb_quiz_title")}</T>
        <T c={colors.muted}>{t("onb_quiz_body")}</T>
      </Card>
      <Button label={t("lets_go")} disabled={!gender || clean.length < 2} loading={busy} onPress={save} />
    </Screen>
  );
}
