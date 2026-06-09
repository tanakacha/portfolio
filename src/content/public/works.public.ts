import "server-only";
import {
  Work,
  WorkDetailDisplayStyle,
  WorkStoryDisplayStyle,
} from "@/types/work";
import { getPublicSupabase } from "@/lib/supabase";

type StoryRow = {
  id: number;
  title: string | null;
  body: string[];
  sort_order: number;
  display_style: WorkStoryDisplayStyle;
};

type DetailRow = {
  id: number;
  label: string;
  value: string;
  sort_order: number;
  display_style: WorkDetailDisplayStyle;
};

type Row = {
  id: string;
  title: string;
  description: string[];
  images: string[];
  technologies: string[];
  links: Record<string, string> | null;
  created_at: string;
  stories: StoryRow[] | null;
  details: DetailRow[] | null;
};

export async function getPublicWorks(): Promise<Work[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("works")
    .select(
      `id, title, description, images, technologies, links, created_at,
       stories:work_stories(id, title, body, sort_order, display_style),
       details:work_details(id, label, value, sort_order, display_style)`,
    )
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
    createdAt: r.created_at,
    stories: (r.stories ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        id: s.id,
        title: s.title ?? undefined,
        body: s.body,
        sortOrder: s.sort_order,
        displayStyle: s.display_style,
      })),
    details: (r.details ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((d) => ({
        id: d.id,
        label: d.label,
        value: d.value,
        sortOrder: d.sort_order,
        displayStyle: d.display_style,
      })),
  }));
}
