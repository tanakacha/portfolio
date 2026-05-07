export interface Post {
  id: number;
  body: string;
  createdAt: string;
  likeCount: number;
  nextPostId: number | null;
}
