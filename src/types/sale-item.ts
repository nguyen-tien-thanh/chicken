import type { BaseRecord } from '@refinedev/core';

import type { IProduct } from './product';

export interface ISaleItem extends BaseRecord {
  id: string;
  quantity: number;
  cage_weight?: number | null;
  quantity_unit: string;
  unit_price: number;
  amount: number;
  cost_amount: number;
  profit_amount: number;
  note?: string | null;
  sale_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product?: Pick<IProduct, 'id' | 'name' | 'type'>;
}
