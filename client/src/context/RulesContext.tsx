import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useEmployeeLists } from './EmployeeListsContext';

export interface RulesState {
  startDate: string;
  endDate: string;
  maxConsecutiveShifts: string;
  minDaysOffAfterMax: string;
  minWeekendsOffPerMonth: string;
  minRestHoursBetweenShifts: string;
  writtenRule1: string;
  writtenRule2: string;
  minHoursPerWeek: string;
  minHoursPerTwoWeeks: string;
}

interface RulesContextType {
  rules: RulesState;
  updateRules: (rules: Partial<RulesState>) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

// Get current date and one month from now for default dates
const today = new Date();
const nextMonth = new Date(today);
nextMonth.setMonth(today.getMonth() + 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const defaultRules: RulesState = {
  startDate: formatDate(today),
  endDate: formatDate(nextMonth),
  maxConsecutiveShifts: '5',
  minDaysOffAfterMax: '2',
  minWeekendsOffPerMonth: '2',
  minRestHoursBetweenShifts: '12',
  writtenRule1: '',
  writtenRule2: '',
  minHoursPerWeek: '40',
  minHoursPerTwoWeeks: '80'
};

export const RulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar try-catch para manejar el posible error de contexto no disponible
  let employeeListsContext;
  try {
    employeeListsContext = useEmployeeLists();
  } catch (error) {
    console.warn("EmployeeListsContext not available yet, using default values");
    employeeListsContext = {
      getCurrentList: () => null,
      updateList: () => console.warn("updateList not available")
    };
  }
  
  const { getCurrentList, updateList, refreshTrigger } = employeeListsContext;
  
  // Usar el operador opcional para evitar errores si getCurrentList es undefined
  const currentList = getCurrentList?.();
  const [rules, setRules] = useState<RulesState>(currentList?.rules || defaultRules);

  useEffect(() => {
    const updatedList = getCurrentList?.();
    setRules(updatedList?.rules || defaultRules);
  }, [getCurrentList, refreshTrigger]);

  const updateRules = (newRules: Partial<RulesState>) => {
    const list = getCurrentList?.();
    const updated = { ...rules, ...newRules };
    setRules(updated);
    if (list) {
      updateList(list.id, { rules: updated });
    }
  };

  return (
    <RulesContext.Provider value={{ rules, updateRules }}>
      {children}
    </RulesContext.Provider>
  );
};

export const useRules = () => {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};