import React from 'react';
import { ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { Employee } from '../../types/common';
import { format } from 'date-fns';
import { CalendarEvent } from '../EmployeeCalendar/types/calendar.types';
import { exportToPDF, exportToImage, exportToICal, printCalendar } from '../EmployeeCalendar/utils/exportHelpers';

interface CalendarHeaderProps {
  employee: Employee;
  currentDate: Date;
  onNavigate: (date: Date) => void;
  totalEvents: number;
  onPreviousEmployee?: () => void;
  onNextEmployee?: () => void;
  hasPreviousEmployee?: boolean;
  hasNextEmployee?: boolean;
  employeeIndex?: number;
  totalEmployees?: number;
  events?: CalendarEvent[];
  startDate?: string;
  endDate?: string;
  calendarRef?: React.RefObject<HTMLDivElement>;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  employee,
  currentDate,
  onNavigate,
  totalEvents,
  onPreviousEmployee,
  onNextEmployee,
  hasPreviousEmployee = false,
  hasNextEmployee = false,
  employeeIndex = 0,
  totalEmployees = 0,
  events = [],
  startDate = '',
  endDate = '',
  calendarRef
}) => {
  const handleExport = async (type: 'pdf' | 'image' | 'ical') => {
    try {
      if (type === 'pdf' && calendarRef?.current) {
        await exportToPDF(calendarRef.current, employee.name, startDate, endDate);
      } else if (type === 'image' && calendarRef?.current) {
        await exportToImage(calendarRef.current, employee.name);
      } else if (type === 'ical') {
        exportToICal(events, employee.name);
      }
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error);
      alert(`Failed to export calendar as ${type}. Please try again.`);
    }
  };

  const handlePrint = () => {
    try {
      if (calendarRef?.current) {
        printCalendar(calendarRef.current, employee.name, startDate, endDate);
      } else {
        window.print();
      }
    } catch (error) {
      console.error('Error printing calendar:', error);
      alert('Failed to print calendar. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
      <div className="flex items-center gap-4">
        {/* Employee Navigation */}
        {(onPreviousEmployee || onNextEmployee) && (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousEmployee}
                disabled={!hasPreviousEmployee}
                className="h-8 w-8 p-0"
                title="Previous employee"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-gray-600">
                {employeeIndex + 1} of {totalEmployees}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextEmployee}
                disabled={!hasNextEmployee}
                className="h-8 w-8 p-0"
                title="Next employee"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-10 w-px bg-gray-300" />
          </>
        )}
        
        <div>
          <h3 className="font-medium text-gray-700">Employee</h3>
          <p className="text-lg font-semibold">{employee.name}</p>
        </div>
        <div className="h-10 w-px bg-gray-300" />
        <div>
          <h3 className="font-medium text-gray-700">Email</h3>
          <p className="text-sm">{employee.email}</p>
        </div>
        <div className="h-10 w-px bg-gray-300" />
        <div>
          <h3 className="font-medium text-gray-700">Total Events</h3>
          <p className="text-lg font-semibold">{totalEvents}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-4">
          <span className="text-sm text-gray-600">Export:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            title="Export as PDF"
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('image')}
            title="Export as Image"
          >
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('ical')}
            title="Export as iCal"
          >
            iCal
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
};