import React, { useMemo } from 'react';
import { BarChart3, Clock, Calendar, Briefcase } from 'lucide-react';
import { CalendarEvent } from '../EmployeeCalendar/types/calendar.types';
import { Employee } from '../../types/common';
import { differenceInDays, isWeekend, parseISO } from 'date-fns';

interface CalendarStatsProps {
  events: CalendarEvent[];
  employee: Employee;
  startDate: string;
  endDate: string;
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({
  events,
  employee,
  startDate,
  endDate
}) => {
  const stats = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalDays = differenceInDays(end, start) + 1;

    // Calculate work shifts
    const shiftEvents = events.filter(e => e.resource.type === 'shift');
    const workDays = new Set(shiftEvents.map(e => e.start.toDateString())).size;
    
    // Calculate total hours
    const totalHours = shiftEvents.reduce((sum, event) => {
      const hours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    // Calculate days off
    const daysOff = totalDays - workDays;

    // Calculate weekends off
    const weekendsOff = shiftEvents.filter(event => 
      isWeekend(event.start)
    ).length;

    // Calculate leaves by type
    const leaveEvents = events.filter(e => e.resource.type === 'leave');
    const leavesByType = leaveEvents.reduce((acc, event) => {
      const type = event.resource.leaveType || 'Other';
      if (!acc[type]) {
        acc[type] = { days: 0, hours: 0 };
      }
      acc[type].days += 1;
      acc[type].hours += event.resource.hoursPerDay || 8;
      return acc;
    }, {} as Record<string, { days: number; hours: number }>);

    return {
      totalHours,
      workDays,
      daysOff,
      weekendsOff,
      totalDays,
      leavesByType,
      averageHoursPerDay: workDays > 0 ? totalHours / workDays : 0
    };
  }, [events, startDate, endDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-4 w-4 text-gray-600" />
        <h3 className="font-semibold">Statistics</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Total Hours</span>
          </div>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {stats.totalHours.toFixed(1)}h
          </p>
          <p className="text-xs text-blue-600">
            ~{stats.averageHoursPerDay.toFixed(1)}h/day
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">Work Days</span>
          </div>
          <p className="text-xl font-bold text-green-900 mt-1">
            {stats.workDays}
          </p>
          <p className="text-xs text-green-600">
            of {stats.totalDays} days
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-700">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Days Off</span>
          </div>
          <p className="text-xl font-bold text-purple-900 mt-1">
            {stats.daysOff}
          </p>
          <p className="text-xs text-purple-600">
            {((stats.daysOff / stats.totalDays) * 100).toFixed(0)}% of period
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-700">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Weekend Shifts</span>
          </div>
          <p className="text-xl font-bold text-orange-900 mt-1">
            {stats.weekendsOff}
          </p>
          <p className="text-xs text-orange-600">
            Saturdays & Sundays
          </p>
        </div>
      </div>

      {/* Leave Breakdown */}
      {Object.keys(stats.leavesByType).length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Leave Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(stats.leavesByType).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{type}</span>
                <div className="flex gap-3">
                  <span className="font-medium">{data.days} days</span>
                  <span className="text-gray-500">({data.hours}h)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Info */}
      <div className="pt-4 border-t text-xs text-gray-500">
        <p>Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
        <p>Total days in period: {stats.totalDays}</p>
      </div>
    </div>
  );
};