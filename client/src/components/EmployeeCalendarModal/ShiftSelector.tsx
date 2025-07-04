import React from 'react';
import { ShiftRow } from '../../types/common';
import { cn } from '../../lib/utils';

interface ShiftSelectorProps {
  value: string;
  onChange: (value: string) => void;
  shifts: ShiftRow[];
  employee: any;
  date: string;
  disabled?: boolean;
  className?: string;
  onAddLeaveSelect?: () => void;
}

export const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  value,
  onChange,
  shifts,
  employee,
  date,
  disabled = false,
  className,
  onAddLeaveSelect
}) => {
  // Convert time to 12-hour format
  const convertTo12Hour = (time: string): string => {
    if (!time || time.includes('AM') || time.includes('PM')) return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get shift color
  const getShiftColor = (shiftId: string): string => {
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.color || '#9CA3AF';
  };

  // Check if shift is blocked for employee
  const isShiftBlocked = (shiftId: string): boolean => {
    if (!employee.blockedShifts || !employee.blockedShifts[shiftId]) return false;
    
    const blockedData = employee.blockedShifts[shiftId];
    if (!blockedData.isActive) return false;
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return blockedData.blockedDays.includes('all') || blockedData.blockedDays.includes(dayOfWeek);
  };

  // Check if shift is unavailable
  const isShiftUnavailable = (shiftId: string): boolean => {
    return employee.unavailableShifts?.[shiftId] || false;
  };

  // Get background style for selected shift
  const getBackgroundStyle = () => {
    if (!value || value === 'day-off') return {};
    return {
      backgroundColor: getShiftColor(value),
      color: 'white'
    };
  };

  return (
    <select
      className={cn(
        "w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      style={getBackgroundStyle()}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        if (newValue === 'add-leave' && onAddLeaveSelect) {
          onAddLeaveSelect();
          // Reset the value to avoid keeping "add-leave" selected
          onChange('');
        } else {
          onChange(newValue);
        }
      }}
      disabled={disabled}
    >
      <option value="">Select Shift</option>
      <option value="day-off">Day Off</option>
      
      {shifts.map((shift) => {
        const isBlocked = isShiftBlocked(shift.id);
        const isUnavailable = isShiftUnavailable(shift.id);
        const isDisabled = isBlocked || isUnavailable;
        
        return (
          <option 
            key={shift.id} 
            value={shift.id}
            disabled={isDisabled}
          >
            {shift.name || `${convertTo12Hour(shift.startTime)} - ${convertTo12Hour(shift.endTime)}`}
            {isBlocked && ' (Blocked)'}
            {isUnavailable && ' (Unavailable)'}
          </option>
        );
      })}
      
      <option value="add-leave">Add Leave</option>
    </select>
  );
};