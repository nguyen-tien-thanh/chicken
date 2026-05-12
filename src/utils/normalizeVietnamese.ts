/**
 * Normalize a Vietnamese string by removing diacritical marks and converting to lowercase.
 * Useful for accent-insensitive search (e.g. "tien" matches "Tiến").
 */
export function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Check if `text` contains `search` after normalizing both strings.
 * Case-insensitive and accent-insensitive.
 */
export function containsVietnamese(text: string, search: string): boolean {
  if (!search) return true;
  return normalizeVietnamese(text).includes(normalizeVietnamese(search));
}
