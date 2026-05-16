import type { BaseRecord } from '@refinedev/core';

import type { IProductCategory } from './product-category';
import type { ProductType } from './product-type';

export interface IProduct extends BaseRecord {
  id: string;
  name: string;
  type: ProductType;
  category_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category?: Pick<IProductCategory, 'id' | 'name'>;
}
