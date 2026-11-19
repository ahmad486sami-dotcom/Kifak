import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Screen, T } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { SUPPORT_EMAIL } from "@/lib/constants";

const UPDATED = "2026-11-19";

const DOCS = {
  privacy: {
    en: {
      title: "Privacy Policy",
      body: [
        ["What we collect", "Your email or Apple sign-in, your name and gender, your quiz answers, and what you create in the app (moods, notes, voice notes, photos, dates, wishlists and game results)."],
        ["Who can see it", "Only you and the partner you connect with. Your quiz answers are shared with your partner so the decoder can work. Nothing is public."],
        ["How we use it", "To run the app: build your profile, show your partner what you mean, keep your streak, send the notifications you allow, and manage your subscription. We don't sell your data and we don't show ads."],
        ["Service providers", "We use outsourced service providers to host data, process payments and deliver notifications. They only process data to provide these services to us."],
        ["Storage and security", "Data is stored encrypted in transit, and access is limited to you and your partner by strict rules on our servers."],
        ["Your choices", "You can edit your answers, unlink your partner or permanently delete your account any time in Settings. Deleting removes your data and your shared couple space."],
        ["Contact", `Questions? Email ${SUPPORT_EMAIL}.`],
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      body: [
        ["شو منجمع", "إيميلك أو تسجيل الدخول بآبل، اسمك وجنسك، أجوبتك عالاختبار، واللي بتعمله بالتطبيق (المزاج، الرسايل، الفويسات، الصور، المواعيد، قوائم الأمنيات ونتائج الألعاب)."],
        ["مين بيشوفها", "بس إنت والشريك اللي بترتبط فيه. أجوبتك بتنعرض لشريكك حتى يشتغل «فك الشيفرة». ما في شي عام."],
        ["كيف منستعملها", "لتشغيل التطبيق: نبني ملفك، نفهّم شريكك شو بتقصد، نحافظ عالستريك، نبعت الإشعارات اللي بتسمح فيها، وندير اشتراكك. ما منبيع بياناتك وما في إعلانات."],
        ["مزودي الخدمات", "منستعمل مزودي خدمات خارجيين للاستضافة والدفع والإشعارات، وبيستعملوا البيانات بس لتقديم هالخدمات إلنا."],
        ["التخزين والأمان", "البيانات مشفرة أثناء النقل، والوصول إلها محصور فيك وبشريكك بقواعد صارمة على سيرفراتنا."],
        ["خياراتك", "بتقدر تعدّل أجوبتك، تفك الارتباط، أو تحذف حسابك نهائياً من الإعدادات. الحذف بيمسح بياناتك ومساحتكم المشتركة."],
        ["تواصل معنا", `عندك سؤال؟ راسلنا على ${SUPPORT_EMAIL}.`],
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of Use",
      body: [
        ["The app", "Kifak helps couples understand each other through a personality quiz, a decoder and shared daily tools. It's for fun and connection — it isn't therapy or professional advice."],
        ["Your account", "You must be 18 or older. Keep your sign-in safe. One account per person, one partner at a time."],
        ["Subscription", "Kifak is a paid subscription with a 7-day free trial. One subscription unlocks the app for both partners. Payment is charged to your Apple ID when the trial ends. It renews monthly unless cancelled at least 24 hours before the end of the period. Manage or cancel in your Apple ID settings. Refunds are handled by Apple."],
        ["Be kind", "Don't use Kifak to harass, pressure or control anyone. We may close accounts that break these rules."],
        ["Your content", "You own what you write and upload. You let us store and show it to you and your partner so the app works."],
        ["Changes", "We may update the app and these terms. If something important changes, we'll tell you in the app."],
        ["Contact", `Email ${SUPPORT_EMAIL}.`],
      ],
    },
    ar: {
      title: "شروط الاستخدام",
      body: [
        ["التطبيق", "كيفك بيساعد الثنائيات يفهموا بعض من خلال اختبار شخصية، وفك الشيفرة، وأدوات يومية مشتركة. هو للوناسة والقرب، ومش علاج أو استشارة مختصة."],
        ["حسابك", "لازم يكون عمرك ١٨ أو أكثر. حافظ على تسجيل دخولك. حساب واحد لكل شخص، وشريك واحد بنفس الوقت."],
        ["الاشتراك", "كيفك اشتراك مدفوع مع تجربة مجانية ٧ أيام. اشتراك واحد بيفتح التطبيق للشريكين. المبلغ بينسحب من حساب آبل لما تخلص التجربة، وبيتجدد كل شهر إلا إذا لغيته قبل ٢٤ ساعة من نهاية الفترة. بتقدر تدير أو تلغي من إعدادات حساب آبل. الاسترداد بيكون عن طريق آبل."],
        ["خليك لطيف", "لا تستعمل كيفك لتضايق أو تضغط أو تتحكم بحدا. ممكن نسكّر الحسابات اللي بتخالف هالقواعد."],
        ["محتواك", "اللي بتكتبه وبترفعه إلك. وبتسمحلنا نخزنه ونعرضه إلك ولشريكك حتى يشتغل التطبيق."],
        ["التغييرات", "ممكن نحدّث التطبيق وهالشروط. إذا تغيّر شي مهم رح نخبرك بالتطبيق."],
        ["تواصل معنا", `راسلنا على ${SUPPORT_EMAIL}.`],
      ],
    },
  },
} as const;

export default function Legal() {
  const { lang } = useT();
  const { doc } = useLocalSearchParams<{ doc: "privacy" | "terms" }>();
  const d = (DOCS[doc] ?? DOCS.privacy)[lang];
  return (
    <Screen back title={d.title}>
      <T v="small" c={colors.faint}>{lang === "ar" ? "آخر تحديث" : "Last updated"}: {UPDATED}</T>
      {(d.body as readonly (readonly [string, string])[]).map(([h, b]) => (
        <React.Fragment key={h}>
          <T v="h3" style={{ marginTop: 6 }}>{h}</T>
          <T c={colors.muted}>{b}</T>
        </React.Fragment>
      ))}
    </Screen>
  );
}
