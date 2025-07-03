import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { CalendarViewProps, CalendarEvent } from '../EmployeeCalendar/types/calendar.types';
import { EventTooltip } from './EventTooltip';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '../../lib/utils';

const localizer = momentLocalizer(moment);

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  employee,
  onEventClick,
  onNavigate
}) => {
  const [view, setView] = React.useState<View>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const baseStyle: React.CSSProperties = {
      borderRadius: '4px',
      opacity: 0.9,
      border: '1px solid rgba(0,0,0,0.1)',
      fontSize: '0.875rem',
      padding: '2px 4px',
      cursor: 'pointer'
    };

    // Apply color based on event type
    if (event.resource.type === 'shift') {
      baseStyle.backgroundColor = event.resource.color || '#3B82F6';
      baseStyle.color = 'white';
      
      // Add visual indicators
      if (event.resource.isFixed) {
        baseStyle.borderLeft = '4px solid #FFD700';
      }
      if (event.resource.isLocked) {
        baseStyle.borderStyle = 'dashed';
      }
    } else if (event.resource.type === 'leave') {
      baseStyle.backgroundColor = '#19b08d';
      baseStyle.color = 'black';
      baseStyle.borderRadius = '8px';
    } else if (event.resource.type === 'comment') {
      baseStyle.backgroundColor = '#FEF3C7';
      baseStyle.color = '#92400E';
      baseStyle.border = '1px dashed #F59E0B';
    }

    return { style: baseStyle };
  };

  // Handle event click
  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Custom components
  const components = useMemo(() => ({
    event: ({ event }: { event: CalendarEvent }) => {
      const isShift = event.resource.type === 'shift';
      const isLeave = event.resource.type === 'leave';
      const isComment = event.resource.type === 'comment';

      return (
        <EventTooltip event={event}>
          <div className="flex items-center gap-1 h-full w-full">
            {isShift && event.resource.isFixed && <span>📌</span>}
            {isShift && event.resource.isLocked && <span>🔒</span>}
            {isComment && <span>📝</span>}
            <span className="truncate flex-1">{event.title}</span>
            {isLeave && (
              <span className="text-xs">
                ({event.resource.hoursPerDay}h)
              </span>
            )}
          </div>
        </EventTooltip>
      );
    },
    toolbar: ({ label, onNavigate: toolbarNavigate, onView }: any) => (
      <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => toolbarNavigate('PREV')}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
          >
            ← Previous
          </button>
          <button
            onClick={() => toolbarNavigate('TODAY')}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={() => toolbarNavigate('NEXT')}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
        
        <h2 className="text-lg font-semibold">{label}</h2>
        
        <div className="flex gap-1">
          <button
            onClick={() => { setView(Views.MONTH); onView(Views.MONTH); }}
            className={cn(
              "px-3 py-1 border rounded",
              view === Views.MONTH ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            Month
          </button>
          <button
            onClick={() => { setView(Views.WEEK); onView(Views.WEEK); }}
            className={cn(
              "px-3 py-1 border rounded",
              view === Views.WEEK ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            Week
          </button>
          <button
            onClick={() => { setView(Views.DAY); onView(Views.DAY); }}
            className={cn(
              "px-3 py-1 border rounded",
              view === Views.DAY ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            Day
          </button>
          <button
            onClick={() => { setView(Views.AGENDA); onView(Views.AGENDA); }}
            className={cn(
              "px-3 py-1 border rounded",
              view === Views.AGENDA ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
            )}
          >
            Agenda
          </button>
        </div>
      </div>
    )
  }), [view]);

  // Format slots
  const formats = useMemo(() => ({
    timeGutterFormat: 'h:mm A',
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
    },
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
    }
  }), []);

  return (
    <>
      <div className="h-full bg-white rounded-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '500px' }}
          onSelectEvent={handleEventSelect}
          onNavigate={onNavigate}
          eventPropGetter={eventStyleGetter}
          components={components}
          formats={formats}
          view={view}
          onView={setView}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={60}
          showMultiDayTimes
          defaultDate={new Date()}
        />
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => {
          setShowEventDetail(false);
          setSelectedEvent(null);
        }}
      />
    </>
  );
};