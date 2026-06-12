import axios from 'axios';
import type { Device, DeviceInput } from '../types/device';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 获取全部设备
 */
export async function fetchDevices(): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/devices');
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
