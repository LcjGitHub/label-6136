import { create } from 'zustand';
import type { Era, EraInput } from '../types/era';
import * as eraApi from '../api/eras';

interface EraState {
  eras: Era[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: EraInput) => Promise<Era>;
  update: (id: number, input: EraInput) => Promise<Era>;
  remove: (id: number) => Promise<void>;
}

export const useEraStore = create<EraState>((set) => ({
  eras: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const eras = await eraApi.fetchEras();
      set({ eras, loading: false });
    } catch {
      set({ loading: false, error: '加载年代列表失败' });
    }
  },

  create: async (input: EraInput) => {
    const created = await eraApi.createEra(input);
    set((state) => ({ eras: [...state.eras, created] }));
    return created;
  },

  update: async (id: number, input: EraInput) => {
    const updated = await eraApi.updateEra(id, input);
    set((state) => ({
      eras: state.eras.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  remove: async (id: number) => {
    await eraApi.deleteEra(id);
    set((state) => ({
      eras: state.eras.filter((e) => e.id !== id),
    }));
  },
}));
