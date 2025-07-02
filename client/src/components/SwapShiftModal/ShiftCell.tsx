import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Employee } from '../../types/common';

interface ShiftCellProps {
  id: string;
  employee: Employee;
  date: Date;
  dateString: string;
  shift: string | null;
  shiftDisplay: string;
  isHighlighted?: boolean;
  isPending?: boolean;
  isValid?: boolean;
  onLeave?: boolean;
  isDragOver?: boolean;
}

export default function ShiftCell({
  id,
  employee,
  date,
  dateString,
  shift,
  shiftDisplay,
  isHighlighted,
  isPending,
  isValid = true,
  onLeave,
  isDragOver
}: ShiftCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id,
    data: {
      employeeId: employee.id,
      employeeName: employee.name,
      date: dateString,
      shift: shift
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  // Determine cell classes based on state
  const cellClasses = [
    'border-r border-gray-300 px-2 py-4 text-center text-sm transition-all duration-200',
    isDragging && 'opacity-50 shadow-lg scale-105',
    isOver && !isDragging && 'bg-green-100 ring-2 ring-green-400',
    isPending && 'border-2 border-yellow-400 bg-yellow-50',
    !isValid && 'border-2 border-red-400 bg-red-50',
    isHighlighted && 'bg-blue-100',
    onLeave && 'bg-purple-50',
    !isDragging && !isOver && 'hover:bg-gray-100'
  ].filter(Boolean).join(' ');

  return (
    <td
      ref={setNodeRef}
      style={style}
      className={cellClasses}
      {...attributes}
      {...listeners}
    >
      <div className="font-medium select-none">
        {shiftDisplay}
      </div>
      {isPending && (
        <div className="text-xs text-yellow-600 mt-1">
          Pendiente
        </div>
      )}
    </td>
  );
}