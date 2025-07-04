import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CalendarView } from './CalendarView';
import { CalendarHeader } from './CalendarHeader';
import { CalendarFilters } from './CalendarFilters';
import { CalendarStats } from './CalendarStats';
import { transformShiftsToEvents, transformLeavesToEvents, transformCommentsToEvents } from '../EmployeeCalendar/utils/eventTransformers';
import { EmployeeCalendarProps, CalendarEvent, CalendarFilters as CalendarFiltersType } from '../EmployeeCalendar/types/calendar.types';
import { cn } from '../../lib/utils';
import { useShiftContext } from '../../context/ShiftContext';
import { useEmployeeLists } from '../../context/EmployeeListsContext';
import LeaveModal from '../LeaveModal';

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
  const { shifts: availableShifts } = useShiftContext();
  const { getCurrentList, updateList } = useEmployeeLists();
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
  const [leaveModalState, setLeaveModalState] = useState<{
    isOpen: boolean;
    date: string;
  }>({
    isOpen: false,
    date: ''
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

  // Handle shift change from calendar
  const handleShiftChange = useCallback((employeeId: string, date: string, shiftId: string) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    // Find the employee in the list
    const employeeIndex = currentList.employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex === -1) return;

    const updatedEmployees = [...currentList.employees];
    const employee = { ...updatedEmployees[employeeIndex] };

    // Initialize manualShifts if not exists
    if (!employee.manualShifts) {
      employee.manualShifts = {};
    }

    // Update the manual shift for the specific date
    if (shiftId === 'day-off' || shiftId === '') {
      // Remove manual shift for this date
      delete employee.manualShifts[date];
    } else {
      // Set the manual shift
      employee.manualShifts[date] = shiftId;
    }

    // Update the employee in the list
    updatedEmployees[employeeIndex] = employee;
    updateList(currentList.id, { employees: updatedEmployees });

    // Refresh the calendar events by updating the current employee
    if (employee.id === currentEmployee.id) {
      setCurrentEmployee(employee);
    }
  }, [getCurrentList, updateList, currentEmployee]);

  // Handle add leave
  const handleAddLeave = useCallback((date?: string) => {
    setLeaveModalState({
      isOpen: true,
      date: date || format(new Date(), 'yyyy-MM-dd')
    });
  }, []);

  // Handle save leave
  const handleSaveLeave = useCallback((leaveData: {
    startDate: string;
    endDate: string;
    type: string;
    hoursPerDay: number;
  }) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    // Find the current employee in the list
    const employeeIndex = currentList.employees.findIndex(emp => emp.id === currentEmployee.id);
    if (employeeIndex === -1) return;

    const updatedEmployees = [...currentList.employees];
    const employee = { ...updatedEmployees[employeeIndex] };

    // Create new leave entry
    const newLeave = {
      id: crypto.randomUUID(),
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      leaveType: leaveData.type,
      hoursPerDay: leaveData.hoursPerDay
    };

    if (!employee.leave) {
      employee.leave = [];
    }
    employee.leave.push(newLeave);

    // Update the employee in the list
    updatedEmployees[employeeIndex] = employee;
    updateList(currentList.id, { employees: updatedEmployees });

    // Update current employee to refresh calendar
    setCurrentEmployee(employee);

    // Close leave modal
    setLeaveModalState({ isOpen: false, date: '' });
  }, [getCurrentList, updateList, currentEmployee]);

  // Handle edit leave
  const handleEditLeave = useCallback((leave: any) => {
    // Implementation similar to handleSaveLeave but updates existing leave
    console.log('Edit leave:', leave);
  }, []);

  // Handle delete leave
  const handleDeleteLeave = useCallback((leaveId: string) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    const employeeIndex = currentList.employees.findIndex(emp => emp.id === currentEmployee.id);
    if (employeeIndex === -1) return;

    const updatedEmployees = [...currentList.employees];
    const employee = { ...updatedEmployees[employeeIndex] };

    if (employee.leave) {
      employee.leave = employee.leave.filter(l => l.id !== leaveId);
      updatedEmployees[employeeIndex] = employee;
      updateList(currentList.id, { employees: updatedEmployees });
      setCurrentEmployee(employee);
    }
  }, [getCurrentList, updateList, currentEmployee]);

  // Handle archive leave
  const handleArchiveLeave = useCallback((leaveId: string) => {
    // Similar to delete but archives instead
    console.log('Archive leave:', leaveId);
  }, []);

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(
          "transition-all duration-300 p-0 !gap-0 !bg-white !flex !flex-col",
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
                shifts={availableShifts}
                onShiftChange={handleShiftChange}
                onAddLeave={handleAddLeave}
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

    {/* Leave Modal - Rendered outside of Dialog to ensure proper z-index */}
    {leaveModalState.isOpen && (
      <LeaveModal
        isOpen={leaveModalState.isOpen}
        onClose={() => setLeaveModalState({ isOpen: false, date: '' })}
        employeeName={currentEmployee.name}
        existingLeaves={currentEmployee.leave || []}
        onSave={handleSaveLeave}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        onArchive={handleArchiveLeave}
        initialDate={leaveModalState.date}
      />
    )}
    </>
  );
};