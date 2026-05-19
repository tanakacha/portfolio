export type ReactionKey = "heart" | "sushi" | "eyes";

export interface ReactionDef {
  key: ReactionKey;
  label: string;
  ariaActive: string;
  ariaInactive: string;
}

export const ALL_REACTIONS: readonly ReactionDef[] = [
  {
    key: "sushi",
    label: "寿司",
    ariaActive: "寿司スタンプを取り消す",
    ariaInactive: "寿司スタンプを付ける",
  },
  {
    key: "eyes",
    label: "目",
    ariaActive: "目スタンプを取り消す",
    ariaInactive: "目スタンプを付ける",
  },
  {
    key: "heart",
    label: "ハート",
    ariaActive: "ハートを取り消す",
    ariaInactive: "ハートを付ける",
  },
];

export const PUBLIC_REACTIONS: readonly ReactionDef[] = ALL_REACTIONS.filter(
  (r) => r.key === "heart",
);
