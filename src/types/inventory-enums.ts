/** Khớp Prisma `enum InventoryTransactionType`. */
export type InventoryTransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'OTHER';

/** Khớp Prisma `enum InventoryTransactionDirection`. */
export type InventoryTransactionDirection = 'IN' | 'OUT';

export const INVENTORY_TX_TYPE_LABELS: Record<
  InventoryTransactionType,
  string
> = {
  PURCHASE: 'Phiếu nhập',
  SALE: 'Phiếu bán',
  ADJUSTMENT: 'Phiếu điều chỉnh',
  TRANSFER: 'Phiếu chuyển kho',
  OTHER: 'Phiếu khác',
};

export const INVENTORY_TX_DIRECTION_LABELS: Record<
  InventoryTransactionDirection,
  string
> = {
  IN: 'Nhập',
  OUT: 'Xuất',
};

export const INVENTORY_TX_DIRECTION_TAG_COLORS: Record<
  InventoryTransactionDirection,
  'gold' | 'green'
> = {
  IN: 'gold',
  OUT: 'green',
};
