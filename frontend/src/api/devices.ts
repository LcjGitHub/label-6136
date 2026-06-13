import axios from 'axios';
import type { Device, DeviceInput } from '../types/device';

const api = axios.create({
  baseURL: '/api',
});

export interface ExportResponse {
  exportTime: string;
  count: number;
  data: Device[];
}

export interface RestoreRequest {
  data: DeviceInput[];
  mode: 'overwrite' | 'append';
}

export interface RestoreResponse {
  message: string;
  count: number;
  mode: 'overwrite' | 'append';
  data: Device[];
}

/**
 * 获取全部设备
 * @param keyword 可选搜索关键词，按品牌型号、获取地点、声音描述模糊匹配
 */
export async function fetchDevices(keyword?: string): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/devices', {
    params: keyword ? { keyword } : {},
  });
  return data;
}

/**
 * 按 ID 获取设备
 */
export async function fetchDevice(id: number): Promise<Device> {
  const { data } = await api.get<Device>(`/devices/${id}`);
  return data;
}

/**
 * 新增设备
 */
export async function createDevice(input: DeviceInput): Promise<Device> {
  const { data } = await api.post<Device>('/devices', input);
  return data;
}

/**
 * 更新设备
 */
export async function updateDevice(id: number, input: DeviceInput): Promise<Device> {
  const { data } = await api.put<Device>(`/devices/${id}`, input);
  return data;
}

/**
 * 删除设备
 */
export async function deleteDevice(id: number): Promise<void> {
  await api.delete(`/devices/${id}`);
}

/**
 * 导出全部样本数据
 */
export async function exportDevices(): Promise<ExportResponse> {
  const { data } = await api.get<ExportResponse>('/devices/export');
  return data;
}

/**
 * 还原样本数据
 */
export async function restoreDevices(request: RestoreRequest): Promise<RestoreResponse> {
  const { data } = await api.post<RestoreResponse>('/devices/restore', request);
  return data;
}

/**
 * 对比两个样本
 */
export interface CompareDevicesResponse {
  device1: Device;
  device2: Device;
}

export async function compareDevices(id1: number, id2: number): Promise<CompareDevicesResponse> {
  const { data } = await api.get<CompareDevicesResponse>('/devices/compare', {
    params: { id1, id2 },
  });
  return data;
}
