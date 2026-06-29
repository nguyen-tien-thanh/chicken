export type VoucherLineItem = {
  key: number;
  id?: string;
  product_id?: string;
  /** Khối lượng cân (gross, bao gồm lồng khi bán theo kg). */
  quantity: number | null;
  /** Trọng lượng lồng (kg), chỉ áp dụng khi quantity_unit = kg. */
  cage_weight?: number | null;
  quantity_unit: 'kg' | 'con';
  unit_price: number;
  note?: string;
};

export const QUANTITY_UNIT_OPTIONS = [
  { value: 'kg' as const, label: 'kg' },
  { value: 'con' as const, label: 'con' },
];
