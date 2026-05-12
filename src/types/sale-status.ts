export type SaleStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
};

export const SALE_STATUS_OPTIONS = (
  Object.entries(SALE_STATUS_LABELS) as [SaleStatus, string][]
).map(([value, label]) => ({ value, label }));
