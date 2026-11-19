// Sends a push notification to the caller's partner.
// Body: { kind: "note" | "tap" | "mood" | "daily" | "event" | "conflict" | "nudge", text?: string }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TITLES: Record<string, { en: string; ar: string }> = {
  note: { en: "💌 New love note", ar: "💌 رسالة حب جديدة" },
  tap: { en: "💭 Thinking of you", ar: "💭 عم يفكر فيك" },
  mood: { en: "🌦️ Mood update", ar: "🌦️ تحديث المزاج" },
  daily: { en: "❓ They answered today's question", ar: "❓ جاوب على سؤال اليوم" },
  event: { en: "📅 New date planned", ar: "📅 في موعد جديد" },
  conflict: { en: "🕊️ Pause requested", ar: "🕊️ طلب وقفة" },
  nudge: { en: "🔥 Keep the streak alive", ar: "🔥 حافظوا عالستريك" },
  swipe: { en: "💞 It's a date match!", ar: "💞 اتفقتوا على طلعة!" },
};

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response("unauthorized", { status: 401 });

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind ?? "tap");
    const text = typeof body.text === "string" ? body.text.slice(0, 140) : "";
    if (!TITLES[kind]) return new Response("bad kind", { status: 400 });

    const { data: partnerId } = await userClient.rpc("partner_id");
    if (!partnerId) return new Response("no partner", { status: 200 });

    // simple rate limit: max 30 pushes per sender per hour
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from("push_log").select("*", { count: "exact", head: true }).eq("sender", u.user.id).gte("sent_at", since);
    if ((count ?? 0) >= 30) return new Response("rate limited", { status: 429 });

    const [{ data: partner }, { data: me }] = await Promise.all([
      admin.from("profiles").select("push_token, lang").eq("id", partnerId).single(),
      admin.from("profiles").select("name").eq("id", u.user.id).single(),
    ]);
    if (!partner?.push_token) return new Response("no token", { status: 200 });

    const lang = partner.lang === "ar" ? "ar" : "en";
    const title = TITLES[kind][lang];
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: partner.push_token, title: me?.name ? `${me.name} · ${title}` : title, body: text || undefined, sound: "default", data: { kind } }),
    });
    await admin.from("push_log").insert({ sender: u.user.id, kind });
    return new Response(JSON.stringify({ ok: res.ok }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
