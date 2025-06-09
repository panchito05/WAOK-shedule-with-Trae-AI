import { parse, parseISO, format } from 'date-fns';

/**
 * Parse a date string in either ISO (yyyy-MM-dd) or US format (MM/dd/yyyy)
 * and return a formatted string in day/monthName/year format, e.g. 2/June/2025.
 */
export function formatFriendlyDate(dateStr: string): string {
  let date: Date;
  if (dateStr.includes('-')) {
    date = parseISO(dateStr);
  } else if (dateStr.includes('/')) {
    date = parse(dateStr, 'MM/dd/yyyy', new Date());
  } else {
    date = new Date(dateStr);
  }
  return isNaN(date.getTime()) ? dateStr : format(date, 'd/MMMM/yyyy');
}
