import type { L } from "../i18n";

// ───────────── MOODS (check-in + widget) ─────────────
export const MOODS: { id: string; emoji: string; label: L }[] = [
  { id: "great", emoji: "😍", label: { en: "Feeling great", ar: "{مبسوط|مبسوطة} كثير" } },
  { id: "good", emoji: "😊", label: { en: "Good", ar: "تمام" } },
  { id: "talk", emoji: "💬", label: { en: "Want to talk", ar: "بدي إحكي" } },
  { id: "miss", emoji: "🥹", label: { en: "Missing you", ar: "{مشتاق|مشتاقة}" } },
  { id: "tired", emoji: "😴", label: { en: "Tired", ar: "{تعبان|تعبانة}" } },
  { id: "stressed", emoji: "😮‍💨", label: { en: "Stressed", ar: "{مضغوط|مضغوطة}" } },
  { id: "space", emoji: "🫥", label: { en: "Need space", ar: "بحتاج مساحة" } },
  { id: "low", emoji: "🌧️", label: { en: "Feeling low", ar: "مزاجي تعبان" } },
  { id: "hungry", emoji: "🍔", label: { en: "Hungry 🙃", ar: "{جوعان|جوعانة} 🙃" } },
  { id: "cuddly", emoji: "🧸", label: { en: "Need a hug", ar: "بحتاج حضن" } },
];

// ───────────── QUICK TAPS ("thinking of you") ─────────────
export const TAPS: { id: string; emoji: string; label: L }[] = [
  { id: "thinking", emoji: "💭", label: { en: "Thinking of you", ar: "عم فكّر في[ك|كِ]" } },
  { id: "miss", emoji: "🥹", label: { en: "Miss you", ar: "{مشتقل|مشتاقتل}[ك|كِ]" } },
  { id: "love", emoji: "❤️", label: { en: "Love you", ar: "بحب[ك|كِ]" } },
  { id: "hug", emoji: "🫂", label: { en: "Sending a hug", ar: "عم إبعتل[ك|كِ] حضن" } },
  { id: "proud", emoji: "🏆", label: { en: "Proud of you", ar: "{فخور|فخورة} في[ك|كِ]" } },
  { id: "sorry", emoji: "🙏", label: { en: "I'm sorry", ar: "{آسف|آسفة}" } },
];

// ───────────── ARCHETYPES (profile card) ─────────────
export type Archetype = { id: string; emoji: string; name: L; line: L };
export const ARCHETYPES: Record<string, Archetype> = {
  slow_burner: { id: "slow_burner", emoji: "🔥", name: { en: "The Slow Burner", ar: "النار الهادية" }, line: { en: "Takes time to open up — and then goes all in.", ar: "{بياخد وقته ليفتح قلبه، وبعدين بيعطي|بتاخد وقتها لتفتح قلبها، وبعدين بتعطي} كل شي." } },
  open_book: { id: "open_book", emoji: "📖", name: { en: "The Open Book", ar: "الكتاب المفتوح" }, line: { en: "Says what they feel, when they feel it.", ar: "{بيقول اللي حاسه، وقت ما بيحس|بتقول اللي حاسته، وقت ما بتحس} فيه." } },
  deep_feeler: { id: "deep_feeler", emoji: "🌊", name: { en: "The Deep Feeler", ar: "القلب العميق" }, line: { en: "Feels everything twice. Needs to hear it.", ar: "{بيحس بكل شي مرتين، وبيحتاج يسمعها|بتحس بكل شي مرتين، وبتحتاج تسمعها}." } },
  quiet_protector: { id: "quiet_protector", emoji: "🛡️", name: { en: "The Quiet Protector", ar: "الحامي الهادي" }, line: { en: "Shows love by doing, not saying.", ar: "{بيعبّر|بتعبّر} عن الحب بالأفعال، مش بالكلام." } },
  spark: { id: "spark", emoji: "✨", name: { en: "The Spark", ar: "الشرارة" }, line: { en: "Brings the energy, the plans and the fun.", ar: "{بيجيب|بتجيب} الطاقة والخطط والوناسة." } },
  anchor: { id: "anchor", emoji: "⚓", name: { en: "The Anchor", ar: "المرساة" }, line: { en: "Steady, calm and reliable when things get rough.", ar: "{ثابت وهادي ويعتمد عليه|ثابتة وهادية ويعتمد عليها} وقت الصعب." } },
  free_spirit: { id: "free_spirit", emoji: "🦅", name: { en: "The Free Spirit", ar: "الروح الحرة" }, line: { en: "Loves deeply — with room to breathe.", ar: "{بيحب من قلبه، بس بدو مساحة يتنفس|بتحب من قلبها، بس بدها مساحة تتنفس}." } },
  romantic: { id: "romantic", emoji: "🌹", name: { en: "The Romantic", ar: "الرومانسي" }, line: { en: "Lives for the little gestures and big moments.", ar: "{بيعيش|بتعيش} عالتفاصيل الصغيرة واللحظات الكبيرة." } },
  fire: { id: "fire", emoji: "🌋", name: { en: "The Firecracker", ar: "البركان" }, line: { en: "Hot in the moment, quick to make up.", ar: "{بيولّع بسرعة، وبيصالح|بتولّع بسرعة، وبتصالح} بسرعة." } },
};

// ───────────── CHALLENGES ─────────────
export type Challenge = { id: string; emoji: string; title: L; days: L[] };
const c = (en: string, ar: string): L => ({ en, ar });
export const CHALLENGES: Challenge[] = [
  {
    id: "appreciation", emoji: "🙏", title: c("7 days of appreciation", "٧ أيام تقدير"),
    days: [
      c("Tell them one thing you admire about them.", "{قل|قولي}[ه|ها] شي واحد {معجب|معجبة} فيه في[ه|ها]."),
      c("Thank them for something small they did this week.", "{اشكر|اشكري}[ه على شي صغير عمله|ها على شي صغير عملته] هالأسبوع."),
      c("Send a voice note saying why you chose them.", "{ابعت|ابعتي} فويس ليش {اخترت|اخترتي}[ه|ها]."),
      c("Compliment them in front of someone.", "{امدح|امدحي}[ه|ها] قدام حدا."),
      c("Write 3 things you love about them in a note.", "{اكتب|اكتبي} ٣ أشياء {بتحبها|بتحبيها} في[ه|ها] برسالة."),
      c("Do one of their chores without being asked.", "{اعمل|اعملي} شغلة من [شغلاته بدون ما يطلب|شغلاتها بدون ما تطلب]."),
      c("Tell them how they've made your life better.", "{قل|قولي}[ه كيف حسّن|ها كيف حسّنت] حياتك."),
    ],
  },
  {
    id: "phone_free", emoji: "📵", title: c("Phone-free week", "أسبوع بدون جوالات"),
    days: [
      c("30 phone-free minutes together tonight.", "٣٠ دقيقة بدون جوال سوا الليلة."),
      c("Phones in another room during dinner.", "الجوالات بغرفة ثانية وقت العشا."),
      c("No phones in bed — talk instead.", "ممنوع الجوال بالتخت، احكوا بدالها."),
      c("A phone-free walk.", "مشوار بدون جوالات."),
      c("One hour, one activity, zero screens.", "ساعة، نشاط واحد، صفر شاشات."),
      c("Morning coffee without phones.", "قهوة الصبح بدون جوالات."),
      c("Phone-free date. Celebrate the week!", "موعد بدون جوالات. احتفلوا بالأسبوع!"),
    ],
  },
  {
    id: "adventure", emoji: "🧭", title: c("7 new things", "٧ أشياء جديدة"),
    days: [
      c("Try a new café.", "جربوا كافيه جديد."),
      c("Cook a recipe neither of you has made.", "اطبخوا وصفة ما حدا فيكم عملها."),
      c("Listen to an album the other loves.", "اسمعوا ألبوم بيحبه الثاني."),
      c("Go somewhere you've never been in your emirate.", "روحوا لمكان عمركم ما رحتوه بإمارتكم."),
      c("Learn 5 minutes of something new together.", "تعلموا شي جديد ٥ دقايق سوا."),
      c("Swap roles: the planner rests, the other plans.", "بدّلوا الأدوار: اللي بيخطط يرتاح والثاني يخطط."),
      c("Do something that scares you a little — together.", "اعملوا شي بيخوّفكم شوي — سوا."),
    ],
  },
  {
    id: "reconnect", emoji: "🧲", title: c("Reconnect in 5 days", "نرجع نقرب بـ ٥ أيام"),
    days: [
      c("Share your best and worst moment of the day.", "احكوا أحلى وأسوأ لحظة باليوم."),
      c("Hug for 20 seconds. Count it.", "احضنوا بعض ٢٠ ثانية. عدّوها."),
      c("Ask: what do you need from me this week?", "{اسأل|اسألي}: شو [بتحتاج|بتحتاجي] مني هالأسبوع؟"),
      c("Retake one quiz section and compare.", "عيدوا قسم من الاختبار وقارنوا."),
      c("Plan your next date in the app.", "خططوا موعدكم الجاي بالتطبيق."),
    ],
  },
];

// ───────────── FEELINGS TRANSLATOR ─────────────
export const FEELINGS: { id: string; emoji: string; label: L }[] = [
  { id: "hurt", emoji: "💔", label: { en: "Hurt", ar: "{مجروح|مجروحة}" } },
  { id: "ignored", emoji: "🔕", label: { en: "Ignored", ar: "{متجاهَل|متجاهَلة}" } },
  { id: "overwhelmed", emoji: "🌊", label: { en: "Overwhelmed", ar: "{مضغوط|مضغوطة} كثير" } },
  { id: "lonely", emoji: "🫥", label: { en: "Lonely", ar: "{وحيد|وحيدة}" } },
  { id: "jealous", emoji: "💚", label: { en: "Jealous", ar: "{غيران|غيرانة}" } },
  { id: "unappreciated", emoji: "🫙", label: { en: "Unappreciated", ar: "مش {مقدَّر|مقدَّرة}" } },
  { id: "anxious", emoji: "🌀", label: { en: "Anxious about us", ar: "{قلقان|قلقانة} علينا" } },
  { id: "angry", emoji: "😤", label: { en: "Angry", ar: "{معصّب|معصّبة}" } },
];

export const NEEDS: { id: string; emoji: string; label: L }[] = [
  { id: "listen", emoji: "👂", label: { en: "To be heard", ar: "حدا يسمعني" } },
  { id: "reassure", emoji: "🫶", label: { en: "Reassurance", ar: "طمأنينة" } },
  { id: "time", emoji: "⏳", label: { en: "Time together", ar: "وقت سوا" } },
  { id: "help", emoji: "🧺", label: { en: "Help", ar: "مساعدة" } },
  { id: "space", emoji: "🚪", label: { en: "Some space", ar: "شوية مساحة" } },
  { id: "hug", emoji: "🫂", label: { en: "A hug", ar: "حضن" } },
  { id: "apology", emoji: "🙏", label: { en: "An apology", ar: "اعتذار" } },
];

// ───────────── CONFLICT MODE ─────────────
export const CONFLICT_STEPS: { title: L; body: L }[] = [
  { title: c("Pause", "وقفة"), body: c("You both agreed to pause. Breathe. Nobody wins a fight — you win as a team or not at all.", "اتفقتوا توقفوا. خدوا نفس. ما حدا بيربح بالزعل — يا بتربحوا كفريق يا لا.") },
  { title: c("Cool down", "اهدوا"), body: c("Use the timer. Don't text about it during the cool-down.", "استعملوا المؤقت. ما تبعتوا رسايل عن الموضوع وقت الهدوء.") },
  { title: c("One sentence each", "جملة لكل واحد"), body: c("Each of you says: \"I felt ___ when ___, and I need ___.\" No 'you always'.", "كل واحد بيقول: «حسيت بـ ___ لما ___، وبحتاج ___». بدون «إنت دايماً».") },
  { title: c("Repeat it back", "عيدوها"), body: c("Repeat what you heard before you reply. \"So you felt…\"", "عيد اللي سمعته قبل ما ترد. «يعني إنت حسيت…»") },
  { title: c("Fix one thing", "صلحوا شي واحد"), body: c("Agree on one small thing each of you will do differently.", "اتفقوا على شي صغير كل واحد رح يعمله بشكل مختلف.") },
  { title: c("Repair", "صلح"), body: c("Close it the way your partner needs — check their repair tip below.", "سكّروها بالطريقة اللي بيحتاجها شريكك — شوف نصيحة الصلح تحت.") },
];
