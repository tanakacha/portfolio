export interface News {
  id: number;
  date: string; // YYYY-MM-DD
  body: string;
  link: string | null;
  imageUrl: string | null;
  createdAt: string; // ISO timestamp (NEW バッジ判定用)
}
