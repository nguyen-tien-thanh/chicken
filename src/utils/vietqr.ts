/**
 * VietQR image API — same shape as legacy Nest `VietQRService.generateQRUrl`.
 * @see https://www.vietqr.io/danh-sach-api/generate-qr-code/
 */
const ADD_INFO_MAX = 120;

function envTrim(
  key:
    | 'VITE_VIETQR_BANK_CODE'
    | 'VITE_VIETQR_ACCOUNT_NUMBER'
    | 'VITE_VIETQR_ACCOUNT_NAME',
): string {
  const v = import.meta.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

export function isVietQrConfigured(): boolean {
  return Boolean(
    envTrim('VITE_VIETQR_BANK_CODE') &&
      envTrim('VITE_VIETQR_ACCOUNT_NUMBER') &&
      envTrim('VITE_VIETQR_ACCOUNT_NAME'),
  );
}

/** Returns PNG image URL, or `null` if env incomplete or `amount` &lt;= 0. */
export function buildVietQrImageUrl(
  amount: number,
  description: string,
): string | null {
  if (!isVietQrConfigured()) return null;

  const bankCode = envTrim('VITE_VIETQR_BANK_CODE');
  const accountNumber = envTrim('VITE_VIETQR_ACCOUNT_NUMBER');
  const accountName = envTrim('VITE_VIETQR_ACCOUNT_NAME');

  const rounded = Math.max(0, Math.round(Number(amount)));
  if (rounded <= 0) return null;

  const addInfo = description.slice(0, ADD_INFO_MAX);
  const encodedName = encodeURIComponent(accountName);
  const encodedDesc = encodeURIComponent(addInfo);

  return (
    `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png` +
    `?amount=${rounded}&addInfo=${encodedDesc}&accountName=${encodedName}`
  );
}

/** Payment block for invoice UI / print when còn nợ và đã cấu hình VietQR. */
export function buildSaleInvoiceQrPayment(sale: {
  id: string;
  remaining_amount?: number | null;
}): { sale_id: string; id: string; amount: number; qrUrl: string } | undefined {
  const amount = Number(sale.remaining_amount ?? 0);
  if (amount <= 0) return undefined;

  const qrUrl = buildVietQrImageUrl(amount, `Phieu ban ${sale.id.slice(0, 8)}`);
  if (!qrUrl) return undefined;

  return {
    sale_id: sale.id,
    id: sale.id,
    amount,
    qrUrl,
  };
}
