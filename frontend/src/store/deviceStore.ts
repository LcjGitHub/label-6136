import { create } from 'zustand';
import type { Device, DeviceInput } from '../types/device';
import * as deviceApi from '../api/devices';

interface DeviceState {
  devices: Device[];
  current: Device | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchOne: (id: number) => Promise<void>;
  create: (input: DeviceInput) => Promise<Device>;
  update: (id: number, input: DeviceInput) => Promise<Device>;
  remove: (id: number) => Promise<void>;
  clearCurrent: () => void;
}

/**
 * 设备数据全局状态
 */
export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  current: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const devices = await deviceApi.fetchDevices();
      set({ devices, loading: false });
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
    set((state) => ({ devices: [...state.devices, created] }));
    return created;
  },

  update: async (id: number, input: DeviceInput) => {
    const updated = await deviceApi.updateDevice(id, input);
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? updated : d)),
      current: state.current?.id === id ? updated : state.current,
    }));
    return updated;
  },

  remove: async (id: number) => {
    await deviceApi.deleteDevice(id);
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },

  clearCurrent: () => set({ current: null }),
}));
