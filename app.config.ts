import { ExpoConfig } from "expo/config";

// ---- Rename the app here (one place) ----
export const APP_NAME = "Kifak";
export const APP_NAME_AR = "كيفك";
const BUNDLE_ID = "com.kifak.app";
const APP_GROUP = "group.com.kifak.app";
// Public client keys (safe to ship — data is protected by row-level security). Override with .env if needed.
const SUPABASE_URL = "https://prkpoolfoduzcrgtdxrh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya3Bvb2xmb2R1emNyZ3RkeHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDgzNDIsImV4cCI6MjEwODQyNDM0Mn0.oVtct7pQMLkm-PJWj_oNcUtTOcchMUatsb6l2s8N6TM";

const config: ExpoConfig = {
  name: APP_NAME,
  slug: "kifak",
  scheme: "kifak",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0E0B12",
  },
  platforms: ["ios"],
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: false,
    usesAppleSignIn: true,
    entitlements: {
      "com.apple.security.application-groups": [APP_GROUP],
    },
    infoPlist: {
      NSMicrophoneUsageDescription:
        "Record voice notes for your partner. / سجّل رسائل صوتية لشريكك.",
      NSPhotoLibraryUsageDescription:
        "Add photos to your shared memories. / ضيف صور لذكرياتكم.",
      NSCameraUsageDescription:
        "Take photos for your shared memories. / صوّر لحظاتكم وضيفها لذكرياتكم.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-apple-authentication",
    [
      "expo-notifications",
      { color: "#FF6B6B" },
    ],
    [
      "expo-audio",
      { microphonePermission: "Record voice notes for your partner." },
    ],
    "expo-image-picker",
    "@bacons/apple-targets",
  ],
  experiments: { typedRoutes: false },
  extra: {
    appGroup: APP_GROUP,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    billingIosKey: process.env.EXPO_PUBLIC_BILLING_IOS_KEY,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
};

export default config;
