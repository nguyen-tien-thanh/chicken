import type { BaseRecord } from '@refinedev/core';

import type {
  InventoryTransactionDirection,
  InventoryTransactionType,
} from './inventory-enums';
import type { IProduct } from './product';

export interface IInventoryTransaction extends BaseRecord {
  id: string;
  transaction_date: string;
  ref_type: InventoryTransactionType;
  ref_id: string;
  direction: InventoryTransactionDirection;
  quantity: number;
  quantity_unit: string;
  unit_cost: number;
  total_cost: number;
  note?: string | null;
  product_id: string;
  created_at: string;
  updated_at: string;
  product?: Pick<IProduct, 'id' | 'name' | 'type'>;
}
