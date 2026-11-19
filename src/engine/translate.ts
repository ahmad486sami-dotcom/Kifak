import type { Lang } from "../i18n";
import { g } from "../i18n";
import type { Profile } from "./scoring";

/**
 * "Translate my feelings": turns what you feel + what you need into a message
 * phrased the way your partner hears best (from their quiz profile).
 * Runs fully on-device. Arabic markers: {m|f} = sender, [m|f] = partner.
 */
const FEEL: Record<string, { en: string; ar: string }> = {
  hurt: { en: "a bit hurt", ar: "{مجروح|مجروحة} شوي" },
  ignored: { en: "a little ignored", ar: "{متجاهَل|متجاهَلة} شوي" },
  overwhelmed: { en: "really overwhelmed", ar: "{مضغوط|مضغوطة} كثير" },
  lonely: { en: "kind of lonely", ar: "{وحيد|وحيدة} شوي" },
  jealous: { en: "a bit jealous", ar: "{غيران|غيرانة} شوي" },
  unappreciated: { en: "a little unappreciated", ar: "مش {مقدَّر|مقدَّرة} كفاية" },
  anxious: { en: "anxious about us", ar: "{قلقان|قلقانة} علينا" },
  angry: { en: "upset", ar: "{زعلان|زعلانة}" },
};

const NEED: Record<string, { en: string; ar: string }> = {
  listen: { en: "I just need you to listen.", ar: "بس بحتاج[ك تسمعني|كِ تسمعيني]." },
  reassure: { en: "I need a little reassurance that we're good.", ar: "بحتاج شوية طمأنينة إنه إحنا تمام." },
  time: { en: "I'd love some time with just us.", ar: "بحب يكون عنا وقت إلنا لحالنا." },
  help: { en: "I could really use your help with something.", ar: "بحتاج مساعدت[ك|كِ] بشي." },
  space: { en: "I need a little space — it's not about you.", ar: "بحتاج شوية مساحة، ومش إل[ك|كِ] علاقة." },
  hug: { en: "Honestly, I just need a hug.", ar: "بصراحة، بس بحتاج حضن." },
  apology: { en: "I think I need an apology so I can let it go.", ar: "حاسس إني بحتاج اعتذار حتى إقدر إنسى." },
};

export function composeMessage(opts: { feeling: string; need: string; detail?: string; partner: Profile | null; lang: Lang; me: "m" | "f"; them: "m" | "f" }) {
  const { feeling, need, detail, partner, lang, me, them } = opts;
  const p = partner?.traits;
  const soft = !!p && (p.withdraw > 0.25 || p.avoidant > 0.25 || p.heat > 0.3);
  const direct = !!p && p.direct > 0.3;
  const love = partner?.loveWant ?? "words";

  if (lang === "en") {
    const open = soft ? "Hey, no pressure at all — " : direct ? "I want to be straight with you: " : "Hey love, ";
    const feel = `I've been feeling ${FEEL[feeling]?.en ?? "off"}${detail ? ` ${detail.trim().replace(/[.!]+$/, "")}` : ""}.`;
    const ask = NEED[need]?.en ?? "";
    const close = {
      words: "I love you and I want us to be good.",
      time: "Can we have a bit of time tonight, just us?",
      gifts: "You mean a lot to me — I just wanted you to know.",
      acts: "You don't have to fix anything — I just wanted you to know.",
      touch: "Come find me later? 🤍",
    }[need === love || (need === "time" && love === "time") ? "words" : love];
    return `${open}${feel} ${ask} ${close}`.replace(/\s+/g, " ").trim();
  }
  const open = soft ? "بدون أي ضغط، " : direct ? "بدي كون صريح معك: " : "حبيب[ي|تي]، ";
  const feel = `حاسس حالي ${FEEL[feeling]?.ar ?? "مش على بعضي"}${detail ? ` ${detail.trim()}` : ""}.`;
  const ask = NEED[need]?.ar ?? "";
  const close = {
    words: "بحب[ك|كِ] وبدي نكون تمام.",
    time: "منقدر ناخد شوية وقت الليلة، إلنا بس؟",
    gifts: "إن[ت|تِ] بتعني[لي|لي] كثير، بس حبيت [تعرف|تعرفي].",
    acts: "مش لازم [تصلّح|تصلّحي] شي، بس حبيت [تعرف|تعرفي].",
    touch: "[تعال|تعالي] لعندي بعدين؟ 🤍",
  }[need === love ? "words" : love];
  const raw = `${open}${feel} ${ask} ${close}`.replace("حاسس حالي", "{حاسس|حاسة} حالي").replace("بدي كون صريح", "بدي كون {صريح|صريحة}").replace("حاسس إني", "{حاسس|حاسة} إني");
  return g(raw.replace(/\s+/g, " ").trim(), me, them);
}
