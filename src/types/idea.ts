export type IdeaStatus = 'open' | 'building' | 'reserved' | 'exists' | 'partial';

export interface ExistingProduct {
  label?: string; // 「この場合」など文脈ラベル
  name: string;
  maker?: string;
  url?: string;
}

// partial status 時の参考リンク（部分的に被っている既存品）
export interface IdeaRef {
  label: string; // 「この○○部分」
  name?: string;
  url?: string;
}

export interface IdeaBranch {
  label: string;
  body: string[];
  sort_order: number;
}

export interface IdeaNote {
  noted_at: string; // 'YYYY-MM-DD'
  body: string;
  created_at: string; // DB投入日時（更新バッジ用）
}

export interface Idea {
  id: string;
  no: number;
  title: string;
  body: string[];
  category?: string;
  status: IdeaStatus;
  note?: string;        // exists/partial 用の自由記述（バッジの下に表示）
  existings?: ExistingProduct[];
  refs?: IdeaRef[];
  branches?: IdeaBranch[];
  notes?: IdeaNote[];
  publishedAt?: string;
  latestDetailAt?: string; // branches/notes の最新 created_at（更新バッジ用）
  createdAt: string;
}
