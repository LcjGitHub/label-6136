export type OperationType = 'create' | 'update' | 'delete';

export interface OperationLog {
  id: number;
  operation_type: OperationType;
  sample_id: number;
  sample_brand_model: string;
  change_summary: string;
  created_at: string;
}
