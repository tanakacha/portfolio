import "server-only";
import { HistoryItem } from "@/types/history";
import { getPublicSupabase } from "@/lib/supabase";

type Row = {
  id: string;
  date: string;
  title: string;
  description: string;
  item_type: HistoryItem["type"];
};

export async function getPublicHistory(): Promise<HistoryItem[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("history_items")
    .select("id, date, title, description, item_type")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getPublicHistory: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    date: r.date,
    title: r.title,
    description: r.description,
    type: r.item_type,
  }));
}
