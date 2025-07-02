import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Users, AlertCircle, CheckCircle, RotateCcw, RefreshCw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { Employee, ShiftRow } from '../../types/common';
import ShiftCell from './ShiftCell';
import ConfirmationModal from './ConfirmationModal';

interface SwapShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee1: Employee;
  clickedDate: string;
  currentShift: string | null;
  employees: Employee[];
  shifts: ShiftRow[];
  rules: { startDate: string; endDate: string };
  onConfirmSwap: (swaps: SwapAction[]) => void;
}

export interface SwapAction {
  id: string;
  employee1Id: string;
  employee2Id: string;
  employee1Name: string;
  employee2Name: string;
  date1: string;
  date2: string;
  shift1: string | null;
  shift2: string | null;
  shift1Display: string;
  shift2Display: string;
  timestamp: Date;
}

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

interface DragData {
  employeeId: string;
  employeeName: string;
  date: string;
  shift: string | null;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SwapShiftModal({
  isOpen,
  onClose,
  employee1,
  clickedDate,
  currentShift,
  employees,
  shifts,
  rules,
  onConfirmSwap
}: SwapShiftModalProps) {
  const [selectedEmployee2, setSelectedEmployee2] = useState<Employee | null>(null);
  const [pendingSwaps, setPendingSwaps] = useState<SwapAction[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  // Temporary shift assignments for preview
  const [tempShifts, setTempShifts] = useState<{
    [key: string]: string | null;
  }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate biweekly period based on clicked date
  const biweeklyDates = useMemo(() => {
    if (!clickedDate || !rules.startDate) return [];

    const clickedDateObj = new Date(clickedDate + 'T00:00:00Z');
    const startDateObj = new Date(rules.startDate + 'T00:00:00Z');
    
    // Calculate days since start
    const daysSinceStart = Math.floor((clickedDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate which biweekly period this date belongs to
    const biweeklyPeriod = Math.floor(daysSinceStart / 14);
    const biweeklyStartDay = biweeklyPeriod * 14;
    
    // Create array of 14 dates for this biweekly period
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDateObj);
      date.setUTCDate(date.getUTCDate() + biweeklyStartDay + i);
      dates.push(date);
    }
    
    return dates;
  }, [clickedDate, rules.startDate]);

  // Helper function to get shift display name
  const getShiftDisplay = (shiftId: string | null): string => {
    if (!shiftId || shiftId === 'day-off') return 'Libre';
    
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return shiftId;
    
    // Return shift name if available, otherwise return time range
    if (shift.name) return shift.name;
    return `${shift.startTime} - ${shift.endTime}`;
  };

  // Helper function to get shift for a specific date (considering temp assignments)
  const getShiftForDate = (employee: Employee, dateString: string): string | null => {
    if (!employee) return null;

    // Check temp shifts first
    const tempKey = `${employee.id}-${dateString}`;
    if (tempKey in tempShifts) {
      return tempShifts[tempKey];
    }

    // Check if on leave
    const leave = employee.leave?.find(l => {
      const leaveStart = new Date(l.startDate + 'T00:00:00Z');
      const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
      const current = new Date(dateString + 'T00:00:00Z');
      return current >= leaveStart && current <= leaveEnd;
    });

    if (leave) {
      return `${leave.leaveType} (${leave.hoursPerDay}h)`;
    }

    // Check manual shifts first
    const manualShift = employee.manualShifts?.[dateString];
    if (manualShift !== undefined) {
      return manualShift;
    }

    // Check fixed shifts
    const date = new Date(dateString + 'T00:00:00Z');
    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const fixedShift = employee.fixedShifts?.[dayOfWeek]?.[0];
    
    return fixedShift || null;
  };

  // Validate blocked shifts
  const validateBlockedShifts = (employee: Employee, shiftId: string, date: Date): boolean => {
    if (!shiftId || shiftId === 'day-off') return true;
    
    const dayOfWeek = daysOfWeek[date.getUTCDay()].toLowerCase();
    const blockedShift = employee.blockedShifts?.[shiftId];
    
    if (!blockedShift?.isActive) return true;
    
    return !blockedShift.blockedDays.includes('all') && 
           !blockedShift.blockedDays.includes(dayOfWeek);
  };

  // Check if employee is on leave
  const isOnLeave = (employee: Employee, dateString: string): boolean => {
    return employee.leave?.some(l => {
      const leaveStart = new Date(l.startDate + 'T00:00:00Z');
      const leaveEnd = new Date(l.endDate + 'T00:00:00Z');
      const current = new Date(dateString + 'T00:00:00Z');
      return current >= leaveStart && current <= leaveEnd;
    }) || false;
  };

  // Generate unique ID for each cell
  const getCellId = (employeeId: string, dateString: string) => `${employeeId}-${dateString}`;

  // Check if a swap is pending for a specific cell
  const hasPendingSwap = (employeeId: string, dateString: string): boolean => {
    return pendingSwaps.some(swap => 
      (swap.employee1Id === employeeId && swap.date1 === dateString) ||
      (swap.employee2Id === employeeId && swap.date2 === dateString)
    );
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current as DragData;

    // Don't allow swapping with leave days
    if (activeData.shift?.includes('h)') || overData.shift?.includes('h)')) {
      setValidationErrors([{
        type: 'error',
        message: 'No se pueden intercambiar días de permiso'
      }]);
      return;
    }

    // Validate blocked shifts
    const activeEmployee = employees.find(e => e.id === activeData.employeeId);
    const overEmployee = employees.find(e => e.id === overData.employeeId);
    
    if (activeEmployee && overEmployee) {
      const activeDate = new Date(activeData.date + 'T00:00:00Z');
      const overDate = new Date(overData.date + 'T00:00:00Z');
      
      // Check if employees can work the swapped shifts
      const canActiveWorkOver = validateBlockedShifts(activeEmployee, overData.shift || '', overDate);
      const canOverWorkActive = validateBlockedShifts(overEmployee, activeData.shift || '', activeDate);
      
      if (!canActiveWorkOver || !canOverWorkActive) {
        setValidationErrors([{
          type: 'error',
          message: 'Uno o ambos empleados tienen bloqueado este turno para este día'
        }]);
        return;
      }
    }

    // Create new swap action
    const newSwap: SwapAction = {
      id: `swap-${Date.now()}-${Math.random()}`,
      employee1Id: activeData.employeeId,
      employee2Id: overData.employeeId,
      employee1Name: activeData.employeeName,
      employee2Name: overData.employeeName,
      date1: activeData.date,
      date2: overData.date,
      shift1: activeData.shift,
      shift2: overData.shift,
      shift1Display: getShiftDisplay(activeData.shift),
      shift2Display: getShiftDisplay(overData.shift),
      timestamp: new Date()
    };

    // Update temporary shifts
    setTempShifts(prev => ({
      ...prev,
      [`${activeData.employeeId}-${activeData.date}`]: overData.shift,
      [`${overData.employeeId}-${overData.date}`]: activeData.shift
    }));

    // Add to pending swaps
    setPendingSwaps(prev => [...prev, newSwap]);
    setValidationErrors([]);
  };

  // Undo last swap
  const undoLastSwap = () => {
    if (pendingSwaps.length === 0) return;
    
    const lastSwap = pendingSwaps[pendingSwaps.length - 1];
    
    // Remove from temp shifts
    setTempShifts(prev => {
      const newTemp = { ...prev };
      delete newTemp[`${lastSwap.employee1Id}-${lastSwap.date1}`];
      delete newTemp[`${lastSwap.employee2Id}-${lastSwap.date2}`];
      return newTemp;
    });
    
    // Remove from pending swaps
    setPendingSwaps(prev => prev.slice(0, -1));
  };

  // Reset all swaps
  const resetAllSwaps = () => {
    setPendingSwaps([]);
    setTempShifts({});
    setValidationErrors([]);
  };

  // Calculate hours impact
  const calculateHoursImpact = useMemo(() => {
    if (!selectedEmployee2 || pendingSwaps.length === 0) return null;

    // TODO: Implement biweekly hours calculation
    return {
      employee1: { before: 80, after: 80 },
      employee2: { before: 80, after: 80 }
    };
  }, [selectedEmployee2, pendingSwaps]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployee2(null);
      setPendingSwaps([]);
      setTempShifts({});
      setValidationErrors([]);
      setShowConfirmation(false);
    }
  }, [isOpen]);

  if (!isOpen || !employee1) return null;

  const activeDragData = activeId ? {
    employeeId: activeId.split('-')[0],
    date: activeId.split('-').slice(1).join('-')
  } : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Intercambiar Turno
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {/* Employee Info */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-semibold">Empleado:</span> {employee1.name}
              </div>
              <div>
                <span className="font-semibold">Fecha seleccionada:</span> {new Date(clickedDate + 'T00:00:00Z').toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  timeZone: 'UTC'
                })}
              </div>
              <div>
                <span className="font-semibold">Turno actual:</span> {getShiftDisplay(currentShift)}
              </div>
            </div>
          </div>

          {/* Employee 2 Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar segundo empleado para intercambiar:
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEmployee2?.id || ''}
              onChange={(e) => {
                const emp = employees.find(emp => emp.id === e.target.value);
                setSelectedEmployee2(emp || null);
                resetAllSwaps(); // Reset when changing employee
              }}
            >
              <option value="">-- Seleccionar empleado --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar View with Drag and Drop */}
          {selectedEmployee2 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Vista de Calendario - Período Biweekly
                </h3>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-r border-gray-300 px-4 py-2 text-left w-40">Empleado</th>
                        {biweeklyDates.map((date, index) => (
                          <th key={index} className="border-r border-gray-300 px-2 py-2 text-center text-sm">
                            <div>{daysOfWeekShort[date.getUTCDay()]}</div>
                            <div className="font-normal">{date.getUTCDate()}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Employee 1 Row */}
                      <tr>
                        <td className="border-r border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          {employee1.name}
                        </td>
                        <SortableContext 
                          items={biweeklyDates.map(date => getCellId(employee1.id, date.toISOString().split('T')[0]))}
                          strategy={horizontalListSortingStrategy}
                        >
                          {biweeklyDates.map((date) => {
                            const dateString = date.toISOString().split('T')[0];
                            const cellId = getCellId(employee1.id, dateString);
                            const shift = getShiftForDate(employee1, dateString);
                            const onLeave = isOnLeave(employee1, dateString);
                            
                            return (
                              <ShiftCell
                                key={cellId}
                                id={cellId}
                                employee={employee1}
                                date={date}
                                dateString={dateString}
                                shift={shift}
                                shiftDisplay={getShiftDisplay(shift)}
                                isHighlighted={dateString === clickedDate}
                                isPending={hasPendingSwap(employee1.id, dateString)}
                                onLeave={onLeave}
                                isDragOver={overId === cellId}
                              />
                            );
                          })}
                        </SortableContext>
                      </tr>
                      
                      {/* Employee 2 Row */}
                      <tr>
                        <td className="border-r border-gray-300 px-4 py-2 font-medium bg-gray-50">
                          {selectedEmployee2.name}
                        </td>
                        <SortableContext 
                          items={biweeklyDates.map(date => getCellId(selectedEmployee2.id, date.toISOString().split('T')[0]))}
                          strategy={horizontalListSortingStrategy}
                        >
                          {biweeklyDates.map((date) => {
                            const dateString = date.toISOString().split('T')[0];
                            const cellId = getCellId(selectedEmployee2.id, dateString);
                            const shift = getShiftForDate(selectedEmployee2, dateString);
                            const onLeave = isOnLeave(selectedEmployee2, dateString);
                            
                            return (
                              <ShiftCell
                                key={cellId}
                                id={cellId}
                                employee={selectedEmployee2}
                                date={date}
                                dateString={dateString}
                                shift={shift}
                                shiftDisplay={getShiftDisplay(shift)}
                                isPending={hasPendingSwap(selectedEmployee2.id, dateString)}
                                onLeave={onLeave}
                                isDragOver={overId === cellId}
                              />
                            );
                          })}
                        </SortableContext>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                  {activeId && activeDragData ? (
                    <div className="bg-white border-2 border-blue-500 rounded-lg px-4 py-2 shadow-lg">
                      <div className="font-medium">
                        {getShiftDisplay(
                          getShiftForDate(
                            employees.find(e => e.id === activeDragData.employeeId)!,
                            activeDragData.date
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>

                {/* Instructions */}
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Instrucciones:</strong> Arrastra y suelta los turnos entre empleados para intercambiarlos. 
                    Los turnos con borde amarillo indican cambios pendientes. Puedes hacer múltiples intercambios antes de confirmar.
                  </p>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-4">
                    {validationErrors.map((error, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg mb-2 flex items-start gap-2 ${
                          error.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Swaps Counter */}
                {pendingSwaps.length > 0 && (
                  <div className="mt-4 bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {pendingSwaps.length} intercambio(s) pendiente(s)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={undoLastSwap}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Deshacer
                        </button>
                        <button
                          onClick={resetAllSwaps}
                          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Restablecer
                        </button>
                      </div>
                    </div>

                    {/* Swap Summary */}
                    <div className="mt-3 space-y-2">
                      {pendingSwaps.map((swap, index) => (
                        <div key={swap.id} className="text-sm text-gray-600 bg-white p-2 rounded border border-green-200">
                          <span className="font-medium">{swap.employee1Name}</span> ({swap.date1}): 
                          <span className="mx-2">{swap.shift1Display} → {swap.shift2Display}</span>
                          ↔️
                          <span className="font-medium ml-2">{swap.employee2Name}</span> ({swap.date2}): 
                          <span className="mx-2">{swap.shift2Display} → {swap.shift1Display}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (pendingSwaps.length > 0) {
                setShowConfirmation(true);
              }
            }}
            disabled={pendingSwaps.length === 0}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              pendingSwaps.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Confirmar Intercambio{pendingSwaps.length > 0 && ` (${pendingSwaps.length})`}
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          onConfirmSwap(pendingSwaps);
          setShowConfirmation(false);
          onClose();
        }}
        swaps={pendingSwaps}
        employee1={employee1}
        employee2={selectedEmployee2}
        biweeklyHoursImpact={calculateHoursImpact}
      />
    </div>
  );
}