import type { VoucherLineItem } from './types';

type LineQuantityFields = Pick<
  VoucherLineItem,
  'quantity' | 'cage_weight' | 'quantity_unit'
>;

export function lineNetQuantity(row: LineQuantityFields): number {
  const gross = row.quantity ?? 0;
  if (row.quantity_unit !== 'kg') return gross;
  return Math.max(0, gross - (row.cage_weight ?? 0));
}

export function lineAmount(
  row: LineQuantityFields & Pick<VoucherLineItem, 'unit_price'>,
): number {
  return lineNetQuantity(row) * row.unit_price;
}

export function formatSaleLineQuantity(
  quantity: number,
  quantity_unit: string,
  cage_weight?: number | null,
): string {
  const unit = quantity_unit ?? '';
  if (quantity_unit !== 'kg' || !cage_weight) {
    return `${quantity} ${unit}`.trim();
  }
  const net = Math.max(0, quantity - cage_weight);
  return `${quantity} kg (−${cage_weight} lồng → ${net} kg)`;
}
