import type { BaseRecord } from "@refinedev/core";

import type { IPurchaseItem } from "./purchase-item";
import type { ISupplier } from "./supplier";

export interface IPurchase extends BaseRecord {
  id: string;
  purchase_date: string;
  cages_count: number;
  cages_weight: number;
  average_weight: number;
  total_amount: number;
  note?: string | null;
  supplier_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  supplier?: Pick<ISupplier, "id" | "name" | "phone">;
  purchase_items?: IPurchaseItem[];
}
