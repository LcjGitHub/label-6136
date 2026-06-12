/**
 * 收银机设备记录
 */
export interface Device {
  id: number;
  brand_model: string;
  era: string;
  key_type: string;
  sound_description: string;
  location: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建设备时的请求体（不含 id 与时间戳）
 */
export type DeviceInput = Omit<Device, 'id' | 'created_at' | 'updated_at'>;
