import { Input } from 'antd';
import { useState } from 'react';

export type InputMoneyProps = {
  value?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  style?: React.CSSProperties;
};

// vi-VN dùng dấu . phân cách nghìn: 1.200.000
function formatDisplay(num: number): string {
  return num.toLocaleString('vi-VN');
}

// Thêm dấu . vào chuỗi số đang gõ
function addThousandSeparator(str: string): string {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const InputMoney = ({
  value,
  onChange,
  onBlur,
  placeholder = '0',
  disabled,
  readOnly,
  style,
}: InputMoneyProps) => {
  const [raw, setRaw] = useState<string>('');
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? addThousandSeparator(raw)
    : value != null
    ? formatDisplay(value)
    : '';

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true);
    setRaw(value != null ? String(value) : '');
    requestAnimationFrame(() => e.target.select());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Loại bỏ dấu . phân cách, chỉ giữ chữ số
    const digits = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setRaw(digits);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false);
    const num = raw === '' ? null : Number(raw);
    onChange?.(num);
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
      suffix="đ"
      style={{ width: '100%', ...style }}
      inputMode="numeric"
    />
  );
};
