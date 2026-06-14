import { create } from 'zustand';
import type { Device, DeviceInput } from '../types/device';
import type { Tag } from '../types/tag';
import * as deviceApi from '../api/devices';
import type {
  ExportResponse,
  RestoreRequest,
  RestoreResponse,
  StatisticsResponse,
} from '../api/devices';

interface DeviceState {
  devices: Device[];
  current: Device | null;
  loading: boolean;
  statisticsLoading: boolean;
  exporting: boolean;
  restoring: boolean;
  error: string | null;
  statisticsError: string | null;
  actionSuccess: string | null;
  searchKeyword: string;
  page: number;
  pageSize: number;
  total: number;
  statistics: StatisticsResponse | null;
  fetchAll: (keyword?: string, page?: number, pageSize?: number) => Promise<void>;
  fetchOne: (id: number) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  create: (input: DeviceInput) => Promise<Device>;
  update: (id: number, input: DeviceInput) => Promise<Device>;
  remove: (id: number) => Promise<void>;
  updateTags: (id: number, tags: Tag[]) => void;
  clearCurrent: () => void;
  exportData: () => Promise<ExportResponse>;
  restoreData: (request: RestoreRequest) => Promise<RestoreResponse>;
  setSearchKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearSuccess: () => void;
  clearError: () => void;
  clearStatisticsError: () => void;
}

/**
 * 设备数据全局状态
 */
export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  current: null,
  loading: false,
  statisticsLoading: false,
  exporting: false,
  restoring: false,
  error: null,
  statisticsError: null,
  actionSuccess: null,
  searchKeyword: '',
  page: 1,
  pageSize: 3,
  total: 0,
  statistics: null,

  fetchStatistics: async () => {
    set({ statisticsLoading: true, statisticsError: null });
    try {
      const result = await deviceApi.fetchDeviceStatistics();
      set({ statistics: result, statisticsLoading: false });
    } catch {
      set({ statisticsLoading: false, statisticsError: '加载统计数据失败' });
    }
  },

  fetchAll: async (keyword?: string, page?: number, pageSize?: number) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const currentKeyword = keyword !== undefined ? keyword : state.searchKeyword;
      const currentPage = page !== undefined ? page : state.page;
      const currentPageSize = pageSize !== undefined ? pageSize : state.pageSize;

      const result = await deviceApi.fetchDevices(currentKeyword || undefined, currentPage, currentPageSize);
      set({
        devices: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        loading: false,
        searchKeyword: currentKeyword,
      });
    } catch {
      set({ loading: false, error: '加载设备列表失败' });
    }
  },

  fetchOne: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const current = await deviceApi.fetchDevice(id);
      set({ current, loading: false });
    } catch {
      set({ loading: false, error: '加载设备详情失败', current: null });
    }
  },

  create: async (input: DeviceInput) => {
    const created = await deviceApi.createDevice(input);
    const state = get();
    await Promise.all([
      state.fetchAll(state.searchKeyword, 1, state.pageSize),
      state.fetchStatistics(),
    ]);
    return created;
  },

  update: async (id: number, input: DeviceInput) => {
    const updated = await deviceApi.updateDevice(id, input);
    const state = get();
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? updated : d)),
      current: s.current?.id === id ? updated : s.current,
    }));
    await state.fetchStatistics();
    return updated;
  },

  remove: async (id: number) => {
    await deviceApi.deleteDevice(id);
    const state = get();
    const maxPage = Math.max(1, Math.ceil((state.total - 1) / state.pageSize));
    const newPage = Math.min(state.page, maxPage);
    await Promise.all([
      state.fetchAll(state.searchKeyword, newPage, state.pageSize),
      state.fetchStatistics(),
    ]);
  },

  updateTags: (id: number, tags: Tag[]) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, tags } : d
      ),
      current: state.current?.id === id ? { ...state.current, tags } : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),

  exportData: async () => {
    set({ exporting: true, error: null });
    try {
      const result = await deviceApi.exportDevices();
      set({ exporting: false, actionSuccess: `导出成功，共 ${result.count} 条数据` });
      return result;
    } catch (err) {
      set({ exporting: false });
      throw err;
    }
  },

  restoreData: async (request: RestoreRequest) => {
    set({ restoring: true, error: null });
    try {
      const result = await deviceApi.restoreDevices(request);
      const state = get();
      await Promise.all([
        state.fetchAll(state.searchKeyword, 1, state.pageSize),
        state.fetchStatistics(),
      ]);
      set({ restoring: false, actionSuccess: result.message });
      return result;
    } catch (err) {
      set({ restoring: false });
      throw err;
    }
  },

  clearSuccess: () => set({ actionSuccess: null }),
  clearError: () => set({ error: null }),
  clearStatisticsError: () => set({ statisticsError: null }),
  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),
  setPage: (page: number) => set({ page }),
  setPageSize: (pageSize: number) => set({ pageSize }),
}));
