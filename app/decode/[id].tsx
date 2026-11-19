import React, { useMemo, useState } from "react";
import { Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, T, Card, GradientCard, Button, Row, Big, Empty } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { SITUATION_MAP } from "@/data/situations";
import { decode } from "@/engine/decoder";
import { useApp, partnerName, myGender, partnerGender, sendNote } from "@/store/app";

export default function DecodeDetail() {
  const { t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = SITUATION_MAP[id];
  const pAns = useApp((x) => x.partnerAnswers);
  const pNotes = useApp((x) => x.partnerNotes);
  const myTraits = useApp((x) => x.myProfile?.traits ?? null);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const d = useMemo(() => (s ? decode(id, pAns, myTraits, pNotes[id]) : null), [id, pAns, myTraits, pNotes]);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!s || !d) return null;

  const send = d.action?.send ? trg(d.action.send, me, them) : "";

  return (
    <Screen back title={`${s.emoji}`}>
      <T v="h1">{trg(s.title, me, them, { name })}</T>

      {d.missing && !d.note ? (
        <Empty emoji="⏳" title={t("decode_missing", { name })} body={t("decode_missing_body")} cta={t("nudge_partner")} onPress={() => sendNote(t("nudge_quiz_msg"))} />
      ) : (
        <>
          {d.meaning && (
            <Card>
              <T v="tiny" c={colors.muted}>{t("what_it_means").toUpperCase()}</T>
              <Row>
                <Big emoji={d.meaning.emoji ?? "💭"} size={30} />
                <T v="h3" style={{ flex: 1 }}>{t("they_said", { name })} “{trg(d.meaning.label, them, me)}”</T>
              </Row>
            </Card>
          )}
          {d.want && (
            <Card>
              <T v="tiny" c={colors.muted}>{t("what_they_want").toUpperCase()}</T>
              <Row>
                <Big emoji={d.want.emoji ?? "🫶"} size={30} />
                <T v="h3" style={{ flex: 1 }}>“{trg(d.want.label, them, me)}”</T>
              </Row>
            </Card>
          )}
          {d.note ? (
            <Card glow>
              <T v="tiny" c={colors.love}>{t("in_their_words", { name }).toUpperCase()}</T>
              <T v="h3">“{d.note}”</T>
            </Card>
          ) : null}
          {d.action && (
            <GradientCard>
              <T v="tiny" c={colors.accent2}>{t("do_this").toUpperCase()}</T>
              <T v="h3">{trg(d.action.do, me, them, { name })}</T>
            </GradientCard>
          )}
          {d.warning && (
            <Card style={{ borderColor: colors.warn + "66" }}>
              <T c={colors.warn}>⚠️ {trg(d.warning, me, them, { name })}</T>
            </Card>
          )}
          {send ? (
            <Card>
              <T v="tiny" c={colors.muted}>{t("send_this").toUpperCase()}</T>
              <T v="h3">{send}</T>
              <Row>
                <Button kind="soft" label={copied ? t("copied") : t("copy")} onPress={async () => { await Clipboard.setStringAsync(send); setCopied(true); }} style={{ flex: 1 }} />
                <Button label={sent ? t("sent") : t("send_in_app")} disabled={sent} onPress={async () => { await sendNote(send); setSent(true); }} style={{ flex: 1 }} />
              </Row>
              <Button kind="ghost" label={t("share_whatsapp")} onPress={() => Share.share({ message: send })} />
            </Card>
          ) : null}
        </>
      )}
      <Button kind="ghost" label={t("not_accurate")} onPress={() => router.push("/settings/decoder-notes")} />
    </Screen>
  );
}
