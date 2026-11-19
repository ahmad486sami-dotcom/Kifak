import { supabase } from "./supabase";
import { SPOTS, Spot } from "../data/dates";

let cache: Spot[] | null = null;

/** Live list from the `spots` table (editable without an app update), falling back to the built-in seed. */
export async function getSpots(): Promise<Spot[]> {
  if (cache) return cache;
  try {
    const { data } = await supabase.from("spots").select("id, data").eq("active", true);
    const live = (data ?? []).map((r: any) => ({ ...r.data, id: r.id })) as Spot[];
    cache = live.length ? live : SPOTS;
  } catch {
    cache = SPOTS;
  }
  return cache;
}
