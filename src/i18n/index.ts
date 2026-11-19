import { I18nManager, Alert } from "react-native";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { strings, StringKey } from "./strings";

export type Lang = "en" | "ar";
/** Bilingual text used across content files */
export type L = { en: string; ar: string };

const KEY = "lang";

type LangState = { lang: Lang; ready: boolean };
export const useLang = create<LangState>(() => ({
  lang: (Localization.getLocales()[0]?.languageCode === "ar" ? "ar" : "en") as Lang,
  ready: false,
}));

export async function loadLang() {
  const saved = (await AsyncStorage.getItem(KEY)) as Lang | null;
  if (saved) useLang.setState({ lang: saved });
  const lang = useLang.getState().lang;
  const wantRTL = lang === "ar";
  if (I18nManager.isRTL !== wantRTL) {
    I18nManager.allowRTL(wantRTL);
    I18nManager.forceRTL(wantRTL);
  }
  useLang.setState({ ready: true });
}

export async function setLang(lang: Lang) {
  await AsyncStorage.setItem(KEY, lang);
  useLang.setState({ lang });
  const wantRTL = lang === "ar";
  if (I18nManager.isRTL !== wantRTL) {
    I18nManager.allowRTL(wantRTL);
    I18nManager.forceRTL(wantRTL);
    // Text switches now; the right-to-left layout flips after the app is reopened
    Alert.alert(
      lang === "ar" ? "تم تغيير اللغة" : "Language changed",
      lang === "ar" ? "سكّر التطبيق وافتحه من جديد ليصير الاتجاه من اليمين لليسار." : "Close and reopen Kifak to finish switching the layout.",
    );
  }
}

/** reader + partner gender for Arabic UI strings (set by the store after loading profiles) */
let G: { self: "m" | "f"; other: "m" | "f" } = { self: "m", other: "f" };
export function setGenders(self: "m" | "f", other: "m" | "f") {
  G = { self, other };
}

/** Translate a UI string key, with {vars}. Arabic gender markers resolve to reader/partner. */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  const lang = useLang.getState().lang;
  let s: string = strings[key]?.[lang] ?? strings[key]?.en ?? key;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return lang === "ar" ? g(s, G.self, G.other) : s;
}

/** Pick the right language from bilingual content */
export function tr(text: L | undefined, vars?: Record<string, string | number>): string {
  if (!text) return "";
  const lang = useLang.getState().lang;
  let s = text[lang] || text.en;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

/** Hook so screens re-render on language change */
export function useT() {
  const lang = useLang((s) => s.lang);
  return { t, tr, lang, isAr: lang === "ar" };
}

export type Gender = "m" | "f";
/**
 * Arabic gender markers:
 *   {masc|fem}  → resolved by `self` (the speaker / the person reading)
 *   [masc|fem]  → resolved by `other` (their partner)
 */
export function g(s: string, self: Gender = "m", other: Gender = "m"): string {
  return s
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (self === "f" ? f : m))
    .replace(/\[([^\[\]|]*)\|([^\[\]|]*)\]/g, (_, m, f) => (other === "f" ? f : m));
}

/** tr + gender resolution */
export function trg(text: L | undefined, self: Gender, other: Gender, vars?: Record<string, string | number>): string {
  return g(tr(text, vars), self, other);
}
