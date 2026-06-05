import "server-only";
import { News } from "@/types/news";
import { getAdminSupabase } from "@/lib/supabase";

type Row = {
  id: number;
  date: string;
  body: string;
  link: string | null;
  image_url: string | null;
};

export async function getPrivateNews(): Promise<News[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("news")
    .select("id, date, body, link, image_url")
    .neq("visibility", "draft")
    .order("date", { ascending: false })
    .order("sort_order", { ascending: false })
    .limit(5);
  if (error) throw new Error(`getPrivateNews: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    date: r.date,
    body: r.body,
    link: r.link,
    imageUrl: r.image_url,
  }));
}
