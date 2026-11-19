import { Platform } from "react-native";
import { APP_GROUP } from "./supabase";

/**
 * Pushes a small snapshot into the shared App Group so the home-screen widgets
 * (targets/widget) can show it. Keys must match KifakWidget.swift.
 */
export type WidgetSnapshot = {
  streak: number;
  todayDone: boolean;
  whoseTurn: "you" | "partner" | "both" | "none";
  partnerName: string;
  partnerMood: string; // emoji
  partnerMoodLabel: string;
  question: string;
  answeredToday: boolean;
  countdownTitle: string;
  countdownDate: string; // ISO or ""
  togetherSince: string; // YYYY-MM-DD or ""
  lang: "en" | "ar";
};

export function syncWidget(data: WidgetSnapshot) {
  if (Platform.OS !== "ios") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ExtensionStorage } = require("@bacons/apple-targets");
    const storage = new ExtensionStorage(APP_GROUP);
    storage.set("kifak_widget", JSON.stringify(data));
    ExtensionStorage.reloadWidget();
  } catch {
    // widgets aren't available in Expo Go — fine
  }
}
