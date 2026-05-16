import type { BaseRecord } from '@refinedev/core';

import type { IProduct } from './product';

export interface IPurchaseItem extends BaseRecord {
  id: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  amount: number;
  note?: string | null;
  purchase_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product?: Pick<IProduct, 'id' | 'name' | 'type'>;
}
