import axios from 'axios';
import type { Era, EraInput } from '../types/era';

const api = axios.create({
  baseURL: '/api',
});

export async function fetchEras(): Promise<Era[]> {
  const { data } = await api.get<Era[]>('/eras');
  return data;
}

export async function fetchEra(id: number): Promise<Era> {
  const { data } = await api.get<Era>(`/eras/${id}`);
  return data;
}

export async function createEra(input: EraInput): Promise<Era> {
  const { data } = await api.post<Era>('/eras', input);
  return data;
}

export async function updateEra(id: number, input: EraInput): Promise<Era> {
  const { data } = await api.put<Era>(`/eras/${id}`, input);
  return data;
}

export async function deleteEra(id: number): Promise<void> {
  await api.delete(`/eras/${id}`);
}
