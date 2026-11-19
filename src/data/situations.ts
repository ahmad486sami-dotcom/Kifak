import type { L } from "../i18n";

export type Situation = {
  id: string;
  emoji: string;
  /** shown on the grid: "When {name} goes quiet" */
  title: L;
  meaningQ: string;
  wantQ: string;
  /** per partner's "want" answer: what to do + a ready-to-send message */
  actions: Record<string, { do: L; send: L }>;
};

const a = (doEn: string, doAr: string, sendEn: string, sendAr: string) => ({
  do: { en: doEn, ar: doAr },
  send: { en: sendEn, ar: sendAr },
});

export const SITUATIONS: Situation[] = [
  {
    id: "goes_quiet", emoji: "🤐", meaningQ: "s1m", wantQ: "s1w",
    title: { en: "When {name} goes quiet", ar: "لما {name} [يسكت|تسكت]" },
    actions: {
      space: a("Don't chase. Give it an hour or two, then one soft check-in.", "{لا تلحق|لا تلحقي} [وراه|وراها]. {استنى|استني} ساعة أو ساعتين وبعدين {اسأل|اسألي} مرة بهدوء.", "No pressure — I'm here whenever you feel like talking 🤍", "بدون ضغط، أنا هون وقت ما بدك [تحكي|تحكي] 🤍"),
      ask: a("Ask once, directly and kindly. They want you to notice.", "{اسأل|اسألي} مرة وحدة بشكل مباشر وبلطف. [بدو|بدها] ياك {تنتبه|تنتبهي}.", "Hey, you seem quiet. Is something on your mind? I want to know.", "حاس[ك ساكت|ك ساكتة]، في شي ببالك؟ بدي أعرف."),
      close: a("Stay near them. Sit together, no need to talk.", "{خليك|خليكي} [جنبه|جنبها]. اقعدوا سوا، ما في داعي للحكي.", "Can I come sit with you? No talking needed.", "بقدر أجي أقعد جنبك؟ ما في داعي نحكي."),
      sweet: a("Send something small and sweet — no questions attached.", "{ابعت|ابعتي} شي صغير وحلو، بدون أسئلة.", "Just thinking about you 💭", "عم فكّر في[ك|كِ] 💭"),
      distract: a("Lighten the mood. A meme, a joke, a plan for food.", "{خفّف|خفّفي} الجو. ميم، نكتة، أو اقتراح أكل.", "Emergency: I need your opinion on dinner 🍔🍣🌯", "حالة طوارئ: بدي رأيك شو ناكل 🍔🍣🌯"),
    },
  },
  {
    id: "says_ok", emoji: "👌", meaningQ: "s2m", wantQ: "s2w",
    title: { en: "When {name} texts \"ok\"", ar: "لما {name} [يكتب|تكتب] «أوكي»" },
    actions: {
      face_value: a("Take it as it is. Don't read into it.", "{خذها|خديها} زي ما هي. {لا تحلّلها|لا تحلّليها}.", "👍", "👍"),
      call: a("Switch to a call — tone gets lost in text.", "{حوّل|حوّلي} لمكالمة، النبرة بتضيع بالرسايل.", "Can I call you for a sec?", "بقدر إتصل في[ك|كِ] دقيقة؟"),
      ask: a("Ask once if all is good — gently.", "{اسأل|اسألي} مرة إذا كل شي تمام، بلطف.", "All good with us? You can tell me 🤍", "كل شي تمام بيننا؟ في[ك تقلي|كِ تقوليلي] 🤍"),
      time: a("Give them a bit. Pick it up later.", "{اترك|اتركي}[ه|ها] شوي و{ارجع|ارجعي} بعدين.", "Talk later? 🤍", "نحكي بعدين؟ 🤍"),
    },
  },
  {
    id: "late_reply", emoji: "⏳", meaningQ: "s3m", wantQ: "s3w",
    title: { en: "When {name} replies late", ar: "لما {name} [يتأخر|تتأخر] بالرد" },
    actions: {
      relax: a("Relax. It isn't about you — the reply is coming.", "{ريّح|ريّحي} حالك. مش إلك علاقة، الرد جاي.", "No rush, reply when you're free 😌", "ولا يهمك، [رد لما تفضى|ردي لما تفضي] 😌"),
      nudge: a("A quick, light nudge is welcome.", "تذكير خفيف وسريع ما في مشكلة فيه.", "Busy? 👀", "[مشغول|مشغولة]؟ 👀"),
      call_if_urgent: a("If it matters, call. Otherwise wait.", "إذا الموضوع مهم {اتصل|اتصلي}، غير هيك {استنى|استني}.", "Call me when you get a sec — nothing bad!", "[اتصل|اتصلي] فيني لما يصير مع[ك|كِ] دقيقة، ما في شي يخوّف!"),
      no_double: a("One message is enough. Don't double text.", "رسالة وحدة بتكفي. {لا تبعت|لا تبعتي} ورا بعض.", "", ""),
    },
  },
  {
    id: "cancels", emoji: "❌", meaningQ: "s4m", wantQ: "s4w",
    title: { en: "When {name} cancels plans", ar: "لما {name} [يلغي|تلغي] طلعة" },
    actions: {
      reschedule: a("Lock in a new date right away.", "حددوا موعد جديد على طول.", "No worries! How about Thursday instead?", "ولا يهمك! شو رأيك الخميس؟"),
      come_over: a("Bring the plan to them — food and a movie at home.", "{جيب|جيبي} الطلعة [لعنده|لعندها]، أكل وفيلم بالبيت.", "Rain check on going out — want me to bring food over instead? 🍕", "خلينا نأجل الطلعة، بدك جيبل[ك|كِ] أكل لعند[ك|كِ]؟ 🍕"),
      be_ok: a("Be genuinely okay with it. No sighs, no guilt.", "{تقبّلها|تقبّليها} من قلبك، بدون تأفف ولا تحسيس بالذنب.", "Totally fine, rest up 🤍", "عادي أبداً، [ارتاح|ارتاحي] 🤍"),
      ask: a("Check gently if something's behind it.", "{اسأل|اسألي} بلطف إذا في شي ورا الموضوع.", "All okay? You can tell me if something's up.", "كل شي تمام؟ في[ك تقلي|كِ تقوليلي] إذا في شي."),
    },
  },
  {
    id: "im_fine", emoji: "🙂", meaningQ: "s5m", wantQ: "s5w",
    title: { en: "When {name} says \"I'm fine\"", ar: "لما {name} [يقول «منيح»|تقول «منيحة»]" },
    actions: {
      believe: a("Believe them for now. Don't push.", "{صدّق|صدّقي}[ه|ها] هلق و{لا تضغط|لا تضغطي}.", "Okay 🤍 I'm here if that changes.", "تمام 🤍 أنا هون إذا تغيّر شي."),
      ask_again: a("Ask one more time, softly. Then let it be.", "{اسأل|اسألي} مرة كمان بهدوء، وبعدين {اتركها|اتركيها}.", "You sure? You don't have to be fine with me.", "[متأكد؟ مش لازم تكون منيح|متأكدة؟ مش لازم تكوني منيحة] معي."),
      hug: a("Skip the words — just hug them.", "بلا حكي، بس {احضن|احضني}[ه|ها].", "Come here 🫂", "[تعال|تعالي] لهون 🫂"),
      later: a("Drop it now, bring it up later when things are calm.", "{اتركها هلق وافتحها|اتركيها هلق وافتحيها} بعدين لما الجو يهدى.", "", ""),
    },
  },
  {
    id: "jealous", emoji: "💚", meaningQ: "s6m", wantQ: "s6w",
    title: { en: "When {name} gets jealous", ar: "لما {name} [يغار|تغار]" },
    actions: {
      reassure: a("Reassure with clear words. Say it out loud.", "{طمّن|طمّني}[ه|ها] بكلام واضح. {قولها|قوليها} بصوت عالي.", "You're the only one I'm thinking about. Always.", "[إنت الوحيد|إنتِ الوحيدة] اللي ببالي. دايماً."),
      include: a("Bring them in — introduce, invite, share.", "{دخّل|دخّلي}[ه|ها] بالصورة، {عرّف|عرّفي}[ه|ها]، {اعزم|اعزمي}[ه|ها]، {شارك|شاركي}[ه|ها].", "Come with me next time? I want you there.", "[تجي|تجي] معي المرة الجاية؟ بدي ياك [تكون موجود|تكوني موجودة]."),
      explain: a("Explain calmly. Don't get defensive.", "{اشرح بهدوء وبدون ما تدافع|اشرحي بهدوء وبدون ما تدافعي}.", "I get why that felt weird. Let me explain.", "{فاهم|فاهمة} ليش [حسيت|حسيتي] هيك. خليني إشرحل[ك|كِ]."),
      no_big_deal: a("Keep it light. Acknowledge it and move on.", "{خليها خفيفة. اعترف فيها وكمّل|خليها خفيفة. اعترفي فيها وكمّلي}.", "Cute when you're jealous 😏 you know you're my person.", "[حلو لما تغار 😏 بتعرف إنك إنت|حلوة لما تغاري 😏 بتعرفي إنك إنتِ] الأساس."),
    },
  },
  {
    id: "alone_time", emoji: "🔋", meaningQ: "s7m", wantQ: "s7w",
    title: { en: "When {name} wants alone time", ar: "لما {name} [بدو وقت لحالو|بدها وقت لحالها]" },
    actions: {
      no_guilt: a("Let them go happily. It makes them come back sooner.", "{اترك|اتركي}[ه|ها] و{إنت مبسوط|إنتِ مبسوطة}. هيك [بيرجع|بترجع] أسرع.", "Enjoy your me-time 🤍", "[استمتع|استمتعي] بوقتك 🤍"),
      check_once: a("One check-in, that's all.", "سؤال واحد وبس.", "Just checking you're okay — no need to reply.", "بس حبيت إطمن علي[ك|كِ]، مش لازم [ترد|تردي]."),
      plan_after: a("Plan something warm for after.", "{خطط|خططي} لشي حلو لبعدها.", "Take your time — dinner on me after? 🍝", "[خذ|خدي] وقتك، وبعدها العشا علي؟ 🍝"),
      ask_us: a("Ask, calmly, if it's about you two.", "{اسأل|اسألي} بهدوء إذا الموضوع إلو علاقة فيكم.", "Is it something about us? Either way, I'm here.", "في شي إلو علاقة فينا؟ بكل الأحوال أنا هون."),
    },
  },
  {
    id: "after_fight", emoji: "🩹", meaningQ: "s8m", wantQ: "s8w",
    title: { en: "When {name} is distant after a fight", ar: "لما {name} [يضل بعيد|تضل بعيدة] بعد الزعل" },
    actions: {
      apologize: a("Apologize clearly. Name what you did.", "{اعتذر|اعتذري} بوضوح و{سمّي|سمّي} شو [عملت|عملتي].", "I'm sorry for what I said. You didn't deserve that.", "{آسف|آسفة} على اللي قلته. ما [بتستاهل|بتستاهلي] هيك."),
      hug: a("Close the gap physically. A hug says it.", "{قرّب|قرّبي} المسافة. الحضن بيحكي.", "Can I hug you? 🫂", "بقدر إحضن[ك|كِ]؟ 🫂"),
      time: a("Give it a day. Don't force the make-up.", "{اعطيها|اعطيها} يوم. {لا تفرض|لا تفرضي} المصالحة.", "I'll give you space. I love you.", "رح إعطي[ك|كِ] مساحت[ك|كِ]. بحب[ك|كِ]."),
      talk: a("Sit down and talk it through calmly.", "اقعدوا واحكوا فيها بهدوء.", "Can we talk about it tonight? Calm, no blame.", "منقدر نحكي فيها الليلة؟ بهدوء وبدون لوم."),
      move_on: a("Act normal and warm. They're ready to move on.", "{تصرف|تصرفي} طبيعي وبحنية. [هو جاهز يكمّل|هي جاهزة تكمّل].", "Coffee? ☕", "قهوة؟ ☕"),
    },
  },
  {
    id: "stressed", emoji: "🧱", meaningQ: "m1m", wantQ: "m1w",
    title: { en: "When {name} is stressed", ar: "لما {name} [يكون مضغوط|تكون مضغوطة]" },
    actions: {
      help: a("Take one task off their plate without asking.", "{شيل|شيلي} [عنه مهمة بدون ما يطلب|عنها مهمة بدون ما تطلب].", "I've got dinner tonight. Don't think about it.", "العشا الليلة علي. [لا تفكر|لا تفكري] فيه."),
      listen: a("Listen. Don't fix. Say 'that sounds hard'.", "{اسمع. لا تحل. قول|اسمعي. لا تحلي. قولي} «شكلها صعبة».", "Want to vent? I'll just listen.", "بدك [تفضفض|تفضفضي]؟ رح إسمع وبس."),
      distract: a("Distract them — a walk, a game, a show.", "{لهّي|لهّي}[ه|ها]، مشوار، لعبة، أو مسلسل.", "Escape plan: ice cream and a drive? 🍦🚗", "خطة هروب: بوظة ومشوار بالسيارة؟ 🍦🚗"),
      advice: a("Give practical, honest advice.", "{عطي|عطي}[ه|ها] نصيحة عملية وصريحة.", "Want my honest take on it?", "بدك رأيي بصراحة؟"),
      leave: a("Give them room and stay available.", "{اعطي|اعطي}[ه|ها] مساحة و{خليك موجود|خليكي موجودة}.", "I'll give you space. Shout if you need me.", "رح إعطي[ك|كِ] مساحت[ك|كِ]. [ناديني إذا احتجتني|ناديني إذا احتجتيني]."),
    },
  },
  {
    id: "sad", emoji: "💧", meaningQ: "m2m", wantQ: "m2w",
    title: { en: "When {name} is sad", ar: "لما {name} [يكون حزين|تكون حزينة]" },
    actions: {
      hold: a("Hold them. Words can wait.", "{احضن|احضني}[ه|ها]. الحكي بيستنى.", "Come here. I've got you 🫂", "[تعال|تعالي] لهون، أنا مع[ك|كِ] 🫂"),
      talk: a("Let them talk. Ask, then listen.", "{خلي|خلي}[ه يحكي|ها تحكي]. {اسأل وبعدين اسمع|اسألي وبعدين اسمعي}.", "Tell me everything. I'm listening.", "[احكيلي|احكيلي] كل شي، أنا عم إسمع[ك|كِ]."),
      out: a("Get them out of the house for a bit.", "{طلّع|طلّعي}[ه|ها] من البيت شوي.", "Let's go for a drive. My treat.", "يلا نطلع مشوار، عزيمتي."),
      treat: a("Show up with their favourite food or sweet.", "{فاجئ|فاجئي}[ه بأكله أو حلوه المفضل|ها بأكلها أو حلوها المفضل].", "Something's on its way to you 🍫", "في شي جاي لعند[ك|كِ] 🍫"),
      sit: a("Just be there. Sit with them.", "بس {كون موجود. اقعد|كوني موجودة. اقعدي} [جنبه|جنبها].", "Want company? I'll just sit with you.", "بدك حدا جنب[ك|كِ]؟ رح إقعد مع[ك|كِ] بس."),
    },
  },
  {
    id: "short_answers", emoji: "✂️", meaningQ: "m3m", wantQ: "m3w",
    title: { en: "When {name} gives short answers", ar: "لما {name} [يرد|ترد] مختصر" },
    actions: {
      not_personal: a("Don't take it personally. It's their battery, not you.", "{لا تاخدها|لا تاخديها} شخصي. هي [طاقته|طاقتها]، مش {إنت|إنتِ}.", "", ""),
      ask: a("Ask once what's up.", "{اسأل|اسألي} مرة شو في.", "Everything okay? You seem off today.", "كل شي تمام؟ حاس[ك|كِ] مش على [بعضك|بعضِك] اليوم."),
      call: a("A short call beats ten texts.", "مكالمة قصيرة أحسن من عشر رسايل.", "Quick call?", "مكالمة سريعة؟"),
      later: a("Save the big talk for later.", "{أجّل|أجّلي} الحكي الكبير لبعدين.", "Let's catch up tonight 🤍", "منحكي الليلة 🤍"),
    },
  },
  {
    id: "no_text_first", emoji: "📵", meaningQ: "m4m", wantQ: "m4w",
    title: { en: "When {name} doesn't text first", ar: "لما {name} ما [يبعت|تبعت] أول" },
    actions: {
      text_me: a("Text first. They love it, even if they don't show it.", "{ابعت إنت|ابعتي إنتِ} أول. [بيحبها حتى لو ما بيّن|بتحبها حتى لو ما بيّنت].", "Good morning, you 🌞", "صباح الخير [يا حلو|يا حلوة] 🌞"),
      tell_me: a("Tell them kindly if you need more texts.", "{قل|قولي}[ه|ها] بلطف إذا بدك رسايل أكثر.", "I love hearing from you during the day — even a quick hi.", "بحب [تبعتلي|تبعتيلي] خلال اليوم، حتى لو «هاي» بس."),
      no_score: a("Stop counting who texted first.", "{بطّل تعدّ|بطّلي تعدّي} مين بعت أول.", "", ""),
      call: a("Skip the text — call.", "بلا رسايل، {اتصل|اتصلي}.", "Calling you in 5 📞", "رح إتصل في[ك|كِ] بعد ٥ دقايق 📞"),
    },
  },
  {
    id: "past", emoji: "📼", meaningQ: "m5m", wantQ: "m5w",
    title: { en: "When {name} brings up the past", ar: "لما {name} [يفتح|تفتح] الماضي" },
    actions: {
      listen: a("Listen again, fully. No sighs, no 'this again'.", "{اسمع|اسمعي} مرة كمان بالكامل. بلا تأفف ولا «رجعنا».", "I'm listening. Tell me how it still feels.", "عم إسمع[ك|كِ]. احكيلي كيف لسا [حاسس|حاسة]."),
      show: a("Point to what's changed — with actions.", "{ورجي|ورجي}[ه|ها] شو تغيّر، بالأفعال.", "I know it hurt. Here's what I'm doing differently now.", "بعرف إنها وجعت[ك|كِ]. هاد اللي عم إعمله غير هلق."),
      reassure: a("Reassure them it won't happen again.", "{طمّن|طمّني}[ه|ها] إنه ما رح يتكرر.", "That won't happen again. I promise you.", "ما رح يتكرر. بوعد[ك|كِ]."),
      close: a("Sit down and close it properly together.", "اقعدوا سكّروه صح سوا.", "Can we talk about it properly, once, and close it together?", "منقدر نحكي فيه صح مرة وحدة ونسكّره سوا؟"),
    },
  },
  {
    id: "phone", emoji: "📱", meaningQ: "m6m", wantQ: "m6w",
    title: { en: "When {name} is on their phone", ar: "لما {name} [يكون على جواله|تكون على جوالها]" },
    actions: {
      tell: a("Say it kindly if it bothers you.", "{قل|قولي}[ه|ها] بلطف إذا بيضايقك.", "Phones down for an hour? I miss you even when you're here 🙈", "منسكّر الجوالات ساعة؟ {مشتقل|مشتاقتل}[ك وإنت|كِ وإنتِ] جنبي 🙈"),
      pull: a("Pull them into something with you.", "{اسحب|اسحبي}[ه|ها] لشي تعملوه سوا.", "Game? Loser makes tea 🎲", "نلعب؟ اللي بيخسر بيعمل شاي 🎲"),
      join: a("Join in — ask what they're watching.", "{شارك|شاركي}[ه|ها]، {اسأل|اسألي}[ه شو عم يتفرج|ها شو عم تتفرج].", "Show me what's so funny 😂", "[ورجيني|ورجيني] شو المضحك 😂"),
      ignore: a("Let it be. It means nothing.", "{اتركها|اتركيها}، ما إلها معنى.", "", ""),
    },
  },
  {
    id: "compliment", emoji: "✨", meaningQ: "m7m", wantQ: "m7w",
    title: { en: "When you compliment {name}", ar: "لما {تمدح|تمدحي} {name}" },
    actions: {
      keep: a("Keep them coming. Daily.", "{ضل امدح|ضلي امدحي}. كل يوم.", "You look unreal today. Just saying.", "شكل[ك|كِ] خيالي اليوم. بس حبيت قول."),
      public: a("Say it in front of friends and family.", "{قولها|قوليها} قدام الأصحاب والأهل.", "", ""),
      write: a("Write it down — a note they can keep.", "{اكتبها|اكتبيها}، رسالة [يحتفظ|تحتفظ] فيها.", "Things I love about you: 1)…", "أشياء بحبها في[ك|كِ]: ١)…"),
      show: a("Show it — actions over words.", "{ورجي|ورجي}[ه|ها]، الأفعال قبل الكلام.", "", ""),
    },
  },
  {
    id: "where_are_you", emoji: "📍", meaningQ: "m8m", wantQ: "m8w",
    title: { en: "When {name} asks where you are", ar: "لما {name} [يسألك|تسألك] وينك" },
    actions: {
      tell: a("Just answer. Simple, no drama.", "{جاوب|جاوبي} وبس. ببساطة وبدون دراما.", "At the gym, done in 30 💪", "بالجيم، بخلص بعد ٣٠ دقيقة 💪"),
      pic: a("Send a quick pic.", "{ابعت|ابعتي} صورة سريعة.", "📸", "📸"),
      reassure: a("Answer and add something warm.", "{جاوب وضيف|جاوبي وضيفي} شي حنون.", "Out with the guys — miss you though 🤍", "مع {الشباب|البنات}، بس {مشتقل|مشتاقتل}[ك|كِ] 🤍"),
      before: a("Tell them before they have to ask.", "{قل|قولي}[ه قبل ما يسأل|ها قبل ما تسأل].", "Heading out with work people, back by 10 🤍", "{طالع|طالعة} مع جماعة الشغل، براجع على ١٠ 🤍"),
    },
  },
];

export const SITUATION_MAP = Object.fromEntries(SITUATIONS.map((s) => [s.id, s]));
