import type { BaseRecord } from "@refinedev/core";
import { BankName } from "./bank-name-enum";

export interface ISupplier extends BaseRecord {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  bank_account?: string | null;
  bank_name?: BankName | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
