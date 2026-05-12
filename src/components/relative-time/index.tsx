import dayjs from 'dayjs';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  formatRelativeTimeVi,
  type RelativeTimeInput,
} from '@/utils/formatRelativeTimeVi';

export type RelativeTimeProps = {
  /** Thời điểm cần hiển thị (ISO string, timestamp, Date). */
  value: RelativeTimeInput;
  className?: string;
  style?: CSSProperties;
  /** Khi `value` rỗng / không hợp lệ. */
  emptyText?: string;
  /**
   * Tự làm mới nhãn sau N ms (vd. 10_000 → cập nhật mỗi 10s cho "vừa xong").
   * Mặc định 60_000; đặt `0` để tắt.
   */
  refreshMs?: number;
};

export const RelativeTime = ({
  value,
  className,
  style,
  emptyText = '—',
  refreshMs = 60_000,
}: RelativeTimeProps) => {
  const [label, setLabel] = useState(() => formatRelativeTimeVi(value));

  useEffect(() => {
    setLabel(formatRelativeTimeVi(value));
  }, [value]);

  useEffect(() => {
    if (refreshMs <= 0) return;

    const id = window.setInterval(() => {
      setLabel(formatRelativeTimeVi(value));
    }, refreshMs);

    return () => window.clearInterval(id);
  }, [value, refreshMs]);

  const text = label || emptyText;

  const title = useMemo(() => {
    if (value == null) return undefined;
    const d = dayjs(value);
    return d.isValid() ? d.format('DD/MM/YYYY HH:mm:ss') : undefined;
  }, [value]);

  return (
    <span className={className} style={style} title={title}>
      {text}
    </span>
  );
};
