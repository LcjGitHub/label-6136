/**
 * 采集者档案记录
 */
export interface Collector {
  id: number;
  name: string;
  contact: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

/**
 * 创建/更新采集者时的请求体（不含 id 与时间戳）
 */
export type CollectorInput = Omit<Collector, 'id' | 'created_at' | 'updated_at'>;
