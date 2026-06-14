import { create } from 'zustand';
import type { OperationLog, OperationType } from '../types/operationLog';
import * as operationLogApi from '../api/operationLogs';

interface OperationLogState {
  logs: OperationLog[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  sampleLogs: OperationLog[];
  sampleLogsLoading: boolean;
  sampleLogsError: string | null;
  fetchAll: (
    params?: { page?: number; pageSize?: number; operationType?: OperationType }
  ) => Promise<void>;
  fetchBySampleId: (sampleId: number, page?: number, pageSize?: number) => Promise<void>;
  clearSampleLogs: () => void;
  clearError: () => void;
  clearSampleLogsError: () => void;
}

export const useOperationLogStore = create<OperationLogState>((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
  sampleLogs: [],
  sampleLogsLoading: false,
  sampleLogsError: null,

  fetchAll: async (params) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const result = await operationLogApi.fetchOperationLogs({
        page: params?.page ?? state.page,
        pageSize: params?.pageSize ?? state.pageSize,
        operationType: params?.operationType,
      });
      set({
        logs: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        loading: false,
      });
    } catch {
      set({ loading: false, error: '加载操作日志失败' });
    }
  },

  fetchBySampleId: async (sampleId, page = 1, pageSize = 50) => {
    set({ sampleLogsLoading: true, sampleLogsError: null });
    try {
      const result = await operationLogApi.fetchOperationLogs({
        sampleId,
        page,
        pageSize,
      });
      set({
        sampleLogs: result.data,
        sampleLogsLoading: false,
      });
    } catch {
      set({ sampleLogsLoading: false, sampleLogsError: '加载操作历史失败' });
    }
  },

  clearSampleLogs: () => set({ sampleLogs: [], sampleLogsError: null }),
  clearError: () => set({ error: null }),
  clearSampleLogsError: () => set({ sampleLogsError: null }),
}));
