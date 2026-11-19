import React, { useCallback, useState } from "react";
import { Linking, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen, T, Card, Row, Chip, Input, Button, Empty, haptic } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { useApp, coupleId, partnerName } from "@/store/app";

type Item = { id: string; owner_id: string; title: string; link: string | null; note: string | null };

export default function Wishlist() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const name = partnerName();
  const [tab, setTab] = useState<"theirs" | "mine">("theirs");
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const load = async () => {
    const c = coupleId();
    const [{ data }, { data: cl }] = await Promise.all([
      supabase.from("wishlist").select("*").eq("couple_id", c).order("created_at", { ascending: false }),
      supabase.from("wishlist_claims").select("item_id"),
    ]);
    setItems((data ?? []) as Item[]);
    setClaims(new Set((cl ?? []).map((x: any) => x.item_id)));
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  async function add() {
    const l = link.trim();
    if (l && !/^https?:\/\//i.test(l)) return Alert.alert(t("link_invalid"));
    await supabase.from("wishlist").insert({ couple_id: coupleId(), owner_id: uid, title: title.trim().slice(0, 80), link: l || null });
    setTitle(""); setLink(""); haptic("success"); load();
  }
  async function toggleClaim(id: string) {
    haptic("medium");
    if (claims.has(id)) await supabase.from("wishlist_claims").delete().eq("item_id", id);
    else await supabase.from("wishlist_claims").insert({ item_id: id, claimed_by: uid });
    load();
  }
  async function remove(id: string) {
    await supabase.from("wishlist").delete().eq("id", id);
    load();
  }

  const shown = items.filter((i) => (tab === "mine" ? i.owner_id === uid : i.owner_id !== uid));

  return (
    <Screen back title={t("wishlists")}>
      <Row>
        <Chip label={t("their_wishlist", { name })} selected={tab === "theirs"} onPress={() => setTab("theirs")} />
        <Chip label={t("my_wishlist")} selected={tab === "mine"} onPress={() => setTab("mine")} />
      </Row>
      <T v="small" c={colors.muted}>{tab === "theirs" ? t("wishlist_theirs_hint", { name }) : t("wishlist_mine_hint", { name })}</T>

      {tab === "mine" && (
        <Card>
          <Input value={title} onChangeText={setTitle} placeholder={t("wish_ph")} maxLength={80} />
          <Input value={link} onChangeText={setLink} placeholder={t("link_optional")} autoCapitalize="none" keyboardType="url" maxLength={500} />
          <Button label={t("add")} disabled={!title.trim()} onPress={add} />
        </Card>
      )}

      {shown.length === 0 && <Empty emoji="🎁" title={tab === "mine" ? t("wishlist_empty_mine") : t("wishlist_empty_theirs", { name })} />}
      {shown.map((i) => (
        <Card key={i.id}>
          <Row style={{ justifyContent: "space-between" }}>
            <T v="h3" style={{ flex: 1 }}>{i.title}</T>
            {tab === "theirs" && claims.has(i.id) && <T c={colors.ok}>✓ {t("reserved")}</T>}
          </Row>
          {i.link ? <T v="small" c={colors.blue} lines={1} style={{ textDecorationLine: "underline" }}>{i.link}</T> : null}
          <Row>
            {i.link ? <Button kind="soft" label={t("open_link")} onPress={() => Linking.openURL(i.link!)} style={{ flex: 1 }} /> : null}
            {tab === "theirs" ? (
              <Button kind={claims.has(i.id) ? "ghost" : "primary"} label={claims.has(i.id) ? t("unreserve") : t("ill_get_this")} onPress={() => toggleClaim(i.id)} style={{ flex: 1 }} />
            ) : (
              <Button kind="ghost" label={t("remove")} onPress={() => remove(i.id)} style={{ flex: 1 }} />
            )}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
