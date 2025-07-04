import './polyfills';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/edge-compat.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { EmployeeListsProvider } from './context/EmployeeListsContext';
import { ShiftProvider } from './context/ShiftContext';
import { RulesProvider } from './context/RulesContext';
import { PersonnelDataProvider } from './context/PersonnelDataContext';
import { ShiftPrioritiesProvider } from './context/ShiftPrioritiesContext';
import { SelectedEmployeesProvider } from './context/SelectedEmployeesContext';
import { isBrowserSupported, getUnsupportedBrowserMessage } from './utils/browserCompat';

// Verificar compatibilidad del navegador
if (!isBrowserSupported()) {
  console.warn(getUnsupportedBrowserMessage());
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// NOTA IMPORTANTE: Mantener este orden específico de providers
// EmployeeListsProvider debe estar más externo que los demás providers que lo usan
createRoot(rootElement).render(
  <StrictMode>
    <EmployeeListsProvider>
      <ShiftProvider>
        <RulesProvider>
          <PersonnelDataProvider>
            <ShiftPrioritiesProvider>
              <SelectedEmployeesProvider>
                <App />
              </SelectedEmployeesProvider>
            </ShiftPrioritiesProvider>
          </PersonnelDataProvider>
        </RulesProvider>
      </ShiftProvider>
    </EmployeeListsProvider>
  </StrictMode>
);
