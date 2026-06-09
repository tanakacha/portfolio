export type WorkStoryDisplayStyle =
  | 'default'
  | 'highlight'
  | 'collapsed'
  | 'expanded';

export interface WorkStory {
  id: number;
  title?: string;
  body: string[];
  sortOrder: number;
  displayStyle: WorkStoryDisplayStyle;
}

export type WorkDetailDisplayStyle = 'default' | 'highlight';

export interface WorkDetail {
  id: number;
  label: string;
  value: string;
  sortOrder: number;
  displayStyle: WorkDetailDisplayStyle;
}

export interface Work {
  id: string;
  title: string;
  description: string[];
  images: string[];
  technologies: string[];
  links?: {
    demo?: string;
    github?: string;
    appStore?: string;
    googlePlay?: string;
  };
  stories: WorkStory[];
  details: WorkDetail[];
  createdAt: string; // ISO timestamp (NEW バッジ判定用)
}
