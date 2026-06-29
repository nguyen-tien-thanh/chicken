import type { HttpError } from '@refinedev/core';

const DUPLICATE_KEY = /23505|duplicate key|unique constraint/i;

function errorText(error: unknown): string {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return [
      e.message,
      e.code,
      e.details,
      e.hint,
      (e as HttpError).errors,
    ]
      .flat()
      .filter(Boolean)
      .map(String)
      .join(' ');
  }
  return String(error);
}

function isDuplicateKey(error: unknown): boolean {
  return DUPLICATE_KEY.test(errorText(error));
}

/** Dịch lỗi lưu khách hàng (vd. SĐT trùng) sang tiếng Việt. */
export function translateCustomerSaveError(error: unknown): HttpError | unknown {
  const httpError = error as HttpError;
  if (isDuplicateKey(error)) {
    return {
      ...httpError,
      message: 'Số điện thoại đã tồn tại',
    };
  }
  return error;
}

export function translateSaveError(
  error: unknown,
  resource?: string,
): HttpError | unknown {
  if (resource === 'customers') {
    return translateCustomerSaveError(error);
  }
  return error;
}
