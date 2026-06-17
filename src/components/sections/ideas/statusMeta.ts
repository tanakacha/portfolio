import { IdeaStatus } from '@/types/idea';

export const STATUS_META: Record<
  Exclude<IdeaStatus, 'open'>,
  { label: string }
> = {
  building:  { label: '作り手あり' },
  reserved:  { label: '一時非公開' },
  exists:    { label: '実現済み' },
  partial:   { label: '一部実現済み' },
};
