import type { Question, Section, Option, Weights, SectionId } from "./types";

export const SECTIONS: Section[] = [
  { id: "attach", emoji: "🧲", title: { en: "How I attach", ar: "كيف أتعلّق" }, subtitle: { en: "Closeness, space and what makes you feel safe", ar: "القرب، المساحة، وشو بيخليك ترتاح" } },
  { id: "conflict", emoji: "⚡", title: { en: "How I fight", ar: "كيف أزعل" }, subtitle: { en: "What you do when things get heated", ar: "شو بتعمل لما توصل للزعل" } },
  { id: "love", emoji: "💌", title: { en: "How I love", ar: "كيف أحب" }, subtitle: { en: "How you show love and how you feel it", ar: "كيف تعبّر عن حبك وكيف تحس فيه" } },
  { id: "signals", emoji: "📡", title: { en: "My signals", ar: "إشاراتي" }, subtitle: { en: "What your quiet, your 'ok' and your cancels really mean", ar: "شو يعني سكوتك، و«أوكي»، ولما تلغي" } },
  { id: "moods", emoji: "🌦️", title: { en: "My moods", ar: "مزاجي" }, subtitle: { en: "Stress, sadness and the little things", ar: "الضغط، الزعل، والتفاصيل الصغيرة" } },
  { id: "needs", emoji: "🛟", title: { en: "My needs", ar: "احتياجاتي" }, subtitle: { en: "Triggers, deal breakers and what you can't live without", ar: "اللي بيضايقك، الخطوط الحمرا، واللي ما تستغني عنه" } },
  { id: "life", emoji: "🌍", title: { en: "My life style", ar: "أسلوب حياتي" }, subtitle: { en: "Plans, weekends, money and phones", ar: "الخطط، الويكند، الفلوس والجوال" } },
];

const o = (id: string, en: string, ar: string, w?: Weights, emoji?: string): Option => ({ id, label: { en, ar }, w, emoji });
const scale = (id: string, section: SectionId, en: string, ar: string, w: Weights): Question => ({ id, section, kind: "scale", text: { en, ar }, w });
const choice = (id: string, section: SectionId, en: string, ar: string, options: Option[], decodes?: Question["decodes"]): Question => ({ id, section, kind: "choice", text: { en, ar }, options, decodes });

export const SCALE_LABELS = [
  { en: "Not me", ar: "مش أنا" },
  { en: "Rarely", ar: "نادراً" },
  { en: "Sometimes", ar: "أحياناً" },
  { en: "Often", ar: "غالباً" },
  { en: "Totally me", ar: "أنا بالضبط" },
];

export const QUESTIONS: Question[] = [
  // ───────────── ATTACH ─────────────
  scale("a1", "attach", "When my partner doesn't reply for a few hours, I start overthinking.", "لما [شريكي|شريكتي] ما [يرد|ترد] كم ساعة، بلّش فكّر كثير.", { anxious: 1, contact: 0.5 }),
  scale("a2", "attach", "I need to hear \"I love you\" often to feel secure.", "أحتاج أسمع «بحبك» كثير عشان أحس بالأمان.", { anxious: 0.7, words: 0.4 }),
  scale("a3", "attach", "When things get close too fast, I want to pull back.", "لما الأمور تقرب بسرعة، بحس إني بدي أبعد شوي.", { avoidant: 1 }),
  scale("a4", "attach", "I find it easy to depend on my partner.", "سهل علي إعتمد على [شريكي|شريكتي].", { avoidant: -0.8, anxious: -0.2 }),
  scale("a5", "attach", "I sometimes worry my partner cares less than I do.", "أحياناً بخاف إنه [شريكي يهتم|شريكتي تهتم] أقل مني.", { anxious: 1 }),
  scale("a6", "attach", "I keep my problems to myself rather than share them.", "بخلي مشاكلي لنفسي بدل ما أحكيها.", { avoidant: 0.8, direct: -0.4 }),
  scale("a7", "attach", "I feel calm and secure in my relationship most of the time.", "أغلب الوقت بحس بهدوء وأمان بعلاقتي.", { anxious: -0.8, avoidant: -0.3 }),
  scale("a8", "attach", "I need my own space, even when things are great.", "أحتاج مساحتي حتى لو كل شي تمام.", { space: 1, avoidant: 0.3 }),
  scale("a9", "attach", "If my partner seems distant, I try harder to get close.", "إذا [شريكي بيّن بعيد|شريكتي بيّنت بعيدة]، بحاول قرّب أكثر.", { pursue: 0.8, anxious: 0.5 }),
  scale("a10", "attach", "Talking about feelings makes me uncomfortable.", "الحكي عن المشاعر بيضايقني.", { avoidant: 0.7, direct: -0.3 }),

  // ───────────── CONFLICT ─────────────
  choice("c1", "conflict", "In an argument, I usually…", "وقت النقاش أو الزعل، عادةً أنا…", [
    o("talk_now", "Want to talk it out right now", "بدي نحكي فيها هلق", { pursue: 1, repairFast: 0.5 }, "🗣️"),
    o("go_quiet", "Go quiet and need time", "بسكت وبحتاج وقت", { withdraw: 1 }, "🤐"),
    o("loud_fast", "Get loud, then calm down fast", "بعلّي صوتي وبعدين بهدى بسرعة", { heat: 1, repairFast: 0.6 }, "🌋"),
    o("pretend", "Act like everything's fine", "بتصرف كأنه ما في شي", { withdraw: 0.6, avoidant: 0.5, direct: -0.5 }, "🙂"),
    o("emotional", "Get emotional or teary", "بتأثر وممكن أبكي", { anxious: 0.4, heat: 0.3 }, "🥺"),
  ]),
  scale("c2", "conflict", "I can't sleep if we go to bed angry.", "ما بقدر أنام إذا نمنا زعلانين.", { pursue: 0.8, repairFast: 0.7 }),
  scale("c3", "conflict", "I need a few hours before I can talk calmly after a fight.", "بعد الزعل أحتاج كم ساعة لحتى أقدر أحكي بهدوء.", { withdraw: 0.8, repairFast: -0.8 }),
  scale("c4", "conflict", "When I'm angry, I say things I don't mean.", "لما أعصّب، بقول أشياء ما بقصدها.", { heat: 1 }),
  scale("c6", "conflict", "I'm usually the first to apologize.", "عادةً أنا {أول واحد|أول وحدة} بعتذر.", { repairFast: 0.6 }),
  scale("c7", "conflict", "I'd rather say exactly what's wrong than drop hints.", "بفضّل أقول شو المشكلة بالضبط بدل التلميح.", { direct: 1 }),
  scale("c8", "conflict", "I hold onto things and bring them up later.", "بخزّن الأشياء وبرجع بفتحها بعدين.", { heat: 0.3, repairFast: -0.6 }),
  scale("c9", "conflict", "Raised voices make me shut down.", "الصوت العالي بيخليني أسكّر على حالي.", { withdraw: 0.8 }),
  choice("c10", "conflict", "When my partner is upset with me, I first…", "لما [شريكي يكون زعلان|شريكتي تكون زعلانة] مني، أول شي…", [
    o("ask", "Ask what's wrong", "بسأل[ه شو فيه|ها شو فيها]", { pursue: 0.5, direct: 0.5 }, "❓"),
    o("space", "Give them space", "بعطي[ه|ها] مساحة", { withdraw: 0.3, space: 0.3 }, "🚪"),
    o("joke", "Try to make them laugh", "بحاول ضحّك[ه|ها]", { social: 0.3 }, "😜"),
    o("defend", "Get defensive", "بدافع عن حالي", { heat: 0.7 }, "🛡️"),
    o("sorry", "Apologize, even if I'm not sure why", "بعتذر حتى لو {مش عارف|مش عارفة} ليش", { anxious: 0.6 }, "🙏"),
  ]),
  scale("c11", "conflict", "I'd rather solve the problem than talk about feelings.", "بفضّل نحل المشكلة بدل ما نحكي بالمشاعر.", { acts: 0.3, direct: 0.3, avoidant: 0.3 }),

  // ───────────── LOVE ─────────────
  choice("l1", "love", "I feel most loved when my partner…", "بحس بالحب أكثر شي لما [شريكي|شريكتي]…", [
    o("words", "Tells me how they feel", "[يقلي شو حاسس|تقلي شو حاسة]", { words: 1.2 }, "💬"),
    o("time", "Gives me real, undistracted time", "[يعطيني|تعطيني] وقت حقيقي بدون جوال", { time: 1.2 }, "⏳"),
    o("gifts", "Surprises me with something", "[يفاجئني|تفاجئني] بشي", { gifts: 1.2 }, "🎁"),
    o("acts", "Helps me without me asking", "[يساعدني|تساعدني] بدون ما أطلب", { acts: 1.2 }, "🛠️"),
    o("touch", "Holds me, hugs me, stays close", "[يحضني ويضل قريب|تحضني وتضل قريبة] مني", { touch: 1.2 }, "🤗"),
  ]),
  choice("l2", "love", "I usually show love by…", "عادةً بعبّر عن حبي عن طريق…", [
    o("words", "Saying sweet things", "كلام حلو", { sWords: 1.2 }, "💬"),
    o("time", "Making time for us", "إني أفضّي وقت إلنا", { sTime: 1.2 }, "⏳"),
    o("gifts", "Buying or making little things", "هدايا صغيرة أو أشياء بعملها", { sGifts: 1.2 }, "🎁"),
    o("acts", "Doing things for them", "إني أعمل أشياء عنه", { sActs: 1.2 }, "🛠️"),
    o("touch", "Hugs and being close", "حضن وقرب", { sTouch: 1.2 }, "🤗"),
  ]),
  choice("l3", "love", "The best surprise would be…", "أحلى مفاجأة ممكن تكون…", [
    o("words", "A long letter or voice note", "رسالة طويلة أو فويس", { words: 0.8 }, "✉️"),
    o("time", "A whole day planned just for us", "يوم كامل مخطط إلنا", { time: 0.8 }, "📅"),
    o("gifts", "Something I mentioned once", "شي ذكرته مرة وحدة", { gifts: 0.8 }, "🎀"),
    o("acts", "They handled something I was dreading", "[يخلّص|تخلّص] عني شي كنت {مضغوط|مضغوطة} منه", { acts: 0.8 }, "✅"),
    o("touch", "A massage and cuddles", "مساج وحضن", { touch: 0.8 }, "💆"),
  ]),
  choice("l4", "love", "What hurts the most is when they…", "أكثر شي بيوجعني لما…", [
    o("words", "Never say how they feel", "ما [يعبّر أبداً عن مشاعره|تعبّر أبداً عن مشاعرها]", { words: 0.8 }, "🔇"),
    o("time", "Are always on their phone with me", "دايماً على [جواله وهو|جوالها وهي] معي", { time: 0.8 }, "📱"),
    o("gifts", "Forget important dates", "[ينسى|تنسى] المناسبات المهمة", { gifts: 0.6, time: 0.2 }, "📆"),
    o("acts", "Don't help when I'm drowning", "ما [يساعدني|تساعدني] وأنا {غرقان|غرقانة}", { acts: 0.8 }, "🌊"),
    o("touch", "Pull away when I reach for them", "[يبعد لما قرّب منه|تبعد لما قرّب منها]", { touch: 0.8 }, "🫥"),
  ]),
  scale("l5", "love", "Small gifts mean a lot to me, even cheap ones.", "الهدايا الصغيرة بتفرق معي كثير، حتى لو رخيصة.", { gifts: 1 }),
  scale("l6", "love", "Physical affection matters a lot to me.", "اللمسة والحضن بيفرقوا معي كثير.", { touch: 1 }),
  scale("l7", "love", "I'd rather they do something for me than say something sweet.", "بفضّل يعمل شي عشاني أكثر من كلام حلو.", { acts: 1, words: -0.5 }),
  scale("l8", "love", "Long talks mean more to me than going out.", "الحكي الطويل أهم عندي من الطلعات.", { time: 0.6, words: 0.3, social: -0.4 }),
  scale("l9", "love", "I'm a romantic at heart.", "أنا {رومانسي|رومانسية} من جوّا.", { romance: 1 }),
  choice("l10", "love", "When I do something sweet, I want them to…", "لما أعمل شي حلو، بدي [ياه|ياها]…", [
    o("say", "Notice it and say it", "[ينتبه ويقول|تنتبه وتقول]", { words: 0.6 }, "👀"),
    o("return", "Do something back", "[يرد|ترد] بشي", { acts: 0.4 }, "🔁"),
    o("excited", "Get excited about it", "[يتحمّس ويفرح|تتحمّس وتفرح]", { romance: 0.5 }, "🤩"),
    o("chill", "Not make a big deal", "ما [يكبّر|تكبّر] الموضوع", { avoidant: 0.2 }, "😌"),
  ]),
  scale("l11", "love", "I like to be told why I'm loved, not just that I am.", "بحب أعرف ليش {محبوب|محبوبة}، مش بس إني {محبوب|محبوبة}.", { words: 0.8 }),

  // ───────────── SIGNALS (decoder) ─────────────
  choice("s1m", "signals", "When I go quiet, it usually means…", "لما أسكت، غالباً يعني…", [
    o("tired", "I'm tired or drained", "{تعبان أو مرهق|تعبانة أو مرهقة}", {}, "😴"),
    o("upset", "I'm upset with you", "{زعلان|زعلانة} منك", {}, "😤"),
    o("overthinking", "I'm overthinking something", "عم فكّر كثير بشي", { anxious: 0.3 }, "🌀"),
    o("in_head", "I'm in my head — nothing's wrong", "{سرحان|سرحانة} بس، ما في شي", {}, "☁️"),
    o("notice", "I'm waiting for you to notice", "{ناطرك|ناطرتك} [تنتبه|تنتبهي]", { anxious: 0.3 }, "👀"),
  ], { situation: "goes_quiet", part: "meaning" }),
  choice("s1w", "signals", "When I'm quiet, I want you to…", "لما أكون {ساكت|ساكتة}، بدي ياك…", [
    o("space", "Give me space and check in later", "[تعطيني مساحة وتسأل|تعطيني مساحة وتسألي] عني بعدين", { space: 0.4 }, "🚪"),
    o("ask", "Ask me directly what's wrong", "[تسألني|تسأليني] على طول شو فيني", { direct: 0.3 }, "❓"),
    o("close", "Stay close, no pressure", "[تضل قريب|تضلي قريبة] بدون ضغط", { touch: 0.3 }, "🫶"),
    o("sweet", "Send me something sweet", "[تبعتلي|تبعتيلي] شي حلو", { words: 0.3 }, "💌"),
    o("distract", "Distract me or make me laugh", "[تلهيني أو تضحكني|تلهيني أو تضحكيني]", {}, "😂"),
  ], { situation: "goes_quiet", part: "want" }),

  choice("s2m", "signals", "When I text \"ok\" or \"k\", it usually means…", "لما أكتب «أوكي» أو «ك»، غالباً يعني…", [
    o("fine", "It's genuinely fine", "تمام فعلاً", {}, "👍"),
    o("busy", "I'm busy right now", "{مشغول|مشغولة} هلق", {}, "⏱️"),
    o("annoyed", "I'm a bit annoyed", "{متضايق|متضايقة} شوي", {}, "😒"),
    o("hurt", "I'm hurt but won't say it", "{متضايق|متضايقة} بس ما رح قول", {}, "💔"),
    o("blank", "I don't know what else to say", "ما بعرف شو بدي قول غير هيك", {}, "🤷"),
  ], { situation: "says_ok", part: "meaning" }),
  choice("s2w", "signals", "When I send a short \"ok\", I want you to…", "لما أبعت «أوكي» قصيرة، بدي ياك…", [
    o("face_value", "Take it at face value", "[تاخدها|تاخديها] زي ما هي", {}, "✅"),
    o("call", "Call me instead of texting", "[تتصل بدل ما تكتب|تتصلي بدل ما تكتبي]", { contact: 0.3 }, "📞"),
    o("ask", "Ask if everything's okay", "[تسألني|تسأليني] إذا كل شي تمام", {}, "🫣"),
    o("time", "Give me a bit of time", "[تعطيني|تعطيني] شوية وقت", { space: 0.3 }, "⏳"),
  ], { situation: "says_ok", part: "want" }),

  choice("s3m", "signals", "When I reply late, it's usually because…", "لما أتأخر بالرد، غالباً لأنه…", [
    o("busy", "I'm busy, not ignoring you", "{مشغول|مشغولة}، مش {متجاهلك|متجاهلتك}", {}, "💼"),
    o("full_attention", "I reply when I can give you full attention", "برد لما أقدر أعطيك كل انتباهي", {}, "🎯"),
    o("upset", "I'm upset", "{زعلان|زعلانة}", {}, "😶"),
    o("forgot", "I read it and forgot", "قريتها ونسيت", {}, "🙈"),
  ], { situation: "late_reply", part: "meaning" }),
  choice("s3w", "signals", "When I'm slow to reply, I want you to…", "لما أتأخر بالرد، بدي ياك…", [
    o("relax", "Not stress — I'll reply", "ما [تتوتر|تتوتري]، رح رد", {}, "😌"),
    o("nudge", "Send a quick \"busy?\"", "[تبعت «مشغول؟»|تبعتي «مشغولة؟»] سريعة", { contact: 0.2 }, "👋"),
    o("call_if_urgent", "Call if it's important", "[تتصل|تتصلي] إذا الموضوع مهم", {}, "📞"),
    o("no_double", "Not double text", "ما [تبعت|تبعتي] ورا بعض", { space: 0.3 }, "🙅"),
  ], { situation: "late_reply", part: "want" }),

  choice("s4m", "signals", "When I cancel plans, it usually means…", "لما ألغي طلعة، غالباً يعني…", [
    o("tired", "I'm genuinely exhausted", "فعلاً {تعبان|تعبانة}", {}, "🪫"),
    o("came_up", "Something actually came up", "طلع معي شي فعلاً", {}, "📌"),
    o("anxious", "I got anxious about the plan", "توترت من الطلعة", { anxious: 0.2 }, "😬"),
    o("stay_in", "I'd rather stay in with you", "بفضّل نقعد سوا بالبيت", { social: -0.3 }, "🛋️"),
    o("upset", "I'm upset about something", "{زعلان|زعلانة} من شي", {}, "😕"),
  ], { situation: "cancels", part: "meaning" }),
  choice("s4w", "signals", "When I cancel, I want you to…", "لما ألغي، بدي ياك…", [
    o("reschedule", "Reschedule with me", "نحدد موعد ثاني سوا", { planner: 0.3 }, "🗓️"),
    o("come_over", "Come over instead", "[تجي|تجي] لعندي بدالها", { time: 0.3 }, "🏠"),
    o("be_ok", "Be okay with it, no guilt trip", "[تتقبلها بدون ما تحسسني|تتقبليها بدون ما تحسسيني] بالذنب", {}, "🕊️"),
    o("ask", "Ask if something's wrong", "[تسألني|تسأليني] إذا في شي", {}, "❓"),
  ], { situation: "cancels", part: "want" }),

  choice("s5m", "signals", "When I say \"I'm fine\", it usually means…", "لما أقول «{أنا منيح|أنا منيحة}»، غالباً يعني…", [
    o("fine", "I really am fine", "فعلاً {منيح|منيحة}", {}, "🙂"),
    o("not_yet", "I'm not, but I'm not ready to talk", "{مش منيح، بس مش جاهز|مش منيحة، بس مش جاهزة} إحكي", {}, "🔒"),
    o("push", "I want you to push a little", "بدي ياك [تلحّ|تلحّي] شوي", { anxious: 0.2 }, "🫵"),
    o("no_fight", "I don't want this to become a fight", "ما بدي تصير مشكلة", { withdraw: 0.2 }, "🏳️"),
  ], { situation: "im_fine", part: "meaning" }),
  choice("s5w", "signals", "When I say \"I'm fine\" but I'm not, I want you to…", "لما أقول «{منيح|منيحة}» وأنا {مش منيح|مش منيحة}، بدي ياك…", [
    o("believe", "Believe me for now", "[تصدقني|تصدقيني] هلق", {}, "🤝"),
    o("ask_again", "Gently ask one more time", "[تسألني|تسأليني] مرة كمان بهدوء", {}, "🫶"),
    o("hug", "Just hug me", "بس [تحضني|تحضنيني]", { touch: 0.3 }, "🤗"),
    o("later", "Bring it up later when I'm calmer", "[تفتح|تفتحي] الموضوع بعدين لما إهدى", {}, "⏰"),
  ], { situation: "im_fine", part: "want" }),

  choice("s6m", "signals", "When I get jealous, it's usually because…", "لما أغار، غالباً لأنه…", [
    o("insecure", "I feel insecure", "{حاسس|حاسة} بعدم أمان", { anxious: 0.3 }, "🥀"),
    o("left_out", "I feel left out", "{حاسس|حاسة} إني برّا الصورة", {}, "🚪"),
    o("distrust", "Something about the situation feels off", "في شي بالموقف مش مريحني", {}, "🚩"),
    o("minor", "It's small, I'll get over it", "شي بسيط ورح يروح", {}, "🍃"),
  ], { situation: "jealous", part: "meaning" }),
  choice("s6w", "signals", "When I'm jealous, I want you to…", "لما أغار، بدي ياك…", [
    o("reassure", "Reassure me with words", "[تطمّني|تطمّنيني] بالكلام", { words: 0.3 }, "💬"),
    o("include", "Include me more", "[تدخلني|تدخليني] أكثر بحياتك", { time: 0.2 }, "🤝"),
    o("explain", "Explain calmly, without getting defensive", "[تشرحلي بهدوء بدون ما تدافع|تشرحيلي بهدوء بدون ما تدافعي]", { direct: 0.2 }, "🧘"),
    o("no_big_deal", "Not make it a big deal", "ما [تكبّر|تكبّري] الموضوع", {}, "🫧"),
  ], { situation: "jealous", part: "want" }),

  choice("s7m", "signals", "When I want alone time, it usually means…", "لما بدي وقت لحالي، غالباً يعني…", [
    o("recharge", "I'm recharging — it's not about you", "عم إشحن طاقتي، مش إلك علاقة", { space: 0.4 }, "🔋"),
    o("bothered", "Something's bothering me", "في شي {مضايقني|مضايقني}", {}, "🌧️"),
    o("stressed", "I'm stressed with work or life", "{مضغوط|مضغوطة} من الشغل أو الحياة", {}, "🧱"),
    o("independent", "I miss feeling independent", "{مشتاق حس إني مستقل|مشتاقة حس إني مستقلة}", { space: 0.3 }, "🦅"),
  ], { situation: "alone_time", part: "meaning" }),
  choice("s7w", "signals", "When I need alone time, I want you to…", "لما أحتاج وقت لحالي، بدي ياك…", [
    o("no_guilt", "Let me go without guilt", "[تتركني بدون ما تحسسني|تتركيني بدون ما تحسسيني] بالذنب", {}, "🕊️"),
    o("check_once", "Check in once, that's it", "[تسأل|تسألي] عني مرة وبس", {}, "☝️"),
    o("plan_after", "Plan something nice for after", "[تخطط|تخططي] لشي حلو بعدها", { time: 0.2 }, "🌅"),
    o("ask_us", "Ask me if it's about us", "[تسألني|تسأليني] إذا الموضوع إلو علاقة فينا", {}, "❓"),
  ], { situation: "alone_time", part: "want" }),

  choice("s8m", "signals", "If I'm still distant after a fight, it means…", "إذا ضليت {بعيد|بعيدة} بعد الزعل، يعني…", [
    o("hurt", "I'm still hurt", "لسا {مجروح|مجروحة}", {}, "🩹"),
    o("processing", "I'm still processing it", "لسا عم إستوعب", { withdraw: 0.3 }, "⚙️"),
    o("embarrassed", "I'm embarrassed about how I acted", "{مستحي|مستحية} من طريقتي", {}, "🙈"),
    o("waiting", "I'm waiting for an apology", "{ناطر|ناطرة} اعتذار", {}, "⌛"),
  ], { situation: "after_fight", part: "meaning" }),
  choice("s8w", "signals", "After a fight, I want you to…", "بعد الزعل، بدي ياك…", [
    o("apologize", "Apologize clearly, in words", "[تعتذر|تعتذري] بوضوح بالكلام", { words: 0.4 }, "🙏"),
    o("hug", "Hug me", "[تحضني|تحضنيني]", { touch: 0.4 }, "🤗"),
    o("time", "Give me a day", "[تعطيني|تعطيني] يوم", { space: 0.3 }, "📆"),
    o("talk", "Talk it through calmly", "نحكي فيها بهدوء", { direct: 0.3 }, "🗣️"),
    o("move_on", "Act normal and let's move on", "نرجع طبيعي وننسى", {}, "➡️"),
  ], { situation: "after_fight", part: "want" }),

  // ───────────── MOODS (decoder) ─────────────
  choice("m1m", "moods", "When I'm stressed, I usually get…", "لما أكون {مضغوط|مضغوطة}، عادةً بصير…", [
    o("snappy", "Snappy and short-tempered", "{عصبي|عصبية} وخلقي ضيق", { heat: 0.3 }, "🦔"),
    o("quiet", "Quiet and closed off", "{ساكت ومسكّر|ساكتة ومسكّرة}", { withdraw: 0.3 }, "🐚"),
    o("clingy", "Clingy — I want you near", "بدي ياك جنبي", { anxious: 0.2, touch: 0.2 }, "🐨"),
    o("distracted", "Busy and distracted", "{مشغول ومشتت|مشغولة ومشتتة}", {}, "🌪️"),
  ], { situation: "stressed", part: "meaning" }),
  choice("m1w", "moods", "When I'm stressed, I want you to…", "لما أكون {مضغوط|مضغوطة}، بدي ياك…", [
    o("help", "Take something off my plate", "[تشيل|تشيلي] عني شي", { acts: 0.4 }, "🧺"),
    o("listen", "Listen without trying to fix it", "[تسمعني بدون ما تحاول تحل|تسمعيني بدون ما تحاولي تحلي]", { words: 0.2 }, "👂"),
    o("distract", "Distract me", "[تلهيني|تلهيني]", {}, "🎮"),
    o("advice", "Give me real advice", "[تعطيني|تعطيني] نصيحة حقيقية", { direct: 0.2 }, "🧭"),
    o("leave", "Leave me be for a bit", "[تتركني|تتركيني] شوي", { space: 0.3 }, "🌙"),
  ], { situation: "stressed", part: "want" }),

  choice("m2m", "moods", "When I'm sad, I usually…", "لما أكون {زعلان أو حزين|زعلانة أو حزينة}، عادةً…", [
    o("hide", "Hide it", "بخبّيه", { avoidant: 0.2 }, "🎭"),
    o("cry", "Cry or show it openly", "ببكي أو ببيّنه", {}, "💧"),
    o("quiet", "Get very quiet", "بسكت كثير", {}, "🤫"),
    o("sleep", "Sleep it off", "بنام", {}, "🛌"),
  ], { situation: "sad", part: "meaning" }),
  choice("m2w", "moods", "When I'm sad, I want you to…", "لما أكون {حزين|حزينة}، بدي ياك…", [
    o("hold", "Hold me", "[تحضني|تحضنيني]", { touch: 0.4 }, "🫂"),
    o("talk", "Let me talk it out", "[تخليني|تخليني] فضفض", { words: 0.2 }, "💬"),
    o("out", "Take me out somewhere", "[تطلعني|تطلعيني] لمكان", { social: 0.2 }, "🚗"),
    o("treat", "Bring me food or a treat", "[تجبلي|تجيبيلي] أكل أو شي حلو", { gifts: 0.3 }, "🍫"),
    o("sit", "Just sit with me", "بس [تقعد|تقعدي] جنبي", { time: 0.3 }, "🪑"),
  ], { situation: "sad", part: "want" }),

  choice("m3m", "moods", "When I give short answers, it usually means…", "لما أرد بكلمات قليلة، غالباً يعني…", [
    o("busy", "I'm busy", "{مشغول|مشغولة}", {}, "💼"),
    o("tired", "I'm tired", "{تعبان|تعبانة}", {}, "😮‍💨"),
    o("low_battery", "My social battery is low", "طاقتي الاجتماعية خلصت", { social: -0.3 }, "🪫"),
    o("off", "Something's off", "في شي مش مزبوط", {}, "⚠️"),
  ], { situation: "short_answers", part: "meaning" }),
  choice("m3w", "moods", "When I'm giving short answers, I want you to…", "لما أرد مختصر، بدي ياك…", [
    o("not_personal", "Not take it personally", "ما [تاخدها|تاخديها] شخصي", {}, "🧊"),
    o("ask", "Ask what's up", "[تسأل|تسألي] شو في", {}, "❓"),
    o("call", "Switch to a call", "[تحوّلها|تحوّليها] لمكالمة", { contact: 0.2 }, "📞"),
    o("later", "Save it for later", "[تأجّل|تأجّلي] الحكي لبعدين", {}, "⏳"),
  ], { situation: "short_answers", part: "want" }),

  choice("m4m", "moods", "When I don't text first, it's because…", "لما ما أبعت أول، لأنه…", [
    o("busy", "I'm busy", "{مشغول|مشغولة}", {}, "💼"),
    o("assume", "I assume you'll text", "بفكر إنك رح [تبعت|تبعتي]", {}, "🤔"),
    o("test", "I want to see if you miss me", "بدي شوف إذا [اشتقتلي|اشتقتيلي]", { anxious: 0.3 }, "🧪"),
    o("not_texter", "I'm just not a big texter", "أنا مش من جماعة الرسايل", { contact: -0.4 }, "📵"),
  ], { situation: "no_text_first", part: "meaning" }),
  choice("m4w", "moods", "About texting first, I want you to…", "بموضوع مين يبعت أول، بدي ياك…", [
    o("text_me", "Text me first — I love it", "[تبعتلي|تبعتيلي] أول، بحبها", { contact: 0.3 }, "💗"),
    o("tell_me", "Tell me if you need me to text more", "[تقلي|تقوليلي] إذا بدك إبعت أكثر", { direct: 0.2 }, "📣"),
    o("no_score", "Not keep score", "ما [تعدّ|تعدّي] مين بعت أول", {}, "🧮"),
    o("call", "Call me instead", "[تتصل|تتصلي] بدالها", {}, "📞"),
  ], { situation: "no_text_first", part: "want" }),

  choice("m5m", "moods", "When I bring up the past, it's because…", "لما أفتح مواضيع قديمة، لأنه…", [
    o("hurts", "It still hurts", "لسا بيوجعني", {}, "🩹"),
    o("unsolved", "I don't feel it was solved", "{حاسس|حاسة} إنه ما انحل", {}, "🧩"),
    o("scared", "I'm scared it'll happen again", "{خايف|خايفة} يتكرر", { anxious: 0.3 }, "😟"),
    o("other", "I'm actually upset about something else", "بالحقيقة {زعلان|زعلانة} من شي ثاني", {}, "🎯"),
  ], { situation: "past", part: "meaning" }),
  choice("m5w", "moods", "When I bring up the past, I want you to…", "لما أفتح الماضي، بدي ياك…", [
    o("listen", "Listen again without sighing", "[تسمعني مرة كمان بدون ما تتأفف|تسمعيني مرة كمان بدون ما تتأففي]", {}, "👂"),
    o("show", "Show me it's changed", "[توريني|توريني] إنه الشي تغيّر", { acts: 0.3 }, "🔧"),
    o("reassure", "Reassure me", "[تطمّني|تطمّنيني]", { words: 0.3 }, "🫶"),
    o("close", "Help me close it properly", "[تساعدني|تساعديني] نسكّره صح", { direct: 0.2 }, "🔐"),
  ], { situation: "past", part: "want" }),

  choice("m6m", "moods", "When I'm on my phone around you, it usually means…", "لما أكون على الجوال وأنا معك، غالباً يعني…", [
    o("unwind", "I'm unwinding", "عم ريّح راسي", {}, "🌊"),
    o("bored", "I'm a bit bored", "{زهقان|زهقانة} شوي", {}, "🥱"),
    o("avoid", "I'm avoiding something", "عم هرب من شي", {}, "🏃"),
    o("habit", "Pure habit, it means nothing", "عادة بس، ما إلها معنى", {}, "🔁"),
  ], { situation: "phone", part: "meaning" }),
  choice("m6w", "moods", "If I'm on my phone too much, I want you to…", "إذا كنت على الجوال كثير، بدي ياك…", [
    o("tell", "Tell me if it bothers you", "[تقلي|تقوليلي] إذا بيضايقك", { direct: 0.2 }, "🗨️"),
    o("pull", "Pull me into something with you", "[تشدني|تشديني] لشي نعمله سوا", { time: 0.2 }, "🎳"),
    o("join", "Join me — show me stuff too", "[تشاركني وتوريني|تشاركيني وتوريني] أشياء", {}, "📲"),
    o("ignore", "Let it be", "[تتركها|تتركيها]", {}, "🤷"),
  ], { situation: "phone", part: "want" }),

  choice("m7m", "moods", "When you compliment me, I usually…", "لما [تمدحني|تمدحيني]، عادةً…", [
    o("love", "Love it", "بحبها كثير", { words: 0.3 }, "🥰"),
    o("shy", "Get shy and brush it off", "بستحي وبغيّر الموضوع", {}, "☺️"),
    o("doubt", "Don't fully believe it", "ما بصدقها كثير", { anxious: 0.2 }, "🤨"),
    o("specific", "Want you to be more specific", "بدي ياك [تكون|تكوني] أدق", { words: 0.2 }, "🔍"),
  ], { situation: "compliment", part: "meaning" }),
  choice("m7w", "moods", "About compliments, I want you to…", "بموضوع المدح، بدي ياك…", [
    o("keep", "Keep them coming", "[تضل تمدحني|تضلي تمدحيني]", { words: 0.3 }, "🔥"),
    o("public", "Say it in front of others", "[تقولها|تقوليها] قدام الناس", { public: 0.3 }, "📣"),
    o("write", "Write it down for me", "[تكتبهالي|تكتبيهالي]", { words: 0.2 }, "📝"),
    o("show", "Show it more than say it", "[توريني أكثر من ما تقول|توريني أكثر من ما تقولي]", { acts: 0.3 }, "🎬"),
  ], { situation: "compliment", part: "want" }),

  choice("m8m", "moods", "When I ask where you are, it usually means…", "لما [أسألك وينك|أسألك وينك]، غالباً يعني…", [
    o("miss", "I miss you", "[اشتقتلك|اشتقتلك]", {}, "🥹"),
    o("worried", "I'm worried about you", "{قلقان|قلقانة} عليك", {}, "😟"),
    o("insecure", "I feel a bit insecure", "{حاسس|حاسة} بعدم أمان شوي", { anxious: 0.3 }, "🫨"),
    o("curious", "Just curious", "فضول بس", {}, "🙃"),
  ], { situation: "where_are_you", part: "meaning" }),
  choice("m8w", "moods", "When I ask where you are, I want you to…", "لما أسألك وينك، بدي ياك…", [
    o("tell", "Just tell me, no drama", "[تقلي|تقوليلي] وبس، بدون دراما", {}, "📍"),
    o("pic", "Send me a pic", "[تبعتلي|تبعتيلي] صورة", { contact: 0.2 }, "📸"),
    o("reassure", "Reassure me", "[تطمّني|تطمّنيني]", { words: 0.2 }, "🫶"),
    o("before", "Tell me before I have to ask", "[تقلي|تقوليلي] قبل ما إسأل", { contact: 0.3 }, "⏩"),
  ], { situation: "where_are_you", part: "want" }),

  // ───────────── NEEDS ─────────────
  choice("n1", "needs", "During the day, I like us to text…", "خلال اليوم، بحب نحكي على الرسايل…", [
    o("constant", "All day, back and forth", "طول اليوم", { contact: 1 }, "💬"),
    o("few", "A few check-ins", "كم مرة نطمن على بعض", { contact: 0.4 }, "👋"),
    o("once", "Once is enough", "مرة وحدة بتكفي", { contact: -0.3 }, "☝️"),
    o("none", "I don't need texts — I need us in person", "ما بحتاج رسايل، بحتاجك قدامي", { contact: -0.7, time: 0.3 }, "🧍"),
  ]),
  scale("n2", "needs", "I need reassurance more than I show.", "بحتاج طمأنينة أكثر من اللي ببيّن.", { anxious: 0.6 }),
  choice("n3", "needs", "My biggest trigger is being…", "أكثر شي بيضايقني إني أكون…", [
    o("ignored", "Ignored", "{متجاهَل|متجاهَلة}", { anxious: 0.4 }, "🔕"),
    o("controlled", "Controlled", "حدا {متحكّم|متحكّم} فيني", { space: 0.5 }, "⛓️"),
    o("lied", "Lied to", "انكذب علي", { direct: 0.4 }, "🤥"),
    o("compared", "Compared to others", "مقارَن بغيري", {}, "⚖️"),
    o("taken", "Taken for granted", "{مضمون|مضمونة} وما حدا مقدّرني", { acts: 0.2 }, "🫙"),
  ]),
  choice("n4", "needs", "I feel safest when my partner is…", "بحس بالأمان أكثر لما [شريكي يكون|شريكتي تكون]…", [
    o("consistent", "Consistent", "[ثابت|ثابتة]", {}, "🧱"),
    o("honest", "Brutally honest", "[صريح|صريحة] لأبعد حد", { direct: 0.4 }, "🔦"),
    o("free", "Giving me freedom", "[معطيني|معطيتني] حريتي", { space: 0.4 }, "🕊️"),
    o("affectionate", "Affectionate", "[حنون|حنونة]", { touch: 0.3 }, "🫶"),
    o("effort", "Clearly making effort", "واضح [إنه عم يتعب|إنها عم تتعب] علينا", { acts: 0.3 }, "💪"),
  ]),
  scale("n5", "needs", "I need alone time every week.", "بحتاج وقت لحالي كل أسبوع.", { space: 1 }),
  scale("n6", "needs", "It matters to me that my partner gets along with my family and friends.", "بيهمني إنه [شريكي ينسجم|شريكتي تنسجم] مع أهلي وأصحابي.", { social: 0.4 }),
  choice("n7", "needs", "A deal breaker for me is…", "الخط الأحمر عندي هو…", [
    o("lying", "Lying", "الكذب", {}, "🚫"),
    o("disrespect", "Disrespect", "قلة الاحترام", {}, "🙅"),
    o("no_effort", "No effort", "ما في مجهود", { acts: 0.2 }, "🪫"),
    o("control", "Jealousy and control", "الغيرة الزايدة والتحكم", { space: 0.3 }, "⛓️"),
    o("silence", "Silent treatment", "التجاهل والسكوت كعقاب", { pursue: 0.3 }, "🧊"),
  ]),
  scale("n8", "needs", "I need my partner to plan things sometimes, not just me.", "بحتاج [شريكي يخطط|شريكتي تخطط] أحياناً، مش بس أنا.", { acts: 0.3, time: 0.2 }),

  // ───────────── LIFE ─────────────
  scale("f1", "life", "Being around people gives me energy.", "القعدة مع الناس بتعطيني طاقة.", { social: 1 }),
  scale("f2", "life", "I like plans made ahead, not last minute.", "بحب الخطط تكون محضّرة، مش آخر لحظة.", { planner: 1 }),
  choice("f3", "life", "My ideal weekend is…", "الويكند المثالي عندي…", [
    o("night_out", "A big night out", "سهرة برا", { social: 0.8 }, "🌃"),
    o("cozy", "Cozy at home", "قعدة دافية بالبيت", { social: -0.6 }, "🛋️"),
    o("adventure", "An adventure — desert, sea, mountains", "مغامرة — صحرا، بحر، جبال", { adventure: 0.8 }, "🏜️"),
    o("food", "Trying new food spots", "نجرب أماكن أكل جديدة", { adventure: 0.3 }, "🍜"),
    o("mix", "A bit of everything", "شوي من كل شي", {}, "🎲"),
  ]),
  scale("f4", "life", "I love trying new things together.", "بحب نجرب أشياء جديدة سوا.", { adventure: 1 }),
  choice("f5", "life", "With money, I'm…", "بالفلوس، أنا…", [
    o("spender", "A spender — life's short", "{صرّيف|صرّيفة} — الحياة قصيرة", {}, "💸"),
    o("saver", "A saver", "{مدّخر|مدّخرة}", { planner: 0.3 }, "🏦"),
    o("balanced", "Somewhere in between", "بالنص", {}, "⚖️"),
  ]),
  scale("f6", "life", "I'm a morning person.", "أنا من جماعة الصبح.", { morning: 1 }),
  scale("f7", "life", "I like sharing our relationship online.", "بحب نشارك علاقتنا على السوشال.", { public: 1 }),
  choice("f8", "life", "With my phone, I'm…", "بالنسبة لجوالي، أنا…", [
    o("open", "An open book", "كتاب مفتوح", {}, "📖"),
    o("private_ok", "Private, but nothing to hide", "{خصوصي|خصوصية}، بس ما عندي شي خبّيه", { space: 0.2 }, "🔐"),
    o("private", "Private, and I want it that way", "{خصوصي|خصوصية} وبدي ياه يضل هيك", { space: 0.4 }, "🛡️"),
  ]),
];

export const questionsBySection = (id: SectionId) => QUESTIONS.filter((q) => q.section === id);
export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
