import axios from 'axios';
import type { Collector, CollectorInput } from '../types/collector';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 获取全部采集者
 */
export async function fetchCollectors(): Promise<Collector[]> {
  const { data } = await api.get<Collector[]>('/collectors');
  return data;
}

/**
 * 按 ID 获取采集者
 */
export async function fetchCollector(id: number): Promise<Collector> {
  const { data } = await api.get<Collector>(`/collectors/${id}`);
  return data;
}

/**
 * 新增采集者
 */
export async function createCollector(input: CollectorInput): Promise<Collector> {
  const { data } = await api.post<Collector>('/collectors', input);
  return data;
}

/**
 * 更新采集者
 */
export async function updateCollector(id: number, input: CollectorInput): Promise<Collector> {
  const { data } = await api.put<Collector>(`/collectors/${id}`, input);
  return data;
}

/**
 * 删除采集者
 */
export async function deleteCollector(id: number): Promise<void> {
  await api.delete(`/collectors/${id}`);
}
