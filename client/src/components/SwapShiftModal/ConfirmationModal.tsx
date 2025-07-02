import React from 'react';
import { X, AlertTriangle, Calendar, Clock, Users } from 'lucide-react';
import { SwapAction } from './index';
import { Employee, ShiftRow } from '../../types/common';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  swaps: SwapAction[];
  employee1: Employee;
  employee2: Employee | null;
  biweeklyHoursImpact?: {
    employee1: { before: number; after: number };
    employee2: { before: number; after: number };
  };
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  swaps,
  employee1,
  employee2,
  biweeklyHoursImpact
}: ConfirmationModalProps) {
  if (!isOpen || !employee2) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Intercambios de Turnos
          </h2>
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Warning Message */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Atención:</strong> Este intercambio se registrará con fecha y hora actual. 
              Asegúrese de que todos los cambios sean correctos antes de confirmar.
            </p>
          </div>

          {/* Hours Impact */}
          {biweeklyHoursImpact && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Impacto en Horas Biweekly
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">{employee1.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Horas actuales:</span>
                    <span className="font-medium">{biweeklyHoursImpact.employee1.before}h</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Horas después del cambio:</span>
                    <span className="font-medium text-blue-600">{biweeklyHoursImpact.employee1.after}h</span>
                  </div>
                  <div className="mt-2 text-sm">
                    Diferencia: {biweeklyHoursImpact.employee1.after - biweeklyHoursImpact.employee1.before > 0 ? '+' : ''}
                    {biweeklyHoursImpact.employee1.after - biweeklyHoursImpact.employee1.before}h
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">{employee2.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Horas actuales:</span>
                    <span className="font-medium">{biweeklyHoursImpact.employee2.before}h</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Horas después del cambio:</span>
                    <span className="font-medium text-blue-600">{biweeklyHoursImpact.employee2.after}h</span>
                  </div>
                  <div className="mt-2 text-sm">
                    Diferencia: {biweeklyHoursImpact.employee2.after - biweeklyHoursImpact.employee2.before > 0 ? '+' : ''}
                    {biweeklyHoursImpact.employee2.after - biweeklyHoursImpact.employee2.before}h
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Swap Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Detalle de Intercambios ({swaps.length})
            </h3>
            <div className="space-y-3">
              {swaps.map((swap, index) => (
                <div key={swap.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Intercambio #{index + 1}</span>
                    <span className="text-xs text-gray-500">
                      {swap.date1 === swap.date2 ? 'Mismo día' : 'Días diferentes'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Employee 1 Change */}
                    <div>
                      <div className="font-medium text-sm mb-1">{swap.employee1Name}</div>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(swap.date1)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-white rounded border border-gray-300">
                          {swap.shift1Display}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded border border-blue-300 font-medium">
                          {swap.shift2Display}
                        </span>
                      </div>
                    </div>
                    
                    {/* Employee 2 Change */}
                    <div>
                      <div className="font-medium text-sm mb-1">{swap.employee2Name}</div>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(swap.date2)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-white rounded border border-gray-300">
                          {swap.shift2Display}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded border border-blue-300 font-medium">
                          {swap.shift1Display}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Preview */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Comentarios que se agregarán:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {employee1.name}: "Cambio solicitado con {employee2.name}"</li>
              <li>• {employee2.name}: "Cambio aceptado con {employee1.name}"</li>
            </ul>
          </div>
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
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Confirmar Intercambios
          </button>
        </div>
      </div>
    </div>
  );
}