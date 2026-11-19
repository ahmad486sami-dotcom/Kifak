import React from "react";
import { Text } from "react-native";
import { Tabs, Redirect } from "expo-router";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { useApp } from "@/store/app";

const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{e}</Text>;

export default function TabsLayout() {
  const { t } = useT();
  const session = useApp((s) => s.session);
  const linked = useApp((s) => !!s.couple?.user_b);
  const access = useApp((s) => s.access);
  if (!session) return <Redirect href="/welcome" />;
  if (!linked) return <Redirect href="/" />;
  if (!access) return <Redirect href="/paywall" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 86, paddingTop: 8 },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t("tab_home"), tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="decode" options={{ title: t("tab_decode"), tabBarIcon: icon("🔓") }} />
      <Tabs.Screen name="plan" options={{ title: t("tab_plan"), tabBarIcon: icon("🗓️") }} />
      <Tabs.Screen name="us" options={{ title: t("tab_us"), tabBarIcon: icon("💞") }} />
      <Tabs.Screen name="me" options={{ title: t("tab_me"), tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
