/**
 * 标签记录
 */
export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建/更新标签时的请求体（不含 id 与时间戳）
 */
export type TagInput = Omit<Tag, 'id' | 'created_at' | 'updated_at'>;
