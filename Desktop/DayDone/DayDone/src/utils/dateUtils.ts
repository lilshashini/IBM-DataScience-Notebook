import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, parseISO } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekRange(date: Date) {
  return {
    start: formatDate(startOfWeek(date, { weekStartsOn: 1 })),
    end: formatDate(endOfWeek(date, { weekStartsOn: 1 }))
  };
}

export function getMonthRange(date: Date) {
  return {
    start: formatDate(startOfMonth(date)),
    end: formatDate(endOfMonth(date))
  };
}

export function getYearRange(date: Date) {
  return {
    start: formatDate(startOfYear(date)),
    end: formatDate(endOfYear(date))
  };
}

export function getDaysInYear(year: number): string[] {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return eachDayOfInterval({ start, end }).map(formatDate);
}

export function getYearFromDate(dateString: string): number {
  return parseISO(dateString).getFullYear();
}
