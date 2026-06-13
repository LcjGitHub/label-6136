export interface KeyType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type KeyTypeInput = Omit<KeyType, 'id' | 'created_at' | 'updated_at'>;
