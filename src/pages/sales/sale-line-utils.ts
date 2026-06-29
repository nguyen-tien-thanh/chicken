import { lineAmount, type VoucherLineItem } from '@/components';

export function saleItemCageWeight(row: VoucherLineItem): number {
  return row.quantity_unit === 'kg' ? Number(row.cage_weight ?? 0) : 0;
}

export function buildSaleItemPayload(row: VoucherLineItem) {
  const amount = lineAmount(row);
  return {
    product_id: row.product_id!,
    quantity: row.quantity!,
    cage_weight: saleItemCageWeight(row),
    quantity_unit: row.quantity_unit,
    unit_price: row.unit_price,
    amount,
    note: row.note ?? null,
    cost_amount: 0,
    profit_amount: amount,
  };
}

export function hasInvalidCageWeight(lines: VoucherLineItem[]): boolean {
  return lines.some(
    row =>
      row.quantity_unit === 'kg' &&
      saleItemCageWeight(row) > (row.quantity ?? 0),
  );
}
