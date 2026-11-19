import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { loadAll, useApp, subscribeRealtime, isLinked, unsubscribeRealtime } from "@/store/app";
import { loadLang, useLang } from "@/i18n";
import { initBilling } from "@/lib/billing";
import { registerPush, scheduleReminders } from "@/lib/notifications";
import { Loading } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function Root() {
  const langReady = useLang((s) => s.ready);
  const ready = useApp((s) => s.ready);
  const uid = useApp((s) => s.session?.user.id);
  const linked = useApp((s) => !!s.couple?.user_b);

  useEffect(() => {
    loadLang().then(loadAll);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") loadAll();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;
    initBilling(uid);
    registerPush(uid);
    scheduleReminders().catch(() => {});
  }, [uid]);

  useEffect(() => {
    if (linked && isLinked()) subscribeRealtime();
    else unsubscribeRealtime();
  }, [linked]);

  if (!langReady || !ready) return <Loading />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: "fade_from_bottom" }}>
        <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
        <Stack.Screen name="notes/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="plan/event" options={{ presentation: "modal" }} />
        <Stack.Screen name="us/memory" options={{ presentation: "modal" }} />
        <Stack.Screen name="conflict" options={{ presentation: "fullScreenModal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
