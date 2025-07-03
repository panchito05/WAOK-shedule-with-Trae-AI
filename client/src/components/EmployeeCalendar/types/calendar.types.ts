import { Employee, ShiftRow } from '../../../types/common';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'shift' | 'leave' | 'comment';
    shiftId?: string;
    color?: string;
    isFixed?: boolean;
    isManual?: boolean;
    isLocked?: boolean;
    leaveType?: string;
    hoursPerDay?: number;
    comment?: string;
    employeeId: string;
    employeeName: string;
  };
}

export interface EmployeeCalendarProps {
  employee: Employee;
  shifts: ShiftRow[];
  startDate: string;
  endDate: string;
  isOpen: boolean;
  onClose: () => void;
  allEmployees?: Employee[];
  currentEmployeeIndex?: number;
  onEmployeeChange?: (employee: Employee) => void;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  employee: Employee;
  onEventClick?: (event: CalendarEvent) => void;
  onNavigate?: (date: Date) => void;
}

export interface CalendarFilters {
  showShifts: boolean;
  showLeaves: boolean;
  showComments: boolean;
  leaveTypes: string[];
}

export interface CalendarStats {
  totalHours: number;
  workDays: number;
  daysOff: number;
  weekendsOff: number;
  leaves: {
    type: string;
    days: number;
    hours: number;
  }[];
}