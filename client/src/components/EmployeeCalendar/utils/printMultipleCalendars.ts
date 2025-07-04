import { Employee, ShiftRow } from '../../../types/common';
import { transformShiftsToEvents, transformLeavesToEvents, transformCommentsToEvents } from './eventTransformers';
import { CalendarEvent } from '../types/calendar.types';
import { format } from 'date-fns';
import { isEdge } from '@/utils/edgeCompat';

export type PrintPeriod = 'day' | 'week' | 'fortnight' | 'month';

// Generate HTML for a single employee calendar
const generateEmployeeCalendarHTML = (
  employee: Employee,
  events: CalendarEvent[],
  startDate: string,
  endDate: string
): string => {
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(event.start, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Generate calendar HTML
  let calendarHTML = `
    <div class="employee-calendar" style="page-break-after: always;">
      <h2 style="margin-bottom: 10px;">${employee.name}</h2>
      <p style="color: #666; margin-bottom: 20px;">
        ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}
      </p>
      <table class="calendar-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Shift</th>
            <th>Time</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Generate rows for each date
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  while (currentDate <= endDateObj) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    const dayOfWeek = format(currentDate, 'EEEE');
    
    if (dayEvents.length === 0) {
      calendarHTML += `
        <tr>
          <td>${format(currentDate, 'MMM d')}</td>
          <td>${dayOfWeek}</td>
          <td colspan="3" style="text-align: center; color: #999;">Day Off</td>
        </tr>
      `;
    } else {
      dayEvents.forEach((event, index) => {
        const isShift = event.resource.type === 'shift';
        const isLeave = event.resource.type === 'leave';
        const isComment = event.resource.type === 'comment';
        
        calendarHTML += `
          <tr>
            ${index === 0 ? `
              <td rowspan="${dayEvents.length}">${format(currentDate, 'MMM d')}</td>
              <td rowspan="${dayEvents.length}">${dayOfWeek}</td>
            ` : ''}
            <td style="background-color: ${isShift ? (event.resource.color || '#3B82F6') : isLeave ? '#19b08d' : '#FEF3C7'}; color: ${isShift ? 'white' : 'black'};">
              ${event.title}
              ${event.resource.isFixed ? '📌' : ''}
              ${event.resource.isLocked ? '🔒' : ''}
            </td>
            <td>${isShift ? `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}` : isLeave ? 'All Day' : ''}</td>
            <td>${isComment ? event.resource.comment : ''}</td>
          </tr>
        `;
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  calendarHTML += `
        </tbody>
      </table>
    </div>
  `;

  return calendarHTML;
};

// Print multiple employee calendars
export const printMultipleCalendars = (
  employees: Employee[],
  shifts: ShiftRow[],
  startDate: string,
  endDate: string,
  period: PrintPeriod = 'month'
) => {
  // Calculate period dates
  const periodDates = calculatePeriodDates(startDate, endDate, period);
  
  // Generate HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Employee Schedules - ${format(new Date(periodDates.start), 'MMM yyyy')}</title>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 18px;
            margin-top: 0;
          }
          .calendar-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .calendar-table th,
          .calendar-table td {
            border: 1px solid #ddd;
            padding: 4px 8px;
            text-align: left;
          }
          .calendar-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .employee-calendar {
            page-break-inside: avoid;
          }
          .summary {
            margin-bottom: 30px;
            text-align: center;
          }
          @page {
            size: landscape;
            margin: 0.5in;
          }
        }
      </style>
    </head>
    <body>
      <h1>Employee Schedule Report</h1>
      <div class="summary">
        <p><strong>Period:</strong> ${format(new Date(periodDates.start), 'MMMM d, yyyy')} - ${format(new Date(periodDates.end), 'MMMM d, yyyy')}</p>
        <p><strong>Total Employees:</strong> ${employees.length}</p>
        <p><strong>Generated:</strong> ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
      </div>
  `;

  // Generate calendar for each employee
  employees.forEach(employee => {
    const events: CalendarEvent[] = [];
    
    // Transform employee data to events
    events.push(...transformShiftsToEvents(employee, shifts, periodDates.start, periodDates.end));
    events.push(...transformLeavesToEvents(employee, periodDates.start, periodDates.end));
    events.push(...transformCommentsToEvents(employee, shifts, periodDates.start, periodDates.end));
    
    htmlContent += generateEmployeeCalendarHTML(employee, events, periodDates.start, periodDates.end);
  });

  htmlContent += `
      <script>
        window.onload = function() {
          window.print();
          ${isEdge() ? `
          // Edge compatibility: use matchMedia as fallback
          const mediaQueryList = window.matchMedia('print');
          let isPrinting = true;
          
          const handlePrintChange = function(mql) {
            if (!mql.matches && isPrinting) {
              isPrinting = false;
              window.close();
            }
          };
          
          if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handlePrintChange);
          } else if (mediaQueryList.addListener) {
            mediaQueryList.addListener(handlePrintChange);
          }
          
          // Fallback timeout for Edge
          setTimeout(function() {
            if (isPrinting) {
              window.close();
            }
          }, 1000);
          ` : `
          window.onafterprint = function() {
            window.close();
          };
          `}
        };
      </script>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert('Please allow pop-ups to print the schedules.');
  }
};

// Calculate period dates based on selected period
const calculatePeriodDates = (
  startDate: string,
  endDate: string,
  period: PrintPeriod
): { start: string; end: string } => {
  const today = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'day':
      start = today;
      end = today;
      break;
    case 'week':
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      end = new Date(start);
      end.setDate(start.getDate() + 6); // End of week (Saturday)
      break;
    case 'fortnight':
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // Start of week
      end = new Date(start);
      end.setDate(start.getDate() + 13); // Two weeks
      break;
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1); // First day of month
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of month
      break;
    default:
      // Use provided dates
      return { start: startDate, end: endDate };
  }

  // Ensure dates don't exceed the provided range
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  
  if (start < rangeStart) start = rangeStart;
  if (end > rangeEnd) end = rangeEnd;

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  };
};