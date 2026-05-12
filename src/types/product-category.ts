import type { BaseRecord } from "@refinedev/core";

export interface IProductCategory extends BaseRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
