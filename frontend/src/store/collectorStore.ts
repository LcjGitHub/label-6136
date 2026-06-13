import { create } from 'zustand';
import type { Collector, CollectorInput } from '../types/collector';
import * as collectorApi from '../api/collectors';

interface CollectorState {
  collectors: Collector[];
  current: Collector | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchOne: (id: number) => Promise<void>;
  create: (input: CollectorInput) => Promise<Collector>;
  update: (id: number, input: CollectorInput) => Promise<Collector>;
  remove: (id: number) => Promise<void>;
  clearCurrent: () => void;
}

/**
 * 采集者数据全局状态
 */
export const useCollectorStore = create<CollectorState>((set) => ({
  collectors: [],
  current: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const collectors = await collectorApi.fetchCollectors();
      set({ collectors, loading: false });
    } catch {
      set({ loading: false, error: '加载采集者列表失败' });
    }
  },

  fetchOne: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const current = await collectorApi.fetchCollector(id);
      set({ current, loading: false });
    } catch {
      set({ loading: false, error: '加载采集者详情失败', current: null });
    }
  },

  create: async (input: CollectorInput) => {
    const created = await collectorApi.createCollector(input);
    set((state) => ({ collectors: [...state.collectors, created] }));
    return created;
  },

  update: async (id: number, input: CollectorInput) => {
    const updated = await collectorApi.updateCollector(id, input);
    set((state) => ({
      collectors: state.collectors.map((c) => (c.id === id ? updated : c)),
      current: state.current?.id === id ? updated : state.current,
    }));
    return updated;
  },

  remove: async (id: number) => {
    await collectorApi.deleteCollector(id);
    set((state) => ({
      collectors: state.collectors.filter((c) => c.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),
}));
