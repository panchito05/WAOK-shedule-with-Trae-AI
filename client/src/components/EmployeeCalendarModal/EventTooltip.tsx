import React from 'react';
import { CalendarEvent } from '../EmployeeCalendar/types/calendar.types';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Clock, Calendar, User, MessageSquare, Briefcase } from 'lucide-react';

interface EventTooltipProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export const EventTooltip: React.FC<EventTooltipProps> = ({ event, children }) => {
  const getEventDetails = () => {
    const { resource } = event;
    const duration = differenceInHours(event.end, event.start);
    const minutes = differenceInMinutes(event.end, event.start) % 60;

    switch (resource.type) {
      case 'shift':
        return {
          icon: <Briefcase className="h-4 w-4" />,
          title: 'Work Shift',
          details: [
            { label: 'Shift', value: event.title },
            { label: 'Time', value: `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}` },
            { label: 'Duration', value: `${duration}h ${minutes > 0 ? `${minutes}m` : ''}` },
            { label: 'Type', value: resource.isFixed ? 'Fixed Shift 📌' : resource.isManual ? 'Manual Shift' : 'Regular Shift' },
            { label: 'Status', value: resource.isLocked ? 'Locked 🔒' : 'Unlocked' },
          ]
        };

      case 'leave':
        return {
          icon: <Calendar className="h-4 w-4" />,
          title: 'Leave/Permission',
          details: [
            { label: 'Type', value: resource.leaveType || 'Unknown' },
            { label: 'Date', value: format(event.start, 'EEEE, MMM d, yyyy') },
            { label: 'Hours', value: `${resource.hoursPerDay || 8} hours/day` },
            { label: 'Employee', value: resource.employeeName },
          ]
        };

      case 'comment':
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          title: 'Shift Comment',
          details: [
            { label: 'Date', value: format(event.start, 'EEEE, MMM d, yyyy') },
            { label: 'Comment', value: resource.comment || 'No comment', fullWidth: true },
            { label: 'Employee', value: resource.employeeName },
          ]
        };

      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          title: 'Event',
          details: [
            { label: 'Title', value: event.title },
            { label: 'Time', value: format(event.start, 'h:mm a') },
          ]
        };
    }
  };

  const eventInfo = getEventDetails();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm p-0 overflow-hidden"
          side="top"
          align="center"
        >
          <div className="bg-white rounded-lg shadow-lg border">
            {/* Header */}
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${
              event.resource.type === 'shift' ? 'bg-blue-50' :
              event.resource.type === 'leave' ? 'bg-green-50' :
              'bg-yellow-50'
            }`}>
              {eventInfo.icon}
              <span className="font-semibold text-sm">{eventInfo.title}</span>
            </div>

            {/* Content */}
            <div className="px-3 py-2 space-y-1">
              {eventInfo.details.map((detail, index) => (
                <div 
                  key={index} 
                  className={`flex ${detail.fullWidth ? 'flex-col' : 'items-center justify-between'} text-sm`}
                >
                  <span className="text-gray-600">{detail.label}:</span>
                  <span className={`font-medium ${detail.fullWidth ? 'mt-1' : 'ml-2'}`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Color indicator */}
            {event.resource.type === 'shift' && event.resource.color && (
              <div className="px-3 pb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Color:</span>
                  <div 
                    className="w-16 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: event.resource.color }}
                  />
                </div>
              </div>
            )}

            {/* Footer hint */}
            <div className="bg-gray-50 px-3 py-1 text-xs text-gray-500 text-center border-t">
              Click event for more details
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};