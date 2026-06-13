import { create } from 'zustand';
import type { KeyType, KeyTypeInput } from '../types/keyType';
import * as keyTypeApi from '../api/keyTypes';

interface KeyTypeState {
  keyTypes: KeyType[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: KeyTypeInput) => Promise<KeyType>;
  update: (id: number, input: KeyTypeInput) => Promise<KeyType>;
  remove: (id: number) => Promise<void>;
}

export const useKeyTypeStore = create<KeyTypeState>((set) => ({
  keyTypes: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const keyTypes = await keyTypeApi.fetchKeyTypes();
      set({ keyTypes, loading: false });
    } catch {
      set({ loading: false, error: '加载按键类型列表失败' });
    }
  },

  create: async (input: KeyTypeInput) => {
    const created = await keyTypeApi.createKeyType(input);
    set((state) => ({ keyTypes: [...state.keyTypes, created] }));
    return created;
  },

  update: async (id: number, input: KeyTypeInput) => {
    const updated = await keyTypeApi.updateKeyType(id, input);
    set((state) => ({
      keyTypes: state.keyTypes.map((k) => (k.id === id ? updated : k)),
    }));
    return updated;
  },

  remove: async (id: number) => {
    await keyTypeApi.deleteKeyType(id);
    set((state) => ({
      keyTypes: state.keyTypes.filter((k) => k.id !== id),
    }));
  },
}));
