/**
 * 按键类型词典记录
 */
export interface KeyType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建/更新按键类型时的请求体（不含 id 与时间戳）
 */
export type KeyTypeInput = Omit<KeyType, 'id' | 'created_at' | 'updated_at'>;
