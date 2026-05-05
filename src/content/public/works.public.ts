import "server-only";
import { Work } from "@/types/work";
import { getPublicSupabase } from "@/lib/supabase";

type Row = {
  id: string;
  title: string;
  description: string[];
  images: string[];
  technologies: string[];
  links: Record<string, string> | null;
};

export async function getPublicWorks(): Promise<Work[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("works")
    .select("id, title, description, images, technologies, links")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getPublicWorks: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    images: r.images,
    technologies: r.technologies,
    links: r.links ?? undefined,
  }));
}
