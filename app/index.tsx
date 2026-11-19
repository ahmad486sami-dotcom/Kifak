import { Redirect } from "expo-router";
import { useApp } from "@/store/app";

import { MIN_SECTIONS } from "@/lib/constants";

/** Decides where the user lands based on how far they've got. */
export default function Index() {
  const s = useApp();
  if (!s.session) return <Redirect href="/welcome" />;
  if (!s.me?.name) return <Redirect href="/onboarding" />;
  const done = s.myProfile?.completedSections.length ?? 0;
  if (done < MIN_SECTIONS) return <Redirect href="/quiz" />;
  if (!s.access) return <Redirect href="/paywall" />;
  if (!s.couple?.user_b) return <Redirect href="/connect" />;
  return <Redirect href="/home" />;
}
