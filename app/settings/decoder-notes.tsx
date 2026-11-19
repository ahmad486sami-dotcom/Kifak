import React, { useState } from "react";
import { router } from "expo-router";
import { Screen, T, Card, Input, Button, Row } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { SITUATIONS } from "@/data/situations";
import { QUESTION_MAP } from "@/data/quiz";
import { useApp, saveDecoderNote, myGender, partnerGender, partnerName } from "@/store/app";

/** Lets you write what your partner should know, in your own words, per situation. */
export default function DecoderNotes() {
  const { t } = useT();
  const notes = useApp((s) => s.myNotes);
  const answers = useApp((s) => s.myAnswers);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const [draft, setDraft] = useState<Record<string, string>>(notes);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <Screen back title={t("my_notes_title")}>
      <T c={colors.muted}>{t("my_notes_explain", { name })}</T>
      {SITUATIONS.map((s) => {
        const mq = QUESTION_MAP[s.meaningQ], wq = QUESTION_MAP[s.wantQ];
        const m = mq.options?.find((o) => o.id === answers[s.meaningQ]);
        const w = wq.options?.find((o) => o.id === answers[s.wantQ]);
        return (
          <Card key={s.id}>
            <T v="h3">{s.emoji} {trg(mq.text, me, them)}</T>
            <T v="small" c={colors.muted}>{m ? trg(m.label, me, them) : "—"} · {w ? trg(w.label, me, them) : "—"}</T>
            <Input multiline value={draft[s.id] ?? ""} onChangeText={(v) => setDraft({ ...draft, [s.id]: v })} placeholder={t("note_in_your_words")} maxLength={280} style={{ minHeight: 70 }} />
            <Row>
              <Button kind="soft" label={saved === s.id ? t("saved") : t("save")} onPress={async () => { await saveDecoderNote(s.id, draft[s.id] ?? ""); setSaved(s.id); }} style={{ flex: 1 }} />
              <Button kind="ghost" label={t("change_answer")} onPress={() => router.push(`/quiz/${mq.section}`)} style={{ flex: 1 }} />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
