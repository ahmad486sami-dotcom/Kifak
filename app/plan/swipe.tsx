import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, View, Dimensions } from "react-native";
import { Screen, T, Card, Row, Button, Big, Empty, haptic, Section } from "@/components/ui";
import { colors, radius } from "@/lib/theme";
import { useT, tr } from "@/i18n";
import { Spot } from "@/data/dates";
import { getSpots } from "@/lib/spots";
import { supabase } from "@/lib/supabase";
import { notifyPartner } from "@/lib/notifications";
import { useApp, coupleId, partnerName } from "@/store/app";

const W = Dimensions.get("window").width;

export default function Swipe() {
  const { t } = useT();
  const uid = useApp((s) => s.session?.user.id);
  const name = partnerName();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [theirs, setTheirs] = useState<Record<string, boolean>>({});
  const [justMatched, setJustMatched] = useState<Spot | null>(null);
  const pos = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    (async () => {
      const [all, { data }] = await Promise.all([getSpots(), supabase.from("date_swipes").select("user_id, idea_id, liked").eq("couple_id", coupleId())]);
      const m: Record<string, boolean> = {}, p: Record<string, boolean> = {};
      for (const r of data ?? []) (r.user_id === uid ? m : p)[r.idea_id] = r.liked;
      setMine(m); setTheirs(p);
      setSpots([...all].sort(() => Math.random() - 0.5));
    })();
  }, []);

  const deck = useMemo(() => spots.filter((s) => mine[s.id] === undefined), [spots, mine]);
  const matches = spots.filter((s) => mine[s.id] && theirs[s.id]);
  const top = deck[0];

  async function decide(liked: boolean) {
    if (!top) return;
    haptic(liked ? "medium" : "light");
    setMine((m) => ({ ...m, [top.id]: liked }));
    pos.setValue({ x: 0, y: 0 });
    await supabase.from("date_swipes").upsert({ couple_id: coupleId(), user_id: uid, idea_id: top.id, liked });
    if (liked && theirs[top.id]) {
      haptic("success");
      setJustMatched(top);
      notifyPartner("swipe", `${top.emoji} ${tr(top.name)}`);
    }
  }

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 110) {
          Animated.timing(pos, { toValue: { x: Math.sign(g.dx) * W * 1.5, y: g.dy }, duration: 180, useNativeDriver: false }).start(() => decideRef.current(g.dx > 0));
        } else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }),
  ).current;
  const decideRef = useRef(decide);
  decideRef.current = decide;

  const rotate = pos.x.interpolate({ inputRange: [-W, 0, W], outputRange: ["-12deg", "0deg", "12deg"] });

  return (
    <Screen back title={t("swipe_title")}>
      <T c={colors.muted} center>{t("swipe_explain", { name })}</T>
      {justMatched && (
        <Card glow style={{ alignItems: "center" }}>
          <T v="h2">💞 {t("its_a_match")}</T>
          <T v="h3">{justMatched.emoji} {tr(justMatched.name)}</T>
          <Button kind="soft" label={t("nice")} onPress={() => setJustMatched(null)} />
        </Card>
      )}
      {top ? (
        <View style={{ height: 380 }}>
          <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }}>
            <View style={{ height: 360, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 24, justifyContent: "center", alignItems: "center", gap: 12 }}>
              <Big emoji={top.emoji} size={80} />
              <T v="h2" center>{tr(top.name)}</T>
              <T c={colors.muted} center>{tr(top.blurb)}</T>
              <T v="small" c={colors.faint}>{"💰".repeat(top.budget)}</T>
              {theirs[top.id] && <T v="small" c={colors.love}>👀 {t("they_liked_this", { name })}</T>}
            </View>
          </Animated.View>
        </View>
      ) : (
        <Empty emoji="🎉" title={t("swipe_done")} body={t("swipe_done_body", { name })} />
      )}
      {top && (
        <Row>
          <Button kind="soft" label={`✕ ${t("nope")}`} onPress={() => decide(false)} style={{ flex: 1 }} />
          <Button label={`♥ ${t("yes")}`} onPress={() => decide(true)} style={{ flex: 1 }} />
        </Row>
      )}
      <Section title={t("your_matches", { n: matches.length })} />
      {matches.map((m) => (
        <Card key={m.id}><Row><T v="h2">{m.emoji}</T><T v="h3" style={{ flex: 1 }}>{tr(m.name)}</T></Row></Card>
      ))}
    </Screen>
  );
}
