import axios from 'axios';
import type { OperationLog, OperationType } from '../types/operationLog';

const api = axios.create({
  baseURL: '/api',
});

export interface OperationLogPaginatedResponse {
  data: OperationLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FetchOperationLogsParams {
  page?: number;
  pageSize?: number;
  sampleId?: number;
  operationType?: OperationType;
}

/**
 * 获取操作日志列表（按时间倒序分页）
 */
export async function fetchOperationLogs(
  params: FetchOperationLogsParams = {}
): Promise<OperationLogPaginatedResponse> {
  const { data } = await api.get<OperationLogPaginatedResponse>('/operation-logs', {
    params: {
      ...(params.page ? { page: params.page } : {}),
      ...(params.pageSize ? { pageSize: params.pageSize } : {}),
      ...(params.sampleId ? { sampleId: params.sampleId } : {}),
      ...(params.operationType ? { operationType: params.operationType } : {}),
    },
  });
  return data;
}
