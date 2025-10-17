import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format date with specified format
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const fromNow = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Check if date is expired
 */
export const isExpired = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * Get date range for filter
 */
export const getDateRange = (range: 'today' | 'week' | 'month' | 'year'): [string, string] => {
  const today = dayjs();
  const start = {
    today: today.startOf('day'),
    week: today.startOf('week'),
    month: today.startOf('month'),
    year: today.startOf('year'),
  }[range];

  return [start.toISOString(), today.toISOString()];
};
