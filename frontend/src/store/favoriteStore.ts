import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteState {
  favoriteIds: number[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (id: number) => void;
  clearAll: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      isFavorite: (id: number) => {
        return get().favoriteIds.includes(id);
      },

      addFavorite: (id: number) => {
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds
            : [...state.favoriteIds, id],
        }));
      },

      removeFavorite: (id: number) => {
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((fid) => fid !== id),
        }));
      },

      toggleFavorite: (id: number) => {
        const state = get();
        if (state.favoriteIds.includes(id)) {
          state.removeFavorite(id);
        } else {
          state.addFavorite(id);
        }
      },

      clearAll: () => {
        set({ favoriteIds: [] });
      },
    }),
    {
      name: 'sample-favorites',
    }
  )
);
