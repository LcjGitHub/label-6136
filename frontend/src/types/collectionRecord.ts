export interface CollectionRecord {
  id: number;
  sample_id: number;
  collector_id: number;
  collection_date: string;
  site_note: string;
  created_at: string;
  updated_at: string;
  sample: {
    id: number;
    brand_model: string;
  } | null;
  collector: {
    id: number;
    name: string;
  } | null;
}

export type CollectionRecordInput = Omit<
  CollectionRecord,
  'id' | 'created_at' | 'updated_at' | 'sample' | 'collector'
>;

export interface CollectionRecordListParams {
  sample_id?: number;
  collector_id?: number;
}
