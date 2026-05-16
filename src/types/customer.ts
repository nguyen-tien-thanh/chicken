import type { BaseRecord } from '@refinedev/core';

export interface ICustomer extends BaseRecord {
  id: string;
  name?: string | null;
  phone: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
