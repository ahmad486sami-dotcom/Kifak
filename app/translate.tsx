import React, { useMemo, useState } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Screen, T, Card, Row, Chip, Input, Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT, trg } from "@/i18n";
import { FEELINGS, NEEDS } from "@/data/extras";
import { composeMessage } from "@/engine/translate";
import { useApp, partnerName, myGender, partnerGender, sendNote } from "@/store/app";

export default function Translate() {
  const { t, lang } = useT();
  const partner = useApp((s) => s.partnerProfile);
  const name = partnerName();
  const me = myGender(), them = partnerGender();
  const [feeling, setFeeling] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const msg = useMemo(
    () => (feeling && need ? composeMessage({ feeling, need, detail, partner, lang, me, them }) : ""),
    [feeling, need, detail, partner, lang],
  );

  return (
    <Screen back title={t("translate_feelings")}>
      <T c={colors.muted}>{t("translate_sub", { name })}</T>
      <T v="tiny" c={colors.muted}>{t("i_feel").toUpperCase()}</T>
      <Row wrap gap={8}>
        {FEELINGS.map((f) => <Chip key={f.id} emoji={f.emoji} label={trg(f.label, me, them)} selected={feeling === f.id} onPress={() => setFeeling(f.id)} />)}
      </Row>
      <T v="tiny" c={colors.muted}>{t("i_need").toUpperCase()}</T>
      <Row wrap gap={8}>
        {NEEDS.map((n) => <Chip key={n.id} emoji={n.emoji} label={trg(n.label, me, them)} selected={need === n.id} onPress={() => setNeed(n.id)} />)}
      </Row>
      <T v="tiny" c={colors.muted}>{t("because_optional").toUpperCase()}</T>
      <Input value={detail} onChangeText={setDetail} placeholder={t("because_ph")} maxLength={140} />
      {msg ? (
        <Card glow>
          <T v="tiny" c={colors.love}>{t("said_their_way", { name }).toUpperCase()}</T>
          <T v="h3">{msg}</T>
          <Row>
            <Button kind="soft" label={copied ? t("copied") : t("copy")} onPress={async () => { await Clipboard.setStringAsync(msg); setCopied(true); }} style={{ flex: 1 }} />
            <Button label={sent ? t("sent") : t("send_in_app")} disabled={sent} onPress={async () => { await sendNote(msg); setSent(true); }} style={{ flex: 1 }} />
          </Row>
          <Button kind="ghost" label={t("share_whatsapp")} onPress={() => Share.share({ message: msg })} />
        </Card>
      ) : null}
    </Screen>
  );
}
