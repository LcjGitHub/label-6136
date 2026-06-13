import axios from 'axios';
import type { KeyType, KeyTypeInput } from '../types/keyType';

const api = axios.create({
  baseURL: '/api',
});

export async function fetchKeyTypes(): Promise<KeyType[]> {
  const { data } = await api.get<KeyType[]>('/key-types');
  return data;
}

export async function fetchKeyType(id: number): Promise<KeyType> {
  const { data } = await api.get<KeyType>(`/key-types/${id}`);
  return data;
}

export async function createKeyType(input: KeyTypeInput): Promise<KeyType> {
  const { data } = await api.post<KeyType>('/key-types', input);
  return data;
}

export async function updateKeyType(id: number, input: KeyTypeInput): Promise<KeyType> {
  const { data } = await api.put<KeyType>(`/key-types/${id}`, input);
  return data;
}

export async function deleteKeyType(id: number): Promise<void> {
  await api.delete(`/key-types/${id}`);
}
