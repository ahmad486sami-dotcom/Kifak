import type { L } from "../i18n";
import type { Profile, LoveLang } from "./scoring";

/**
 * Match report, written from the reader's point of view:
 *   "you" = reader ({m|f} markers), {name} = partner ([m|f] markers)
 */
export type MatchItem = { kind: "strength" | "clash" | "tip"; emoji: string; title: L; body: L };
export type MatchReport = { score: number; items: MatchItem[]; headline: L };

const LOVE_NAME: Record<LoveLang, L> = {
  words: { en: "words", ar: "الكلام" },
  time: { en: "quality time", ar: "الوقت سوا" },
  gifts: { en: "little gifts", ar: "الهدايا الصغيرة" },
  acts: { en: "doing things for each other", ar: "الأفعال والمساعدة" },
  touch: { en: "touch and hugs", ar: "اللمسة والحضن" },
};

const item = (kind: MatchItem["kind"], emoji: string, tEn: string, tAr: string, bEn: string, bAr: string): MatchItem => ({
  kind, emoji, title: { en: tEn, ar: tAr }, body: { en: bEn, ar: bAr },
});

export function buildMatch(me: Profile, partner: Profile): MatchReport {
  const a = me.traits, b = partner.traits;
  const items: MatchItem[] = [];

  // ── Attachment ──
  const meAnx = a.anxious > 0.25, meAvo = a.avoidant > 0.25, pAnx = b.anxious > 0.25, pAvo = b.avoidant > 0.25;
  if ((meAnx && pAvo) || (meAvo && pAnx)) {
    const chaser = meAnx ? "you" : "them";
    items.push(chaser === "you"
      ? item("clash", "🔁", "The chase loop", "دوامة الملاحقة",
        "When {name} pulls back, you lean in — and that makes {name} pull back more. Agree on a signal for 'I need space, but we're okay'.",
        "لما {name} [يبعد|تبعد]، {إنت بتقرب|إنتِ بتقربي} أكثر، وهاد بيخلي[ه يبعد|ها تبعد] أكثر. اتفقوا على إشارة يعني «بحتاج مساحة بس إحنا تمام».")
      : item("clash", "🔁", "The chase loop", "دوامة الملاحقة",
        "When you pull back, {name} leans in harder. A quick 'I'm okay, just need a bit' stops the spiral.",
        "لما {تبعد|تبعدي}، {name} [بيقرب|بتقرب] أكثر. جملة سريعة «أنا تمام، بس بحتاج شوي» بتوقف الدوامة."));
  } else if (!meAnx && !meAvo && !pAnx && !pAvo) {
    items.push(item("strength", "🧱", "Solid ground", "أرض ثابتة",
      "You both feel secure. You can handle distance and closeness without panic — that's rare.",
      "إنتوا الثنين حاسين بالأمان. بتقدروا تتعاملوا مع البعد والقرب بدون قلق، وهاد شي نادر."));
  } else if (meAnx && pAnx) {
    items.push(item("tip", "🫶", "Double reassurance", "طمأنينة مضاعفة",
      "You both need to hear it. Say it often — it costs nothing and keeps you both calm.",
      "إنتوا الثنين بتحتاجوا تسمعوها. قولوها كثير، ما بتكلف شي وبتريحكم."));
  } else if (meAvo && pAvo) {
    items.push(item("clash", "🌫️", "Quiet drift", "البعد الهادي",
      "You both give space so well that you can drift. Schedule check-ins — the daily question helps.",
      "إنتوا الثنين بتعطوا مساحة لدرجة إنكم ممكن تبعدوا. حطوا وقت ثابت تحكوا فيه، والسؤال اليومي بيساعد."));
  }

  // ── Conflict ──
  if (a.pursue > 0.25 && b.withdraw > 0.25) {
    items.push(item("clash", "⏱️", "Talk now vs. need time", "هلق ولا بعدين",
      "You want to fix it now, {name} needs time. Rule: {name} gets 30 minutes, then you both come back to it.",
      "{إنت بدك|إنتِ بدك} تحلوها هلق، و{name} [بيحتاج|بتحتاج] وقت. القاعدة: {name} [بياخد|بتاخد] ٣٠ دقيقة، وبعدين بترجعوا تحكوا."));
  } else if (a.withdraw > 0.25 && b.pursue > 0.25) {
    items.push(item("clash", "⏱️", "Need time vs. talk now", "بعدين ولا هلق",
      "{name} wants to fix it now, you need time. Tell {name} when you'll be ready — the waiting is what hurts.",
      "{name} [بدو|بدها] تحلوها هلق، و{إنت بتحتاج|إنتِ بتحتاجي} وقت. {قول|قولي} لـ{name} إمتى رح تكون {جاهز|جاهزة}، الانتظار هو اللي بيوجع."));
  } else if (a.pursue > 0.25 && b.pursue > 0.25) {
    items.push(item("strength", "🗣️", "You talk it out", "بتحكوها",
      "You both face problems head-on. Fights don't linger.",
      "إنتوا الثنين بتواجهوا المشاكل على طول. الزعل ما بيطوّل عندكم."));
  } else if (a.withdraw > 0.25 && b.withdraw > 0.25) {
    items.push(item("clash", "🤐", "Things go unsaid", "أشياء ما بتنقال",
      "You both go quiet in conflict. Use Conflict mode's one-sentence rule so things actually get said.",
      "إنتوا الثنين بتسكتوا وقت الزعل. استعملوا قاعدة «جملة لكل واحد» حتى الأشياء تنقال فعلاً."));
  }
  if (a.heat > 0.3 && b.heat > 0.3) {
    items.push(item("clash", "🌋", "Two volcanoes", "بركانين",
      "You both run hot. Agree that either of you can call a pause — no questions asked.",
      "إنتوا الثنين بتولّعوا بسرعة. اتفقوا إنه أي واحد فيكم بيقدر يطلب وقفة، بدون نقاش."));
  } else if (b.heat > 0.3 && a.withdraw > 0.25) {
    items.push(item("tip", "🔉", "Volume check", "انتبهوا للصوت",
      "{name} gets loud fast, and raised voices shut you down. {name} cools quickly — wait 10 minutes.",
      "{name} [بيعلّي|بتعلّي] صوت[ه|ها] بسرعة، والصوت العالي بيسكّرك. {name} [بيهدى|بتهدى] بسرعة، {استنى|استني} ١٠ دقايق."));
  }
  if (a.repairFast > 0.3 && b.repairFast > 0.3) {
    items.push(item("strength", "🩹", "Fast makers-up", "بتتصالحوا بسرعة",
      "Neither of you holds grudges for long.", "ما حدا فيكم بيحمل بقلبه كثير."));
  }

  // ── Love languages ──
  if (partner.loveShow === me.loveWant) {
    items.push(item("strength", "💘", "Love lands", "الحب واصل",
      `{name} shows love through ${LOVE_NAME[partner.loveShow].en} — exactly how you feel it.`,
      `{name} [بيعبّر|بتعبّر] عن الحب بـ${LOVE_NAME[partner.loveShow].ar}، وهي بالضبط الطريقة اللي {بتحس|بتحسي} فيها.`));
  } else {
    items.push(item("tip", "📮", "Lost in translation", "ضايع بالترجمة",
      `{name} shows love through ${LOVE_NAME[partner.loveShow].en}, but you feel it most through ${LOVE_NAME[me.loveWant].en}. Tell {name} — and notice what they already do.`,
      `{name} [بيعبّر|بتعبّر] عن الحب بـ${LOVE_NAME[partner.loveShow].ar}، بس {إنت بتحس|إنتِ بتحسي} فيه أكثر بـ${LOVE_NAME[me.loveWant].ar}. {قول|قولي} لـ[ه|ها]، و{انتبه|انتبهي} للي [بيعمله|بتعمله] أصلاً.`));
  }
  if (me.loveShow !== partner.loveWant) {
    items.push(item("tip", "🎯", "Aim your love", "وجّه حبك صح",
      `{name} feels most loved through ${LOVE_NAME[partner.loveWant].en}. Do more of that this week.`,
      `{name} [بيحس|بتحس] بالحب أكثر بـ${LOVE_NAME[partner.loveWant].ar}. {اعمل|اعملي} منها أكثر هالأسبوع.`));
  }

  // ── Texting & space ──
  if (Math.abs(a.contact - b.contact) > 0.6) {
    const meMore = a.contact > b.contact;
    items.push(item("clash", "📲", "Texting gap", "فرق بالرسايل",
      meMore ? "You like to text through the day, {name} doesn't need to. A good-morning and a check-in at lunch keeps you both happy."
             : "{name} loves texting through the day, you don't need to. A good-morning and one check-in goes a long way.",
      meMore ? "{إنت بتحب|إنتِ بتحبي} الرسايل طول اليوم، و{name} ما [بيحتاجها|بتحتاجها]. «صباح الخير» ورسالة عالغدا بتريحكم الثنين."
             : "{name} [بيحب|بتحب] الرسايل طول اليوم، و{إنت ما بتحتاجها|إنتِ ما بتحتاجيها}. «صباح الخير» ورسالة وحدة بتفرق كثير."));
  }
  if (b.space > 0.4 && a.contact > 0.3) {
    items.push(item("tip", "🚪", "Space isn't distance", "المساحة مش بعد",
      "{name} recharges alone. It's not about you — let it happen without guilt.",
      "{name} [بيشحن|بتشحن] طاقت[ه|ها] لحال[ه|ها]. مش إلك علاقة، {اترك|اتركي}[ه|ها] بدون تأنيب."));
  }
  if (a.space > 0.4 && b.contact > 0.3) {
    items.push(item("tip", "🔋", "Say you're recharging", "قول إنك عم تشحن",
      "You need alone time and {name} needs contact. A quick 'recharging, love you' makes it painless.",
      "{إنت بتحتاج|إنتِ بتحتاجي} وقت لحالك و{name} [بيحتاج|بتحتاج] تواصل. رسالة سريعة «عم إشحن، بحبك» بتحل كل شي."));
  }

  // ── Lifestyle ──
  if (Math.abs(a.social - b.social) > 0.7) {
    items.push(item("tip", "🎉", "Party vs. couch", "سهرة ولا كنباية",
      "One of you charges up with people, the other at home. Alternate weekends.",
      "واحد فيكم بيشحن مع الناس، والثاني بالبيت. بدّلوا الويكندات."));
  }
  if (a.planner < -0.2 && b.planner < -0.2) {
    items.push(item("tip", "🗓️", "Nobody plans", "ما حدا بيخطط",
      "You're both spontaneous — fun, until nothing happens. Use the planner once a week.",
      "إنتوا الثنين عفويين، حلو لحد ما ما يصير شي. استعملوا المخطط مرة بالأسبوع."));
  } else if (Math.abs(a.planner - b.planner) > 0.8) {
    items.push(item("tip", "🧭", "Planner meets free spirit", "المخطط والعفوي",
      "One of you likes plans, the other likes surprises. Plan the day, leave the evening open.",
      "واحد بيحب الخطط والثاني بيحب المفاجآت. خططوا النهار وخلوا السهرة مفتوحة."));
  }
  if (a.adventure > 0.3 && b.adventure > 0.3) {
    items.push(item("strength", "🏔️", "Adventure buddies", "رفقاء مغامرة",
      "You both love trying new things. Hatta, Jais, a new cuisine — say yes.",
      "إنتوا الثنين بتحبوا تجربوا أشياء جديدة. حتا، جيس، مطبخ جديد — قولوا أيوا."));
  }
  if (a.direct > 0.3 && b.direct > 0.3) {
    items.push(item("strength", "🔦", "Straight talkers", "صريحين",
      "You both say what you mean. Fewer guessing games.", "إنتوا الثنين بتقولوا اللي بتقصدوه. ألغاز أقل."));
  }
  if (Math.abs(a.public - b.public) > 0.8) {
    items.push(item("tip", "📸", "Post or private?", "ننشر ولا لا؟",
      "One of you wants to share the relationship online, the other doesn't. Agree on what's okay to post.",
      "واحد بدو ينشر العلاقة عالسوشال والثاني لا. اتفقوا شو مسموح ينحط."));
  }

  const strengths = items.filter((i) => i.kind === "strength").length;
  const clashes = items.filter((i) => i.kind === "clash").length;
  const score = Math.max(58, Math.min(97, 74 + strengths * 6 - clashes * 4));
  const headline: L =
    score >= 88 ? { en: "You two just get each other.", ar: "إنتوا فاهمين بعض من غير حكي." }
    : score >= 76 ? { en: "Strong match — with a few things to learn.", ar: "توافق قوي، مع كم شغلة لازم تتعلموها." }
    : { en: "Different wiring. That's what this app is for.", ar: "مختلفين بالطبع، وعشان هيك هالتطبيق موجود." };
  return { score, items, headline };
}
