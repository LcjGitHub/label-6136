import { create } from 'zustand';
import type {
  CollectionRecord,
  CollectionRecordInput,
  CollectionRecordListParams,
} from '../types/collectionRecord';
import * as collectionRecordApi from '../api/collectionRecords';

interface CollectionRecordState {
  collectionRecords: CollectionRecord[];
  current: CollectionRecord | null;
  loading: boolean;
  error: string | null;
  fetchAll: (params?: CollectionRecordListParams) => Promise<void>;
  fetchOne: (id: number) => Promise<void>;
  create: (input: CollectionRecordInput) => Promise<CollectionRecord>;
  update: (id: number, input: CollectionRecordInput) => Promise<CollectionRecord>;
  remove: (id: number) => Promise<void>;
  clearCurrent: () => void;
}

export const useCollectionRecordStore = create<CollectionRecordState>((set) => ({
  collectionRecords: [],
  current: null,
  loading: false,
  error: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const collectionRecords = await collectionRecordApi.fetchCollectionRecords(params);
      set({ collectionRecords, loading: false });
    } catch {
      set({ loading: false, error: '加载采集记录列表失败' });
    }
  },

  fetchOne: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const current = await collectionRecordApi.fetchCollectionRecord(id);
      set({ current, loading: false });
    } catch {
      set({ loading: false, error: '加载采集记录详情失败', current: null });
    }
  },

  create: async (input: CollectionRecordInput) => {
    const created = await collectionRecordApi.createCollectionRecord(input);
    set((state) => ({ collectionRecords: [created, ...state.collectionRecords] }));
    return created;
  },

  update: async (id: number, input: CollectionRecordInput) => {
    const updated = await collectionRecordApi.updateCollectionRecord(id, input);
    set((state) => ({
      collectionRecords: state.collectionRecords.map((c) => (c.id === id ? updated : c)),
      current: state.current?.id === id ? updated : state.current,
    }));
    return updated;
  },

  remove: async (id: number) => {
    await collectionRecordApi.deleteCollectionRecord(id);
    set((state) => ({
      collectionRecords: state.collectionRecords.filter((c) => c.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),
}));
