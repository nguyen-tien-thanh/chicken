/** Khớp Prisma `enum ProductType`. */
export type ProductType = 'LIVE' | 'PROCESSED' | 'PART';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  LIVE: 'Hàng sống',
  PROCESSED: 'Đã chế biến',
  PART: 'Phụ phẩm / linh kiện',
};

export const PRODUCT_TYPE_OPTIONS = (
  Object.entries(PRODUCT_TYPE_LABELS) as [ProductType, string][]
).map(([value, label]) => ({ value, label }));
