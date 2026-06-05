export interface News {
  id: number;
  date: string; // YYYY-MM-DD
  body: string;
  link: string | null;
  imageUrl: string | null;
}
