import type { Tag } from './tag';

export interface Device {
  id: number;
  brand_model: string;
  era: string;
  key_type: string;
  sound_description: string;
  location: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export type DeviceInput = Omit<Device, 'id' | 'tags' | 'created_at' | 'updated_at'>;
