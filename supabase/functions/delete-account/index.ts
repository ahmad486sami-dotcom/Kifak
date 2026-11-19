// Permanently deletes the caller's account and all their data.
// Shared couple data is removed when the couple row is deleted (cascade).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await userClient.auth.getUser();
  if (!data?.user) return new Response("unauthorized", { status: 401 });
  const uid = data.user.id;

  // remove couple(s) and their files
  const { data: couples } = await admin.from("couples").select("id").or(`user_a.eq.${uid},user_b.eq.${uid}`);
  for (const c of couples ?? []) {
    const { data: files } = await admin.storage.from("couple").list(c.id, { limit: 1000 });
    if (files?.length) await admin.storage.from("couple").remove(files.map((f) => `${c.id}/${f.name}`));
    await admin.from("couples").delete().eq("id", c.id);
  }
  const { error } = await admin.auth.admin.deleteUser(uid);
  if (error) return new Response(error.message, { status: 500 });
  return new Response("deleted", { status: 200 });
});
