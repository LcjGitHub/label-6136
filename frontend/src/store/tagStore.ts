import { create } from 'zustand';
import type { Tag, TagInput } from '../types/tag';
import * as tagApi from '../api/tags';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (input: TagInput) => Promise<Tag>;
  update: (id: number, input: TagInput) => Promise<Tag>;
  remove: (id: number) => Promise<void>;
}

/**
 * 标签数据全局状态
 */
export const useTagStore = create<TagState>((set) => ({
  tags: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const tags = await tagApi.fetchTags();
      set({ tags, loading: false });
    } catch {
      set({ loading: false, error: '加载标签列表失败' });
    }
  },

  create: async (input: TagInput) => {
    const created = await tagApi.createTag(input);
    set((state) => ({ tags: [...state.tags, created] }));
    return created;
  },

  update: async (id: number, input: TagInput) => {
    const updated = await tagApi.updateTag(id, input);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  },

  remove: async (id: number) => {
    await tagApi.deleteTag(id);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    }));
  },
}));
