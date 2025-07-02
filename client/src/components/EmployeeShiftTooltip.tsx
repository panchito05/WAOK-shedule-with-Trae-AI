import * as React from 'react';
import { Employee } from '../types/common';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

interface Shift {
  id: string;
  name?: string;
  startTime: string;
  endTime: string;
}

interface EmployeeShiftTooltipProps {
  employee: Employee;
  shifts: Shift[];
  biweeklyHours: { period: string; hours: number; color?: string }[];
  weekendsOff: number;
  minHoursPerTwoWeeks: number;
  minWeekendsOffPerMonth: number;
  children: React.ReactNode;
}

export const EmployeeShiftTooltip: React.FC<EmployeeShiftTooltipProps> = ({
  employee,
  shifts,
  biweeklyHours,
  weekendsOff,
  minHoursPerTwoWeeks,
  minWeekendsOffPerMonth,
  children,
}) => {
  // Encontrar la primera preferencia del empleado
  const firstPreferenceIndex = employee.shiftPreferences?.findIndex(pref => pref === 1);
  const firstPreferenceShift = firstPreferenceIndex !== -1 && shifts[firstPreferenceIndex]
    ? shifts[firstPreferenceIndex]
    : null;

  // Determinar si cumple con los fines de semana libres mínimos
  const meetsWeekendRequirement = weekendsOff >= minWeekendsOffPerMonth;

  return (
    <Tooltip delayDuration={700}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm p-3 space-y-2 z-[9999] bg-white border border-gray-200 shadow-lg" 
          side="top" 
          align="center"
          sideOffset={5}
        >
          {/* Nombre del empleado */}
          <div className="font-semibold text-sm">
            {employee.name}
          </div>

          {/* Primera preferencia */}
          {firstPreferenceShift && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Pref #1:</span>{' '}
              {firstPreferenceShift.name} ({firstPreferenceShift.startTime} - {firstPreferenceShift.endTime})
            </div>
          )}

          {/* Desglose de horas quincenales */}
          {biweeklyHours.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Biweekly Hours:</div>
              {biweeklyHours.map((period, index) => {
                let backgroundColor = 'transparent';
                let textColor = 'black';
                
                // Si las horas son exactamente iguales al mínimo o ambos son 0
                if (period.hours === minHoursPerTwoWeeks || (period.hours === 0 && minHoursPerTwoWeeks === 0)) {
                  backgroundColor = 'transparent';
                  textColor = 'black';
                }
                // Si las horas son menores al mínimo (no cumple)
                else if (period.hours < minHoursPerTwoWeeks) {
                  backgroundColor = 'yellow';
                  textColor = 'black';
                }
                // Si las horas son mayores al mínimo (excede)
                else if (period.hours > minHoursPerTwoWeeks) {
                  backgroundColor = 'red';
                  textColor = 'white';
                }
                
                return (
                  <div
                    key={index}
                    className="text-xs"
                    style={{
                      backgroundColor: backgroundColor,
                      color: textColor,
                      padding: '2px 8px',
                      marginBottom: '2px',
                      borderRadius: '4px'
                    }}
                  >
                    {period.period}: {period.hours.toFixed(2)} hours
                  </div>
                );
              })}
            </div>
          )}

          {/* Fines de semana libres */}
          <div
            className={`text-xs ${
              !meetsWeekendRequirement ? 'text-red-600 font-medium' : 'text-gray-600'
            }`}
          >
            <span className="font-medium">Weekends off:</span> {weekendsOff}
            {!meetsWeekendRequirement && (
              <span className="ml-1">
                (below minimum of {minWeekendsOffPerMonth})
              </span>
            )}
          </div>
        </TooltipContent>
    </Tooltip>
  );
};