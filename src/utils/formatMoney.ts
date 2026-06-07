export type FormatMoneyOptions = {
  locale?: string;
  currencySuffix?: string;
  empty?: string;
};

/**
 * Format a number using `toLocaleString` for UI display.
 * Defaults to Vietnamese formatting and returns empty string for null/undefined.
 */
export function formatMoney(
  n: number | null | undefined,
  {
    locale = 'vi-VN',
    currencySuffix = 'đ',
    empty = '',
  }: FormatMoneyOptions = {},
) {
  if (n == null || Number.isNaN(Number(n))) return empty;
  const base = Number(n).toLocaleString(locale);
  return currencySuffix ? `${base} ${currencySuffix}` : base;
}

export function showMoney(n: number | null | undefined) {
  return formatMoney(n, { empty: '' });
}

export function joinDetail(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' · ');
}
