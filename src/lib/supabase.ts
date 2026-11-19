import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const supabase = createClient(extra.supabaseUrl ?? "", extra.supabaseAnonKey ?? "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (s) => {
  if (s === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export const APP_GROUP = extra.appGroup ?? "group.com.kifak.app";

/** Local calendar day, YYYY-MM-DD */
export function today(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Upload a local file (photo/voice) into the couple's private folder */
export async function uploadCoupleFile(coupleId: string, localUri: string, ext: string, contentType: string) {
  const path = `${coupleId}/${uuid()}.${ext}`;
  const res = await fetch(localUri);
  const buf = await res.arrayBuffer();
  const { error } = await supabase.storage.from("couple").upload(path, buf, { contentType });
  if (error) throw error;
  return path;
}

export async function signedUrl(path: string) {
  const { data } = await supabase.storage.from("couple").createSignedUrl(path, 3600);
  return data?.signedUrl;
}
