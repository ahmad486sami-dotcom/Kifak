import { Redirect, useLocalSearchParams } from "expo-router";
import { useApp } from "@/store/app";

/** Deep link: kifak://join/ABC123 */
export default function JoinLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const session = useApp((s) => s.session);
  if (!session) return <Redirect href="/welcome" />;
  return <Redirect href={{ pathname: "/connect", params: { code: String(code ?? "") } }} />;
}
