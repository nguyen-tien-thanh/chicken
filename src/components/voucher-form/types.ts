export type VoucherLineItem = {
  key: number;
  id?: string;
  product_id?: string;
  quantity: number | null;
  quantity_unit: 'kg' | 'con';
  unit_price: number;
  note?: string;
};

export const QUANTITY_UNIT_OPTIONS = [
  { value: 'kg' as const, label: 'kg' },
  { value: 'con' as const, label: 'con' },
];
