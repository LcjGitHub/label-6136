import axios from 'axios';
import type { Tag, TagInput } from '../types/tag';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 获取全部标签
 */
export async function fetchTags(): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

/**
 * 按 ID 获取标签
 */
export async function fetchTag(id: number): Promise<Tag> {
  const { data } = await api.get<Tag>(`/tags/${id}`);
  return data;
}

/**
 * 新增标签
 */
export async function createTag(input: TagInput): Promise<Tag> {
  const { data } = await api.post<Tag>('/tags', input);
  return data;
}

/**
 * 更新标签
 */
export async function updateTag(id: number, input: TagInput): Promise<Tag> {
  const { data } = await api.put<Tag>(`/tags/${id}`, input);
  return data;
}

/**
 * 删除标签
 */
export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`);
}

/**
 * 获取指定设备的标签列表
 */
export async function fetchDeviceTags(deviceId: number): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>(`/tags/device/${deviceId}`);
  return data;
}

/**
 * 为指定设备绑定标签
 */
export async function bindDeviceTag(deviceId: number, tagId: number): Promise<Tag[]> {
  const { data } = await api.post<Tag[]>(`/tags/device/${deviceId}/${tagId}`);
  return data;
}

/**
 * 为指定设备解除标签绑定
 */
export async function unbindDeviceTag(deviceId: number, tagId: number): Promise<Tag[]> {
  const { data } = await api.delete<Tag[]>(`/tags/device/${deviceId}/${tagId}`);
  return data;
}
