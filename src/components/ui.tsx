import React from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, TextInput, TextInputProps,
  ViewStyle, TextStyle, StyleProp, I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { colors, radius, font, gradient } from "../lib/theme";

export const haptic = (kind: "light" | "medium" | "success" = "light") => {
  if (kind === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(kind === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

type TProps = { children: React.ReactNode; v?: keyof typeof font; c?: string; style?: StyleProp<TextStyle>; center?: boolean; lines?: number };
export function T({ children, v = "body", c = colors.text, style, center, lines }: TProps) {
  return (
    <Text numberOfLines={lines} style={[font[v], { color: c, textAlign: center ? "center" : "auto", writingDirection: I18nManager.isRTL ? "rtl" : "ltr" }, style]}>
      {children}
    </Text>
  );
}

export function Screen({ children, scroll = true, title, back, right, pad = true }: {
  children: React.ReactNode; scroll?: boolean; title?: string; back?: boolean; right?: React.ReactNode; pad?: boolean;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={{ padding: pad ? 20 : 0, paddingBottom: 120, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: pad ? 20 : 0, gap: 14 }}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {(title || back) && (
        <View style={styles.header}>
          {back ? (
            <Pressable hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))} style={styles.backBtn}>
              <T v="h2">{I18nManager.isRTL ? "→" : "←"}</T>
            </Pressable>
          ) : <View style={{ width: 36 }} />}
          <T v="h3" style={{ flex: 1 }} center lines={1}>{title ?? ""}</T>
          <View style={{ minWidth: 36, alignItems: "flex-end" }}>{right}</View>
        </View>
      )}
      {body}
    </SafeAreaView>
  );
}

export function Button({ label, onPress, kind = "primary", loading, disabled, style, icon }: {
  label: string; onPress?: () => void; kind?: "primary" | "ghost" | "soft" | "danger"; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; icon?: string;
}) {
  const inner = (
    <View style={[styles.btnInner, kind !== "primary" && { backgroundColor: kind === "soft" ? colors.card2 : "transparent", borderWidth: kind === "ghost" ? 1 : 0, borderColor: colors.border }]}>
      {loading ? <ActivityIndicator color={colors.text} /> : (
        <T v="h3" c={kind === "danger" ? colors.accent : colors.text}>{icon ? `${icon}  ` : ""}{label}</T>
      )}
    </View>
  );
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => { haptic(); onPress?.(); }}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], borderRadius: radius.pill, overflow: "hidden" }, style]}
    >
      {kind === "primary" ? <LinearGradient colors={gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>{inner}</LinearGradient> : inner}
    </Pressable>
  );
}

export function Card({ children, style, onPress, glow }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; glow?: boolean }) {
  const content = <View style={[styles.card, glow && { borderColor: colors.love + "66" }, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={() => { haptic(); onPress(); }} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      {content}
    </Pressable>
  );
}

export function GradientCard({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  return (
    <Pressable disabled={!onPress} onPress={() => { haptic(); onPress?.(); }}>
      <LinearGradient colors={["#3A1D3A", "#24152B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderColor: colors.love + "44" }, style]}>
        {children}
      </LinearGradient>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, emoji }: { label: string; selected?: boolean; onPress?: () => void; emoji?: string }) {
  return (
    <Pressable onPress={() => { haptic(); onPress?.(); }} style={[styles.chip, selected && { backgroundColor: colors.accent + "26", borderColor: colors.accent }]}>
      <T v="small" c={selected ? colors.text : colors.muted}>{emoji ? `${emoji} ` : ""}{label}</T>
    </Pressable>
  );
}

export function Option({ label, emoji, selected, onPress }: { label: string; emoji?: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={() => { haptic(); onPress(); }} style={({ pressed }) => [styles.option, selected && { borderColor: colors.accent, backgroundColor: colors.accent + "1F" }, pressed && { transform: [{ scale: 0.99 }] }]}>
      {emoji ? <Text style={{ fontSize: 22 }}>{emoji}</Text> : null}
      <T style={{ flex: 1 }}>{label}</T>
    </Pressable>
  );
}

export function Progress({ value, color = colors.accent }: { value: number; color?: string }) {
  return (
    <View style={{ height: 6, backgroundColor: colors.card2, borderRadius: 3, overflow: "hidden" }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height: "100%", backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export function Input(props: TextInputProps & { big?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.faint}
      {...props}
      style={[styles.input, props.big && { fontSize: 26, textAlign: "center", letterSpacing: 6, fontWeight: "800" }, props.multiline && { minHeight: 110, textAlignVertical: "top" }, { textAlign: props.big ? "center" : I18nManager.isRTL ? "right" : "left" }, props.style]}
    />
  );
}

export function Row({ children, gap = 10, style, wrap }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle>; wrap?: boolean }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap, flexWrap: wrap ? "wrap" : "nowrap" }, style]}>{children}</View>;
}

export function Section({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: "space-between", marginTop: 10 }}>
      <T v="tiny" c={colors.muted}>{title.toUpperCase()}</T>
      {action ? <Pressable onPress={onAction} hitSlop={10}><T v="small" c={colors.accent}>{action}</T></Pressable> : null}
    </Row>
  );
}

export function Empty({ emoji, title, body, cta, onPress }: { emoji: string; title: string; body?: string; cta?: string; onPress?: () => void }) {
  return (
    <Card style={{ alignItems: "center", gap: 8, paddingVertical: 28 }}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <T v="h3" center>{title}</T>
      {body ? <T c={colors.muted} center>{body}</T> : null}
      {cta ? <Button label={cta} onPress={onPress} style={{ marginTop: 8, alignSelf: "stretch" }} /> : null}
    </Card>
  );
}

export function Big({ emoji, size = 56 }: { emoji: string; size?: number }) {
  return <Text style={{ fontSize: size, textAlign: "center" }}>{emoji}</Text>;
}

export function Loading() {
  return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.accent} /></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  btnInner: { paddingVertical: 16, paddingHorizontal: 22, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  option: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 16, color: colors.text, fontSize: 16 },
});
