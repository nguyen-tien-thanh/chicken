import type { BaseRecord } from "@refinedev/core";

import type { ICustomer } from "./customer";
import type { ISaleItem } from "./sale-item";
import type { SaleStatus } from "./sale-status";

export interface ISale extends BaseRecord {
  id: string;
  sale_date: string;
  subtotal_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: SaleStatus;
  note?: string | null;
  customer_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  customer?: Pick<ICustomer, "id" | "name" | "phone">;
  sale_items?: ISaleItem[];
}
