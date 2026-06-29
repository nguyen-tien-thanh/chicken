/** Bỏ khoảng trắng; +84 → 0 (đầu số VN). */
export function normalizeVietnamesePhone(phone: string): string {
  let normalized = phone.replace(/\s+/g, '');
  if (normalized.startsWith('+84')) {
    normalized = `0${normalized.slice(3)}`;
  }
  return normalized;
}

/** Hiển thị SĐT theo nhóm 4.3.3 (vd. 0912.345.678). */
export function formatVietnamesePhone(
  phone: string | null | undefined,
): string {
  if (phone == null || phone === '') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
}
