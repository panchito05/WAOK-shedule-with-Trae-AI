import React from 'react';
import { CalendarEvent } from '../EmployeeCalendar/types/calendar.types';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Clock, Calendar, User, MessageSquare, Briefcase, X } from 'lucide-react';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!event) return null;

  const getEventIcon = () => {
    switch (event.resource.type) {
      case 'shift':
        return <Briefcase className="h-5 w-5" />;
      case 'leave':
        return <Calendar className="h-5 w-5" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getEventTypeLabel = () => {
    switch (event.resource.type) {
      case 'shift':
        return 'Work Shift';
      case 'leave':
        return 'Leave/Permission';
      case 'comment':
        return 'Shift Comment';
      default:
        return 'Event';
    }
  };

  const duration = differenceInHours(event.end, event.start);
  const minutes = differenceInMinutes(event.end, event.start) % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md !bg-white !gap-0">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getEventIcon()}
              <DialogTitle>{getEventTypeLabel()}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Event details for {event.resource.employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Event Title */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Title</h4>
            <p className="text-base font-medium">{event.title}</p>
          </div>

          {/* Date & Time */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
            <p className="text-base">
              {format(event.start, 'EEEE, MMMM d, yyyy')}
            </p>
            {event.resource.type === 'shift' && (
              <p className="text-sm text-gray-600">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                {' '}({duration}h {minutes > 0 ? `${minutes}m` : ''})
              </p>
            )}
          </div>

          {/* Type-specific details */}
          {event.resource.type === 'shift' && (
            <>
              {event.resource.color && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Shift Color</h4>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: event.resource.color }}
                    />
                    <span className="text-sm">{event.resource.color}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Shift Properties</h4>
                <div className="space-y-1">
                  {event.resource.isFixed && (
                    <p className="text-sm flex items-center gap-1">
                      <span>📌</span> Fixed Shift (Permanent)
                    </p>
                  )}
                  {event.resource.isManual && (
                    <p className="text-sm">✋ Manually Assigned</p>
                  )}
                  {event.resource.isLocked && (
                    <p className="text-sm flex items-center gap-1">
                      <span>🔒</span> Locked (Employee Request)
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {event.resource.type === 'leave' && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Leave Type</h4>
                <p className="text-base font-medium">{event.resource.leaveType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Hours Per Day</h4>
                <p className="text-base">{event.resource.hoursPerDay || 8} hours</p>
              </div>
            </>
          )}

          {event.resource.type === 'comment' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Comment</h4>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm whitespace-pre-wrap">{event.resource.comment}</p>
              </div>
            </div>
          )}

          {/* Employee Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Employee</h4>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <p className="text-base">{event.resource.employeeName}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  onDelete(event);
                  onClose();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};