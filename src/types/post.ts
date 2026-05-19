import type { ReactionKey } from "@/lib/reactions";

export interface Post {
  id: number;
  body: string;
  createdAt: string;
  reactions: Partial<Record<ReactionKey, number>>;
  nextPostId: number | null;
}
