import { Input } from 'antd';
import { useState } from 'react';

export type InputQuantityProps = {
  value?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  style?: React.CSSProperties;
};

/** Số nguyên ≥ 4 chữ số → chia 10 (1234 → 123.4). Có dấu thập phân thì giữ nguyên. */
export function parseQuantityInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const sepIndex = Math.max(trimmed.lastIndexOf(','), trimmed.lastIndexOf('.'));
  if (sepIndex >= 0) {
    const intPart = trimmed.slice(0, sepIndex).replace(/\D/g, '');
    const fracPart = trimmed.slice(sepIndex + 1).replace(/\D/g, '');
    const normalized = fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
    if (!normalized) return null;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  const num = Number(digits);
  if (digits.length >= 4) return num / 10;
  return num;
}

function formatDisplay(num: number): string {
  return num.toLocaleString('vi-VN', {
    maximumFractionDigits: 3,
  });
}

export const InputQuantity = ({
  value,
  onChange,
  onBlur,
  placeholder = '0',
  disabled,
  readOnly,
  style,
}: InputQuantityProps) => {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? raw
    : value != null
      ? formatDisplay(value)
      : '';

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = e => {
    setFocused(true);
    setRaw(value != null ? String(value).replace('.', ',') : '');
    requestAnimationFrame(() => e.target.select());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/[^0-9.,]/g, '');
    setRaw(next);
    onChange?.(parseQuantityInput(next));
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    setFocused(false);
    onChange?.(parseQuantityInput(raw));
    onBlur?.(e);
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      style={{ width: '100%', ...style }}
      inputMode="decimal"
    />
  );
};
