import "server-only";
import { getAdminSupabase } from "@/lib/supabase";
import { Idea } from "@/types/idea";

export async function getPrivateIdeas(): Promise<Idea[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .select(`
      *,
      idea_branches ( label, body, sort_order ),
      idea_notes ( noted_at, body, created_at, sort_order )
    `)
    .neq("visibility", "draft")
    .order("no", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const branches = (row.idea_branches ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    );
    const notes = (row.idea_notes ?? []).sort(
      (a: { noted_at: string; sort_order: number }, b: { noted_at: string; sort_order: number }) =>
        a.noted_at.localeCompare(b.noted_at) || a.sort_order - b.sort_order
    );

    const detailDates = (row.idea_notes ?? []).map(
      (n: { created_at: string }) => n.created_at
    );
    const latestDetailAt =
      detailDates.length > 0 ? detailDates.sort().at(-1) : undefined;

    return {
      id: row.id,
      no: row.no,
      title: row.title,
      body: row.body,
      category: row.category ?? undefined,
      status: row.status,
      note: row.note ?? undefined,
      existings: row.existings ?? undefined,
      refs: row.refs ?? undefined,
      branches: branches.length > 0 ? branches : undefined,
      notes: notes.length > 0 ? notes : undefined,
      publishedAt: row.published_at ?? undefined,
      latestDetailAt,
      createdAt: row.created_at,
    };
  });
}
