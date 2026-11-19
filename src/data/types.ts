import type { L } from "../i18n";

export const TRAITS = [
  "anxious", "avoidant", "pursue", "withdraw", "heat", "repairFast", "direct", "space", "contact",
  "words", "time", "gifts", "acts", "touch",
  "sWords", "sTime", "sGifts", "sActs", "sTouch",
  "social", "planner", "adventure", "romance", "public", "morning",
] as const;
export type Trait = (typeof TRAITS)[number];
export type Weights = Partial<Record<Trait, number>>;

export type SectionId = "attach" | "conflict" | "love" | "signals" | "moods" | "needs" | "life";

export type Option = { id: string; label: L; emoji?: string; w?: Weights };

export type Question = {
  id: string;
  section: SectionId;
  kind: "scale" | "choice";
  text: L;
  /** scale: weights multiplied by (value-3)/2  → -1..+1 */
  w?: Weights;
  options?: Option[];
  /** links this answer to a decoder situation */
  decodes?: { situation: string; part: "meaning" | "want" };
};

export type Section = { id: SectionId; title: L; subtitle: L; emoji: string };
