import axios from 'axios';
import type { KeyType, KeyTypeInput } from '../types/keyType';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 获取全部按键类型
 */
export async function fetchKeyTypes(): Promise<KeyType[]> {
  const { data } = await api.get<KeyType[]>('/key-types');
  return data;
}

/**
 * 按 ID 获取按键类型
 */
export async function fetchKeyType(id: number): Promise<KeyType> {
  const { data } = await api.get<KeyType>(`/key-types/${id}`);
  return data;
}

/**
 * 新增按键类型
 */
export async function createKeyType(input: KeyTypeInput): Promise<KeyType> {
  const { data } = await api.post<KeyType>('/key-types', input);
  return data;
}

/**
 * 更新按键类型
 */
export async function updateKeyType(id: number, input: KeyTypeInput): Promise<KeyType> {
  const { data } = await api.put<KeyType>(`/key-types/${id}`, input);
  return data;
}

/**
 * 删除按键类型
 */
export async function deleteKeyType(id: number): Promise<void> {
  await api.delete(`/key-types/${id}`);
}
