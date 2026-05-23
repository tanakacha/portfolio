import "server-only";
import { HistoryItem } from "@/types/history";
import { getAdminSupabase } from "@/lib/supabase";

type Row = {
  id: string;
  date: string;
  title: string;
  description: string;
  item_type: HistoryItem["type"];
};

export async function getPrivateHistory(): Promise<HistoryItem[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("history_items")
    .select("id, date, title, description, item_type")
    .neq("visibility", "draft")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getPrivateHistory: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    date: r.date,
    title: r.title,
    description: r.description,
    type: r.item_type,
  }));
}
