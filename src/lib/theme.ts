export const colors = {
  bg: "#0E0B12",
  card: "#1A1520",
  card2: "#241C2C",
  border: "#2E2537",
  text: "#F6F1F7",
  muted: "#A99BB3",
  faint: "#6E6278",
  accent: "#FF6B6B",
  accent2: "#FFB86B",
  love: "#FF4D8D",
  ok: "#5AD19A",
  warn: "#FFC857",
  blue: "#7AA2FF",
};

export const gradient = ["#FF6B6B", "#FF4D8D"] as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
export const space = (n: number) => n * 4;

export const font = {
  h1: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "800" as const },
  h3: { fontSize: 17, fontWeight: "700" as const },
  body: { fontSize: 15, fontWeight: "500" as const },
  small: { fontSize: 13, fontWeight: "500" as const },
  tiny: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.6 },
};
