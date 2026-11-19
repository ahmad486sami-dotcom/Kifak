import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import { t } from "../i18n";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPush(userId: string) {
  if (!Device.isDevice) return;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return;
  const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId;
  try {
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await supabase.from("profiles").update({ push_token: token }).eq("id", userId);
  } catch {}
}

/** Fire-and-forget push to partner */
export async function notifyPartner(kind: string, text?: string) {
  try {
    await supabase.functions.invoke("notify", { body: { kind, text } });
  } catch {}
}

/** Daily local reminders (re-scheduled on each launch so the language stays right) */
export async function scheduleReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: t("notif_daily_title"), body: t("notif_daily_body") },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 12, minute: 30 },
  });
  await Notifications.scheduleNotificationAsync({
    content: { title: t("notif_streak_title"), body: t("notif_streak_body") },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
  });
}
