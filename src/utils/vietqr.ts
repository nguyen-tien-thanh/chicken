import { bankOptions } from '@/types';

const ADD_INFO_MAX = 120;
const QUICK_LINK_BASE = 'https://img.vietqr.io/image';

type StoreBankEnvKey =
  | 'VITE_VIETQR_BANK_CODE'
  | 'VITE_VIETQR_ACCOUNT_NUMBER'
  | 'VITE_VIETQR_ACCOUNT_NAME';

function env(key: StoreBankEnvKey): string {
  const v = import.meta.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

function toBankBin(codeOrBin: string): string | null {
  const trimmed = codeOrBin.trim();
  if (!trimmed) return null;
  return (
    bankOptions.find(b => b.code === trimmed || b.bin === trimmed)?.bin ??
    (/^\d{6}$/.test(trimmed) ? trimmed : null)
  );
}

function getStoreAccount(): {
  bankCode: string;
  accountNumber: string;
  accountName: string;
} | null {
  const bankCode = env('VITE_VIETQR_BANK_CODE');
  const bank = toBankBin(bankCode);
  const accountNumber = env('VITE_VIETQR_ACCOUNT_NUMBER');
  const accountName = env('VITE_VIETQR_ACCOUNT_NAME');
  if (!bank || !bankCode || !accountNumber || !accountName) return null;
  return { bankCode, accountNumber, accountName };
}

export function buildVietQrImage(
  bankCode: string,
  accountNumber: string,
  options?: {
    accountName?: string;
    amount?: number;
    memo?: string;
    template?: 'compact' | 'compact2';
  },
): string | null {
  const bank = toBankBin(bankCode);
  const account = accountNumber.trim();
  if (!bank || !account) return null;

  const accountName = options?.accountName?.trim() ?? '';
  const amount =
    options?.amount != null && options.amount > 0
      ? String(Math.round(options.amount))
      : undefined;
  const memo = options?.memo?.trim().slice(0, ADD_INFO_MAX);

  const search = new URLSearchParams();
  if (amount) search.set('amount', amount);
  if (memo) search.set('addInfo', memo);
  if (accountName) search.set('accountName', accountName);

  const template = options?.template ?? 'compact';
  const path = `${QUICK_LINK_BASE}/${bank}-${account}-${template}.png`;
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export function buildSaleInvoiceQrPayment(sale: {
  id: string;
  remaining_amount?: number | null;
}): { sale_id: string; id: string; amount: number; qrUrl: string } | undefined {
  const account = getStoreAccount();
  if (!account) return undefined;

  const amount = Number(sale.remaining_amount ?? 0);
  if (amount <= 0) return undefined;

  const qrUrl = buildVietQrImage(account.bankCode, account.accountNumber, {
    accountName: account.accountName,
    amount,
    memo: `Phieu ban ${sale.id.slice(0, 8)}`,
    template: 'compact2',
  });
  if (!qrUrl) return undefined;

  return { sale_id: sale.id, id: sale.id, amount, qrUrl };
}
