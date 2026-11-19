// Subscription webhook. Set the webhook "Authorization" header in the billing dashboard
// to the same value as the BILLING_WEBHOOK_SECRET function secret.
// app_user_id is the Supabase user id (set at login in src/lib/billing.ts).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ACTIVE = new Set(["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION", "NON_RENEWING_PURCHASE", "SUBSCRIPTION_EXTENDED", "TEMPORARY_ENTITLEMENT_GRANT"]);
const ENDED = new Set(["EXPIRATION", "REFUND", "SUBSCRIPTION_PAUSED"]);

Deno.serve(async (req) => {
  const secret = Deno.env.get("BILLING_WEBHOOK_SECRET");
  if (!secret || req.headers.get("Authorization") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { event } = await req.json();
  const userId: string | undefined = event?.app_user_id;
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return new Response("ignored", { status: 200 });

  let until: string | null | undefined;
  if (ACTIVE.has(event.type)) until = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : new Date(Date.now() + 31 * 86400_000).toISOString();
  else if (ENDED.has(event.type)) until = event.type === "REFUND" ? new Date().toISOString() : event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : new Date().toISOString();
  if (until === undefined) return new Response("ok", { status: 200 });

  await admin.from("profiles").update({ premium_until: until }).eq("id", userId);
  return new Response("ok", { status: 200 });
});
