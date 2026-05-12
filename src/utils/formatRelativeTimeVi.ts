import dayjs from 'dayjs';

export type RelativeTimeInput = Date | string | number | null | undefined;

/**
 * Chuỗi kiểu "10 giây trước", "10 phút trước", "Hôm qua", "2 ngày trước"…
 */
export function formatRelativeTimeVi(input: RelativeTimeInput): string {
  if (input == null) return '';

  const then = dayjs(input);
  const now = dayjs();

  if (!then.isValid()) return '';

  const secondsTotal = now.diff(then, 'second');
  if (secondsTotal < 0) {
    const abs = Math.abs(secondsTotal);
    if (abs < 60) return `sau ${abs} giây`;
    const m = Math.abs(now.diff(then, 'minute'));
    if (m < 60) return `sau ${m} phút`;
    const h = Math.abs(now.diff(then, 'hour'));
    if (h < 24) return `sau ${h} giờ`;
    return then.format('DD/MM/YYYY HH:mm');
  }

  if (secondsTotal < 60) {
    return `${Math.max(1, secondsTotal)} giây trước`;
  }

  const minutesTotal = now.diff(then, 'minute');
  if (minutesTotal < 60) {
    return `${minutesTotal} phút trước`;
  }

  const hoursTotal = now.diff(then, 'hour');
  if (hoursTotal < 24) {
    return `${hoursTotal} giờ trước`;
  }

  const dayDiff = now.startOf('day').diff(then.startOf('day'), 'day');
  if (dayDiff === 1) {
    return 'Hôm qua';
  }
  if (dayDiff >= 2 && dayDiff < 30) {
    return `${dayDiff} ngày trước`;
  }

  const monthsTotal = now.diff(then, 'month');
  if (monthsTotal < 12) {
    return `${monthsTotal} tháng trước`;
  }

  const yearsTotal = now.diff(then, 'year');
  return `${yearsTotal} năm trước`;
}
