import React from 'react';
import { Filter, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { CalendarFilters as CalendarFiltersType } from '../EmployeeCalendar/types/calendar.types';
import { Employee } from '../../types/common';

interface CalendarFiltersProps {
  filters: CalendarFiltersType;
  onFiltersChange: (filters: CalendarFiltersType) => void;
  employee: Employee;
}

const LEAVE_TYPES = [
  'Paid Vacation',
  'Sick Leave',
  'Personal Leave',
  'FMLA',
  'Bereavement',
  'Jury Duty',
  'Military Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Unpaid Leave',
  'Administrative Leave',
  'Compensatory Time',
  'Holiday',
  'Training',
  'Conference',
  'Sabbatical',
  'Other'
];

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFiltersChange,
  employee
}) => {
  const handleToggleFilter = (key: keyof CalendarFiltersType) => {
    if (key === 'leaveTypes') return;
    onFiltersChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const handleLeaveTypeToggle = (leaveType: string) => {
    const currentTypes = filters.leaveTypes;
    const newTypes = currentTypes.includes(leaveType)
      ? currentTypes.filter(t => t !== leaveType)
      : [...currentTypes, leaveType];
    
    onFiltersChange({
      ...filters,
      leaveTypes: newTypes
    });
  };

  // Get unique leave types from employee data
  const employeeLeaveTypes = Array.from(new Set(
    employee.leave?.map(l => l.leaveType) || []
  ));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold">Filters</h3>
      </div>

      <div className="space-y-3">
        {/* Event Type Filters */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Event Types</h4>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-shifts"
              checked={filters.showShifts}
              onCheckedChange={() => handleToggleFilter('showShifts')}
            />
            <Label
              htmlFor="show-shifts"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {filters.showShifts ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Work Shifts
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-leaves"
              checked={filters.showLeaves}
              onCheckedChange={() => handleToggleFilter('showLeaves')}
            />
            <Label
              htmlFor="show-leaves"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {filters.showLeaves ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Leaves/Permissions
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-comments"
              checked={filters.showComments}
              onCheckedChange={() => handleToggleFilter('showComments')}
            />
            <Label
              htmlFor="show-comments"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {filters.showComments ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Comments
            </Label>
          </div>
        </div>

        {/* Leave Type Filters */}
        {filters.showLeaves && employeeLeaveTypes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Leave Types</h4>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {employeeLeaveTypes.map(leaveType => (
                <div key={leaveType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`leave-${leaveType}`}
                    checked={filters.leaveTypes.length === 0 || filters.leaveTypes.includes(leaveType)}
                    onCheckedChange={() => handleLeaveTypeToggle(leaveType)}
                  />
                  <Label
                    htmlFor={`leave-${leaveType}`}
                    className="text-sm cursor-pointer"
                  >
                    {leaveType}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>Work Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#19b08d] rounded" />
            <span>Leave/Permission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-dashed border-amber-500 rounded" />
            <span>Comment</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📌</span>
            <span>Fixed Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Locked Shift</span>
          </div>
        </div>
      </div>
    </div>
  );
};