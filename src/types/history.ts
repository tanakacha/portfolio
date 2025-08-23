export interface HistoryItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'education' | 'achievement' | 'work' | 'research' | 'creative';
}
