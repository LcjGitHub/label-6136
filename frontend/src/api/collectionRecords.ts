import axios from 'axios';
import type {
  CollectionRecord,
  CollectionRecordInput,
  CollectionRecordListParams,
} from '../types/collectionRecord';

const api = axios.create({
  baseURL: '/api',
});

export async function fetchCollectionRecords(
  params?: CollectionRecordListParams
): Promise<CollectionRecord[]> {
  const query = new URLSearchParams();
  if (params?.sample_id !== undefined) {
    query.append('sample_id', String(params.sample_id));
  }
  if (params?.collector_id !== undefined) {
    query.append('collector_id', String(params.collector_id));
  }
  const queryString = query.toString();
  const url = queryString ? `/collection-records?${queryString}` : '/collection-records';
  const { data } = await api.get<CollectionRecord[]>(url);
  return data;
}

export async function fetchCollectionRecord(id: number): Promise<CollectionRecord> {
  const { data } = await api.get<CollectionRecord>(`/collection-records/${id}`);
  return data;
}

export async function createCollectionRecord(
  input: CollectionRecordInput
): Promise<CollectionRecord> {
  const { data } = await api.post<CollectionRecord>('/collection-records', input);
  return data;
}

export async function updateCollectionRecord(
  id: number,
  input: CollectionRecordInput
): Promise<CollectionRecord> {
  const { data } = await api.put<CollectionRecord>(`/collection-records/${id}`, input);
  return data;
}

export async function deleteCollectionRecord(id: number): Promise<void> {
  await api.delete(`/collection-records/${id}`);
}
