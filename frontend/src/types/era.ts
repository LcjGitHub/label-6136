export interface Era {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type EraInput = Omit<Era, 'id' | 'created_at' | 'updated_at'>;
