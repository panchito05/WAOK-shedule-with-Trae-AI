import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CalendarView } from './CalendarView';
import { CalendarHeader } from './CalendarHeader';
import { CalendarFilters } from './CalendarFilters';
import { CalendarStats } from './CalendarStats';
import { transformShiftsToEvents, transformLeavesToEvents, transformCommentsToEvents } from '../EmployeeCalendar/utils/eventTransformers';
import { EmployeeCalendarProps, CalendarEvent, CalendarFilters as CalendarFiltersType } from '../EmployeeCalendar/types/calendar.types';
import { cn } from '../../lib/utils';

export const EmployeeCalendarModal: React.FC<EmployeeCalendarProps> = ({
  employee,
  shifts,
  startDate,
  endDate,
  isOpen,
  onClose,
  allEmployees = [],
  currentEmployeeIndex = 0,
  onEmployeeChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(startDate));
  const [currentEmployee, setCurrentEmployee] = useState(employee);
  const [employeeIndex, setEmployeeIndex] = useState(currentEmployeeIndex);
  const [filters, setFilters] = useState<CalendarFiltersType>({
    showShifts: true,
    showLeaves: true,
    showComments: true,
    leaveTypes: []
  });
  const calendarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Update current employee when prop changes
  useEffect(() => {
    setCurrentEmployee(employee);
    setEmployeeIndex(currentEmployeeIndex);
  }, [employee, currentEmployeeIndex]);

  // Handle employee navigation
  const handlePreviousEmployee = () => {
    if (allEmployees.length > 0 && employeeIndex > 0) {
      const newIndex = employeeIndex - 1;
      const newEmployee = allEmployees[newIndex];
      setEmployeeIndex(newIndex);
      setCurrentEmployee(newEmployee);
      if (onEmployeeChange) {
        onEmployeeChange(newEmployee);
      }
    }
  };

  const handleNextEmployee = () => {
    if (allEmployees.length > 0 && employeeIndex < allEmployees.length - 1) {
      const newIndex = employeeIndex + 1;
      const newEmployee = allEmployees[newIndex];
      setEmployeeIndex(newIndex);
      setCurrentEmployee(newEmployee);
      if (onEmployeeChange) {
        onEmployeeChange(newEmployee);
      }
    }
  };

  // Transform data to calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    if (filters.showShifts) {
      events.push(...transformShiftsToEvents(currentEmployee, shifts, startDate, endDate));
    }
    
    if (filters.showLeaves) {
      const leaveEvents = transformLeavesToEvents(currentEmployee, startDate, endDate);
      const filteredLeaveEvents = filters.leaveTypes.length > 0
        ? leaveEvents.filter(event => filters.leaveTypes.includes(event.resource.leaveType || ''))
        : leaveEvents;
      events.push(...filteredLeaveEvents);
    }
    
    if (filters.showComments) {
      events.push(...transformCommentsToEvents(currentEmployee, shifts, startDate, endDate));
    }
    
    return events;
  }, [currentEmployee, shifts, startDate, endDate, filters]);

  // New robust handlers with direct DOM manipulation
  useEffect(() => {
    const handleToggle = () => {
      setIsFullscreen(prev => !prev);
    };

    const handleClose = () => {
      setIsFullscreen(false);
      onClose();
    };

    const toggleBtn = toggleButtonRef.current;
    const closeBtn = closeButtonRef.current;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggle);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', handleClose);
    }

    return () => {
      if (toggleBtn) {
        toggleBtn.removeEventListener('click', handleToggle);
      }
      if (closeBtn) {
        closeBtn.removeEventListener('click', handleClose);
      }
    };
  }, [onClose]);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    // TODO: Implement event detail view
    console.log('Event clicked:', event);
  };

  // Handle navigation
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setCurrentDate(new Date(startDate));
    }
  }, [isOpen, startDate]);

  // Handle body scroll lock for fullscreen
  useEffect(() => {
    if (isFullscreen && isOpen) {
      document.body.style.overflow = 'hidden';
      console.log('🔒 Body scroll locked for fullscreen');
      
      return () => {
        document.body.style.overflow = '';
        console.log('🔓 Body scroll unlocked');
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullscreen, isOpen]);

  // Removed handleClose - will be reimplemented

  // Removed FullscreenContent - will use unified modal

  // Unified modal rendering
  if (!isOpen) return null;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(
          "transition-all duration-300 p-0 !gap-0 !bg-white",
          isFullscreen 
            ? "!fixed !inset-0 !max-w-none !w-screen !h-screen !max-h-none !rounded-none !transform-none !translate-x-0 !translate-y-0 !top-0 !left-0"
            : "max-w-[98vw] w-[1400px] h-[92vh] max-h-[900px]"
        )}>
        <div className={cn(
          "flex flex-col bg-white",
          isFullscreen ? "absolute top-0 left-0 right-0 bottom-0 w-screen h-screen" : "h-full"
        )}>
        <DialogHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 px-4 py-4 border-b bg-white",
          isFullscreen ? "mx-4 mt-4" : "rounded-t-lg"
        )}>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-xl font-semibold">
              {currentEmployee.name}'s Schedule Calendar
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              ref={toggleButtonRef}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              ref={closeButtonRef}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className={cn(
          "flex flex-1 overflow-hidden",
          isFullscreen ? "mx-4 mb-4" : "h-full"
        )}>
          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Calendar Header */}
            <CalendarHeader
              employee={currentEmployee}
              currentDate={currentDate}
              onNavigate={handleNavigate}
              totalEvents={calendarEvents.length}
              onPreviousEmployee={allEmployees.length > 1 ? handlePreviousEmployee : undefined}
              onNextEmployee={allEmployees.length > 1 ? handleNextEmployee : undefined}
              hasPreviousEmployee={employeeIndex > 0}
              hasNextEmployee={employeeIndex < allEmployees.length - 1}
              employeeIndex={employeeIndex}
              totalEmployees={allEmployees.length}
              events={calendarEvents}
              startDate={startDate}
              endDate={endDate}
              calendarRef={calendarRef}
            />

            {/* Calendar View */}
            <div className="flex-1 overflow-auto p-2" ref={calendarRef}>
              <CalendarView
                events={calendarEvents}
                employee={currentEmployee}
                onEventClick={handleEventClick}
                onNavigate={handleNavigate}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 border-l bg-gray-50 p-3 flex flex-col gap-3 overflow-y-auto">
            {/* Filters */}
            <CalendarFilters
              filters={filters}
              onFiltersChange={setFilters}
              employee={currentEmployee}
            />

            {/* Statistics */}
            <CalendarStats
              events={calendarEvents}
              employee={currentEmployee}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
    );
};