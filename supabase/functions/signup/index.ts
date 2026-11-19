// Creates an account with email + password, already confirmed (no verification email).
// The app then signs in with the same email + password.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const { email, password } = await req.json().catch(() => ({}));
  const e = String(email ?? "").trim().toLowerCase();
  const p = String(password ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 120) return json({ error: "invalid_email" }, 400);
  if (p.length < 6 || p.length > 72) return json({ error: "weak_password" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await admin.auth.admin.createUser({ email: e, password: p, email_confirm: true });
  if (error) {
    const exists = /already|registered|exists/i.test(error.message);
    return json({ error: exists ? "exists" : "failed" }, exists ? 409 : 500);
  }
  return json({ ok: true });
});
