import type { L } from "../i18n";

export type Emirate = "abu_dhabi" | "dubai" | "sharjah" | "al_ain" | "rak" | "fujairah" | "ajman";
export type Vibe = "chill" | "romantic" | "adventure" | "foodie" | "fun";
export type Slot = "start" | "main" | "end";
export type TimeOfDay = "day" | "evening" | "night";

export type Spot = {
  id: string;
  emirate: Emirate;
  name: L;
  blurb: L;
  vibes: Vibe[];
  slot: Slot[];
  time: TimeOfDay[];
  /** 1 = free/cheap, 2 = mid, 3 = splurge */
  budget: 1 | 2 | 3;
  emoji: string;
  outdoor?: boolean;
};

export const EMIRATES: { id: Emirate; name: L }[] = [
  { id: "abu_dhabi", name: { en: "Abu Dhabi", ar: "أبوظبي" } },
  { id: "dubai", name: { en: "Dubai", ar: "دبي" } },
  { id: "sharjah", name: { en: "Sharjah", ar: "الشارقة" } },
  { id: "al_ain", name: { en: "Al Ain", ar: "العين" } },
  { id: "rak", name: { en: "Ras Al Khaimah", ar: "رأس الخيمة" } },
  { id: "fujairah", name: { en: "Fujairah", ar: "الفجيرة" } },
  { id: "ajman", name: { en: "Ajman", ar: "عجمان" } },
];

export const VIBES: { id: Vibe; name: L; emoji: string }[] = [
  { id: "chill", emoji: "😌", name: { en: "Chill", ar: "رايق" } },
  { id: "romantic", emoji: "🌹", name: { en: "Romantic", ar: "رومانسي" } },
  { id: "adventure", emoji: "🏜️", name: { en: "Adventure", ar: "مغامرة" } },
  { id: "foodie", emoji: "🍜", name: { en: "Foodie", ar: "أكل" } },
  { id: "fun", emoji: "🎳", name: { en: "Fun", ar: "وناسة" } },
];

const s = (
  id: string, emirate: Emirate, en: string, ar: string, bEn: string, bAr: string,
  vibes: Vibe[], slot: Slot[], time: TimeOfDay[], budget: 1 | 2 | 3, emoji: string, outdoor = false,
): Spot => ({ id, emirate, name: { en, ar }, blurb: { en: bEn, ar: bAr }, vibes, slot, time, budget, emoji, outdoor });

/** Seed list. The live list lives in the `spots` table so you can edit it without an update. */
export const SPOTS: Spot[] = [
  // ── Abu Dhabi ──
  s("ad_corniche", "abu_dhabi", "Corniche sunset walk", "مشي على الكورنيش وقت الغروب", "Walk, talk and grab a karak on the way.", "مشي وحكي وكرك عالطريق.", ["chill", "romantic"], ["start", "end"], ["evening"], 1, "🌅", true),
  s("ad_louvre", "abu_dhabi", "Louvre Abu Dhabi", "اللوفر أبوظبي", "Art, the rain of light dome, and photos by the water.", "فن، قبة شتاء النور، وصور جنب البحر.", ["romantic", "chill"], ["main"], ["day", "evening"], 2, "🖼️"),
  s("ad_mangroves", "abu_dhabi", "Mangrove kayaking", "كاياك بين أشجار القرم", "Paddle together through the mangroves.", "جدّفوا سوا بين القرم.", ["adventure"], ["main", "start"], ["day"], 2, "🛶", true),
  s("ad_yas_bay", "abu_dhabi", "Yas Bay waterfront", "واجهة ياس باي", "Dinner spots, lights and a walk by the water.", "مطاعم وأضواء ومشي جنب البحر.", ["foodie", "fun", "romantic"], ["main", "end"], ["evening", "night"], 2, "🌃"),
  s("ad_saadiyat", "abu_dhabi", "Saadiyat Beach", "شاطئ السعديات", "Quiet beach, clear water, slow afternoon.", "شاطئ هادي ومي صافية وعصرية رايقة.", ["chill", "romantic"], ["main"], ["day"], 1, "🏖️", true),
  s("ad_mamsha", "abu_dhabi", "Mamsha Al Saadiyat", "ممشى السعديات", "Beachfront cafés and a long evening stroll.", "كافيهات على البحر ومشوار طويل بالليل.", ["chill", "foodie"], ["start", "end"], ["evening"], 2, "☕", true),
  s("ad_qasr", "abu_dhabi", "Qasr Al Watan light show", "قصر الوطن وعرض الأضواء", "Palace by day, light show by night.", "القصر بالنهار وعرض الأضواء بالليل.", ["romantic"], ["main"], ["evening"], 2, "🏛️"),
  s("ad_ferrari", "abu_dhabi", "Ferrari World or Yas theme parks", "فيراري وورلد أو ملاهي ياس", "Scream together on the rides.", "اصرخوا سوا عالألعاب.", ["fun", "adventure"], ["main"], ["day"], 3, "🎢"),
  s("ad_galleria", "abu_dhabi", "Galleria Al Maryah dinner", "عشا بالغاليريا جزيرة الماريه", "Waterfront dinner with skyline views.", "عشا على المي مع إطلالة الأبراج.", ["romantic", "foodie"], ["main"], ["evening", "night"], 3, "🍽️"),
  s("ad_heritage", "abu_dhabi", "Heritage Village", "القرية التراثية", "Old Abu Dhabi, sea breeze and city views.", "أبوظبي القديمة، هوا البحر، وإطلالة عالمدينة.", ["chill"], ["start"], ["day", "evening"], 1, "🏺"),
  s("ad_desert", "abu_dhabi", "Desert dinner camp", "عشا بالبر", "Dune drive, sunset and dinner under the stars.", "تطعيس، غروب، وعشا تحت النجوم.", ["adventure", "romantic"], ["main"], ["evening"], 3, "🏜️", true),
  s("ad_dessert", "abu_dhabi", "Late-night dessert run", "مشوار حلو بنص الليل", "Kunafa, ice cream or crepes — your pick.", "كنافة، بوظة أو كريب — إنتوا اختاروا.", ["foodie", "fun"], ["end"], ["night"], 1, "🍨"),
  s("ad_cinema", "abu_dhabi", "Cinema night", "سهرة سينما", "Pick something neither of you would pick alone.", "اختاروا فيلم ما حدا فيكم بيختاره لحاله.", ["fun", "chill"], ["main"], ["evening", "night"], 2, "🎬"),
  s("ad_bowling", "abu_dhabi", "Bowling or arcade", "بولينغ أو ألعاب", "Loser pays for dessert.", "اللي بيخسر بيدفع الحلو.", ["fun"], ["main"], ["evening", "night"], 2, "🎳"),
  s("ad_jubail", "abu_dhabi", "Jubail Mangrove Park boardwalk", "ممشى قرم الجبيل", "Easy wooden walk through the mangroves.", "ممشى خشبي سهل بين القرم.", ["chill"], ["start"], ["day"], 1, "🌿", true),
  // ── Dubai ──
  s("dx_kite", "dubai", "Kite Beach", "كايت بيتش", "Sunset, food trucks and the Burj Al Arab view.", "غروب، فود ترك، وإطلالة برج العرب.", ["chill", "fun"], ["start", "end"], ["evening"], 1, "🏄", true),
  s("dx_frame", "dubai", "Dubai Frame", "برواز دبي", "Old and new Dubai from the glass bridge.", "دبي القديمة والجديدة من الجسر الزجاجي.", ["fun"], ["start", "main"], ["day", "evening"], 2, "🖼️"),
  s("dx_future", "dubai", "Museum of the Future", "متحف المستقبل", "A trip a few decades ahead.", "رحلة لكم عقد لقدّام.", ["fun", "adventure"], ["main"], ["day"], 3, "🛸"),
  s("dx_alseef", "dubai", "Al Seef & abra ride", "السيف وركوب العبرة", "Old Dubai lanes and a 1-dirham boat ride.", "حارات دبي القديمة وعبرة بدرهم.", ["romantic", "chill"], ["start", "main"], ["evening"], 1, "⛵", true),
  s("dx_lamer", "dubai", "La Mer", "لا مير", "Beach walk, murals and dinner by the sea.", "مشي عالشاطئ وجداريات وعشا عالبحر.", ["chill", "foodie"], ["main", "end"], ["evening"], 2, "🌊", true),
  s("dx_qudra", "dubai", "Al Qudra Lakes", "بحيرات القدرة", "Picnic, flamingos if you're lucky, and stars.", "بيكنك، وفلامنغو إذا حظكم حلو، ونجوم.", ["adventure", "romantic"], ["main"], ["evening"], 1, "🦩", true),
  s("dx_alserkal", "dubai", "Alserkal Avenue", "السركال أفنيو", "Galleries, specialty coffee, indie vibes.", "معارض، قهوة مختصة، وجو مختلف.", ["chill"], ["start"], ["day"], 1, "🎨"),
  s("dx_opera", "dubai", "Dubai Opera show", "عرض بأوبرا دبي", "Dress up for a show.", "البسوا حلو واحضروا عرض.", ["romantic"], ["main"], ["night"], 3, "🎭"),
  s("dx_fountain", "dubai", "Dubai Fountain show", "عرض نافورة دبي", "The classic. Still works.", "الكلاسيك. ولسا بيزبط.", ["romantic", "chill"], ["end", "start"], ["evening", "night"], 1, "⛲"),
  s("dx_bluewaters", "dubai", "Bluewaters & JBR walk", "بلووترز وممشى JBR", "Sea breeze, dinner and people-watching.", "هوا البحر وعشا وتأمل الناس.", ["fun", "foodie"], ["main", "end"], ["evening", "night"], 2, "🎡"),
  s("dx_hatta", "dubai", "Hatta day trip", "رحلة يوم لحتا", "Kayak the dam, hike, and mountain air.", "كاياك بالسد، هايكنغ، وهوا الجبل.", ["adventure"], ["main"], ["day"], 2, "⛰️", true),
  s("dx_global", "dubai", "Global Village (in season)", "القرية العالمية (بالموسم)", "Street food from everywhere.", "أكل شوارع من كل العالم.", ["fun", "foodie"], ["main"], ["evening", "night"], 2, "🌍"),
  s("dx_skydive", "dubai", "Indoor skydiving", "قفز حر داخلي", "Fly together, no plane needed.", "طيروا سوا بدون طيارة.", ["adventure", "fun"], ["main"], ["day", "evening"], 3, "🪂"),
  // ── Sharjah ──
  s("sh_alnoor", "sharjah", "Al Noor Island", "جزيرة النور", "Butterfly house, art and evening lights.", "بيت الفراشات وفن وأضواء بالليل.", ["romantic", "chill"], ["main"], ["evening"], 1, "🦋"),
  s("sh_qasba", "sharjah", "Al Qasba", "القصباء", "Canal-side cafés and the Eye of the Emirates.", "كافيهات على القناة وعين الإمارات.", ["fun", "chill"], ["start", "end"], ["evening", "night"], 1, "🎡"),
  s("sh_mleiha", "sharjah", "Mleiha stargazing", "مراقبة النجوم بمليحة", "Fossil rocks, desert and a sky full of stars.", "جبل الفوسيل والصحرا وسما مليانة نجوم.", ["adventure", "romantic"], ["main"], ["night"], 2, "🔭", true),
  // ── Al Ain ──
  s("ai_hafeet", "al_ain", "Jebel Hafeet drive", "مشوار جبل حفيت", "Drive up for sunset and the view.", "اطلعوا بالسيارة للغروب والإطلالة.", ["romantic", "adventure"], ["main", "start"], ["evening"], 1, "🚗", true),
  s("ai_oasis", "al_ain", "Al Ain Oasis walk", "واحة العين", "Shaded palm paths and falaj streams.", "ممرات نخيل مظللة وأفلاج.", ["chill"], ["start"], ["day"], 1, "🌴", true),
  s("ai_zoo", "al_ain", "Al Ain Zoo", "حديقة حيوانات العين", "Giraffe feeding counts as a date.", "إطعام الزرافات بيعتبر موعد.", ["fun"], ["main"], ["day", "evening"], 2, "🦒", true),
  s("ai_wadi", "al_ain", "Wadi Adventure", "وادي أدفنتشر", "Surf, raft or kayak — in the desert.", "سيرف أو رافتينغ أو كاياك — بالصحرا.", ["adventure"], ["main"], ["day"], 2, "🌊"),
  // ── RAK / Fujairah / Ajman ──
  s("rk_jais", "rak", "Jebel Jais", "جبل جيس", "Cool air, views and maybe the zipline.", "هوا بارد وإطلالات، ويمكن الزيبلاين.", ["adventure", "romantic"], ["main"], ["day", "evening"], 2, "🏔️", true),
  s("rk_beach", "rak", "RAK beach staycation", "ستيكيشن على بحر رأس الخيمة", "One night away, sea view.", "ليلة بعيد عن كل شي، مع إطلالة بحر.", ["romantic", "chill"], ["main"], ["day", "evening", "night"], 3, "🏨"),
  s("fj_snorkel", "fujairah", "Snoopy Island snorkelling", "سنوركل بجزيرة سنوبي", "Turtles, fish and clear water.", "سلاحف وسمك ومي صافية.", ["adventure"], ["main"], ["day"], 2, "🐢", true),
  s("fj_mosque", "fujairah", "Al Bidyah & east coast drive", "البدية ومشوار الساحل الشرقي", "Road trip with mountains on one side and sea on the other.", "رود تريب، الجبال من جهة والبحر من جهة.", ["chill", "adventure"], ["main"], ["day"], 1, "🛣️", true),
  s("aj_corniche", "ajman", "Ajman Corniche", "كورنيش عجمان", "Easy beach walk and shawarma after.", "مشي عالبحر وشاورما بعدها.", ["chill", "foodie"], ["start", "end"], ["evening"], 1, "🌯", true),
];

export type StayIn = { id: string; emoji: string; title: L; how: L };
export const STAY_IN: StayIn[] = [
  { id: "cook", emoji: "👩‍🍳", title: { en: "Cook-off", ar: "تحدي طبخ" }, how: { en: "Same ingredients, two dishes. Taste-test blind.", ar: "نفس المكونات، طبختين. تذوق وعيونكم مسكرة." } },
  { id: "movie", emoji: "🍿", title: { en: "Movie roulette", ar: "روليت أفلام" }, how: { en: "Each picks 3 films, the app spins.", ar: "كل واحد بيختار ٣ أفلام والتطبيق بيختار." } },
  { id: "qs", emoji: "💬", title: { en: "36 deep questions", ar: "أسئلة عميقة" }, how: { en: "Take turns with the daily question archive.", ar: "بالدور من أرشيف الأسئلة اليومية." } },
  { id: "spa", emoji: "🧖", title: { en: "Home spa night", ar: "سبا بالبيت" }, how: { en: "Face masks, candles, massages. Phones away.", ar: "ماسكات وشموع ومساج. الجوالات بعيد." } },
  { id: "game", emoji: "🎲", title: { en: "Game night", ar: "سهرة ألعاب" }, how: { en: "Cards, a board game or a console. Stakes: dessert.", ar: "شدة أو لعبة طاولة أو بلايستيشن. الرهان: الحلو." } },
  { id: "photos", emoji: "📸", title: { en: "Memory lane", ar: "رحلة بالذكريات" }, how: { en: "Scroll your first photos together and add them to Memories.", ar: "قلّبوا أول صوركم سوا وضيفوها للذكريات." } },
  { id: "plan", emoji: "🗺️", title: { en: "Dream trip planning", ar: "تخطيط رحلة الأحلام" }, how: { en: "Plan your dream trip in detail — budget and all.", ar: "خططوا رحلة أحلامكم بالتفصيل، مع الميزانية." } },
  { id: "picnic", emoji: "🧺", title: { en: "Living-room picnic", ar: "بيكنك بالصالون" }, how: { en: "Blanket on the floor, snacks, fairy lights.", ar: "بطانية عالأرض، سناكات، وأضواء صغيرة." } },
  { id: "draw", emoji: "🎨", title: { en: "Draw each other", ar: "ارسموا بعض" }, how: { en: "5 minutes, no skills required. Frame the worst one.", ar: "٥ دقايق، ما في داعي للموهبة. أسوأ رسمة بتنحط ببرواز." } },
  { id: "karaoke", emoji: "🎤", title: { en: "Karaoke", ar: "كاريوكي" }, how: { en: "Your song, their song, then a duet.", ar: "أغنيتك، أغنيته، وبعدين ديو." } },
];

/** Date jar: quick random ideas */
export const DATE_JAR: L[] = [
  { en: "Drive somewhere new and find the best karak on the way.", ar: "سوقوا لمكان جديد ودوروا أطيب كرك عالطريق." },
  { en: "Breakfast date — sunrise and shakshuka.", ar: "موعد فطور — شروق وشكشوكة." },
  { en: "Try a cuisine neither of you has had.", ar: "جربوا مطبخ ما حدا فيكم جربه." },
  { en: "Phone-free dinner. First one to touch their phone pays.", ar: "عشا بدون جوالات. أول واحد بيمسك جواله بيدفع." },
  { en: "Recreate your first date.", ar: "عيدوا أول موعد إلكم." },
  { en: "Sunset picnic with your favourite snacks.", ar: "بيكنك وقت الغروب مع سناكاتكم المفضلة." },
  { en: "Go to a bookstore and pick a book for each other.", ar: "روحوا على مكتبة وكل واحد يختار كتاب للثاني." },
  { en: "Late-night drive with a playlist you made together.", ar: "مشوار بالليل مع بلاي ليست عملتوها سوا." },
  { en: "Take a class together — pottery, cooking, or padel.", ar: "خذوا كلاس سوا — فخار، طبخ، أو بادل." },
  { en: "Dessert crawl: three spots, one sweet each.", ar: "جولة حلويات: ٣ أماكن، حلوة من كل مكان." },
  { en: "Stargazing outside the city.", ar: "تأمل النجوم برا المدينة." },
  { en: "Photo walk: 10 photos each, compare at dinner.", ar: "مشوار تصوير: ١٠ صور لكل واحد وقارنوها عالعشا." },
  { en: "Visit a museum you've never been to.", ar: "زوروا متحف عمركم ما رحتوه." },
  { en: "Sunday reset: groceries, cooking and a movie.", ar: "يوم ترتيب: تسوق وطبخ وفيلم." },
  { en: "Write each other a letter and read them over coffee.", ar: "اكتبوا رسايل لبعض واقروها عالقهوة." },
  { en: "Beach day, no plans.", ar: "يوم بحر بدون خطط." },
  { en: "Play tourist in your own city.", ar: "اعملوا حالكم سياح بمدينتكم." },
  { en: "Padel or bowling — loser plans the next date.", ar: "بادل أو بولينغ، اللي بيخسر بيخطط الموعد الجاي." },
  { en: "Cook the dish your partner's mum makes best.", ar: "اطبخوا الأكلة اللي بتعملها أم الشريك أطيب شي." },
  { en: "Make a bucket list for this year together.", ar: "اعملوا قائمة أحلام لهالسنة سوا." },
];

export type DatePlanInput = { emirate: Emirate; vibe: Vibe; budget: 1 | 2 | 3; time: TimeOfDay };
export type DatePlan = { start?: Spot; main?: Spot; end?: Spot };

function pick<T>(arr: T[], seed: number) {
  return arr.length ? arr[Math.abs(seed) % arr.length] : undefined;
}

/** Builds a 3-stop plan. Falls back to nearby emirates and relaxed filters. */
export function buildPlan(input: DatePlanInput, spots: Spot[] = SPOTS, seed = Date.now()): DatePlan {
  const near: Record<Emirate, Emirate[]> = {
    abu_dhabi: ["abu_dhabi", "al_ain", "dubai"],
    dubai: ["dubai", "sharjah", "abu_dhabi"],
    sharjah: ["sharjah", "dubai", "ajman"],
    ajman: ["ajman", "sharjah", "dubai"],
    al_ain: ["al_ain", "abu_dhabi"],
    rak: ["rak", "fujairah", "dubai"],
    fujairah: ["fujairah", "rak", "sharjah"],
  };
  const pool = spots.filter((s) => near[input.emirate].includes(s.emirate) && s.budget <= input.budget);
  const used = new Set<string>();
  const choose = (slot: Slot, k: number) => {
    const tiers = [
      pool.filter((s) => s.emirate === input.emirate && s.slot.includes(slot) && s.vibes.includes(input.vibe) && s.time.includes(input.time)),
      pool.filter((s) => s.emirate === input.emirate && s.slot.includes(slot) && s.time.includes(input.time)),
      pool.filter((s) => s.slot.includes(slot) && s.vibes.includes(input.vibe)),
      pool.filter((s) => s.slot.includes(slot)),
    ];
    for (const tier of tiers) {
      const free = tier.filter((s) => !used.has(s.id));
      if (free.length) {
        const sp = pick(free, seed + k)!;
        used.add(sp.id);
        return sp;
      }
    }
    return undefined;
  };
  const main = choose("main", 1);
  const start = choose("start", 7);
  const end = choose("end", 13);
  return { start, main, end };
}
