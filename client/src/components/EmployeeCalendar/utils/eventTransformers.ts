import { Employee, ShiftRow } from '../../../types/common';
import { CalendarEvent } from '../types/calendar.types';
import { parseISO, eachDayOfInterval, isWithinInterval, setHours, setMinutes, addDays } from 'date-fns';

// Helper function to parse time string (HH:mm) to date
const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = parseISO(dateStr);
  return setMinutes(setHours(date, hours), minutes);
};

// Helper function to convert 12-hour format to 24-hour format
const convert12to24Hour = (time12: string): string => {
  if (!time12 || time12.includes(':') && !time12.includes('AM') && !time12.includes('PM')) {
    return time12; // Already in 24-hour format
  }
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hours24 = hours;
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Transform shifts to calendar events
export const transformShiftsToEvents = (
  employee: Employee,
  shifts: ShiftRow[],
  startDate: string,
  endDate: string
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dateRange = eachDayOfInterval({ start, end });

  dateRange.forEach(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    
    // Check manual shifts first (they override fixed shifts)
    const manualShiftId = employee.manualShifts?.[dateStr];
    const fixedShiftId = employee.fixedShifts?.[dayOfWeek]?.[0];
    const shiftId = manualShiftId !== undefined ? manualShiftId : fixedShiftId;
    
    if (shiftId && shiftId !== 'day-off') {
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) return;
      
      // Convert times to 24-hour format if needed
      const startTime24 = convert12to24Hour(shift.startTime);
      const endTime24 = convert12to24Hour(shift.endTime);
      
      // Parse times
      const [startHours, startMinutes] = startTime24.split(':').map(Number);
      const [endHours, endMinutes] = endTime24.split(':').map(Number);
      
      let eventStart = setMinutes(setHours(date, startHours), startMinutes);
      let eventEnd = setMinutes(setHours(date, endHours), endMinutes);
      
      // Handle shifts that cross midnight
      if (eventEnd <= eventStart) {
        eventEnd = addDays(eventEnd, 1);
      }
      
      const event: CalendarEvent = {
        id: `shift-${employee.id}-${dateStr}`,
        title: shift.name || `${shift.startTime} - ${shift.endTime}`,
        start: eventStart,
        end: eventEnd,
        resource: {
          type: 'shift',
          shiftId: shift.id,
          color: shift.color || '#3B82F6',
          isFixed: manualShiftId === undefined && fixedShiftId !== undefined,
          isManual: manualShiftId !== undefined,
          isLocked: !!employee.lockedShifts?.[dateStr],
          employeeId: employee.id,
          employeeName: employee.name
        }
      };
      
      events.push(event);
    }
  });
  
  return events;
};

// Transform leaves to calendar events
export const transformLeavesToEvents = (
  employee: Employee,
  startDate: string,
  endDate: string
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  if (!employee.leave) return events;
  
  const periodStart = parseISO(startDate);
  const periodEnd = parseISO(endDate);
  
  employee.leave.forEach(leave => {
    if (leave.isArchived) return;
    
    const leaveStart = parseISO(leave.startDate);
    const leaveEnd = parseISO(leave.endDate);
    
    // Get days that fall within the calendar period
    const effectiveStart = leaveStart < periodStart ? periodStart : leaveStart;
    const effectiveEnd = leaveEnd > periodEnd ? periodEnd : leaveEnd;
    
    if (effectiveStart <= effectiveEnd) {
      const leaveDays = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
      
      leaveDays.forEach(date => {
        const event: CalendarEvent = {
          id: `leave-${employee.id}-${leave.id}-${date.toISOString()}`,
          title: `${leave.leaveType} (${leave.hoursPerDay}h/day)`,
          start: setHours(date, 0),
          end: setHours(date, 23),
          resource: {
            type: 'leave',
            leaveType: leave.leaveType,
            hoursPerDay: leave.hoursPerDay,
            employeeId: employee.id,
            employeeName: employee.name
          }
        };
        
        events.push(event);
      });
    }
  });
  
  return events;
};

// Transform comments to calendar events
export const transformCommentsToEvents = (
  employee: Employee,
  shifts: ShiftRow[],
  startDate: string,
  endDate: string
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  if (!employee.shiftComments) return events;
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  Object.entries(employee.shiftComments).forEach(([dateStr, comment]) => {
    const date = parseISO(dateStr);
    
    if (isWithinInterval(date, { start, end })) {
      // Find the shift for this date to get timing
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      const manualShiftId = employee.manualShifts?.[dateStr];
      const fixedShiftId = employee.fixedShifts?.[dayOfWeek]?.[0];
      const shiftId = manualShiftId !== undefined ? manualShiftId : fixedShiftId;
      
      let eventStart = setHours(date, 12); // Default noon
      let eventEnd = setHours(date, 13);   // Default 1 hour
      
      if (shiftId && shiftId !== 'day-off') {
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
          const startTime24 = convert12to24Hour(shift.startTime);
          const [startHours, startMinutes] = startTime24.split(':').map(Number);
          eventStart = setMinutes(setHours(date, startHours), startMinutes);
          eventEnd = addDays(eventStart, 0); // Same as start for comments
        }
      }
      
      const event: CalendarEvent = {
        id: `comment-${employee.id}-${dateStr}`,
        title: `📝 ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
        start: eventStart,
        end: eventEnd,
        resource: {
          type: 'comment',
          comment: comment,
          employeeId: employee.id,
          employeeName: employee.name
        }
      };
      
      events.push(event);
    }
  });
  
  return events;
};