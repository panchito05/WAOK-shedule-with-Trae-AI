# 🤖 CLAUDE.md - Guía de Contexto para Asistentes de IA

## 📋 Resumen del Proyecto

WAOK-Schedule es un sistema integral de gestión de horarios y turnos de trabajo desarrollado con tecnologías modernas de full-stack. Permite a las organizaciones programar empleados en diferentes turnos, gestionar restricciones laborales, y optimizar la asignación de personal respetando preferencias y regulaciones.

## 🏗️ Arquitectura y Stack Tecnológico

### Frontend
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Estilos**: TailwindCSS + Radix UI
- **Estado**: Context API (no Redux)
- **Formularios**: React Hook Form + Zod

### Backend
- **Servidor**: Express.js con TypeScript
- **Base de Datos**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **Autenticación**: Session-based

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Linting**: ESLint (configuración moderna)

### Contextos Principales
- `EmployeeListsContext`: Gestión de listas de empleados y configuraciones
- `ShiftContext`: Manejo de turnos y horarios
- `RulesContext`: Reglas de programación y restricciones
- `ShiftPrioritiesContext`: Prioridades de asignación de turnos

## 🎯 Funcionalidades Principales

1. **Gestión de Turnos**
   - Crear/editar/eliminar turnos con horarios flexibles
   - Soporte para turnos que cruzan medianoche (ej: 11PM - 7AM)
   - Configuración de duraciones y descansos

2. **Asignación de Empleados**
   - Sistema de combinaciones de horarios de trabajo
   - Restricción: un empleado solo puede estar en una combinación
   - Cálculo automático de horas totales por combinación

3. **Reglas y Restricciones**
   - Máximo de turnos consecutivos
   - Mínimo de horas entre turnos
   - Días libres obligatorios
   - Bloqueo de turnos específicos por empleado

4. **Sistema de Preferencias**
   - Preferencias de turno por empleado (1-5 estrellas)
   - Turnos fijos por día de la semana
   - Gestión de vacaciones y ausencias

## 🧩 Estructura de Componentes Clave

### SelectEmployeesForThisCombinationWorkingHours
```typescript
// Ubicación: /client/src/components/SelectEmployeesForThisCombinationWorkingHours/
// Función: Asignar empleados a combinaciones de 2 turnos
// Particularidad: Maneja formato de duración "8:00" y "8h 0m"
```

### ShiftConfiguration
```typescript
// Ubicación: /client/src/components/ShiftConfiguration/
// Función: Crear y editar configuración de turnos
// Importante: Calcula duración con calculateDuration()
```

### AddEmployees
```typescript
// Ubicación: /client/src/components/AddEmployees/
// Función: Gestión completa de empleados
// Features: Notas confidenciales, reglas AI, preferencias
```

### EmployeeListsContext
```typescript
// Ubicación: /client/src/context/EmployeeListsContext.tsx
// Función: Estado global de listas y empleados
// Clave: Crea 3 turnos por defecto al crear nueva lista
```

## ⚠️ Problemas Conocidos y Soluciones

### 1. Formato de Duración de Turnos
**Problema**: Turnos por defecto usan formato "8:00", pero el sistema espera "8h 0m"
**Solución**: La función `durationToHours` ahora maneja ambos formatos

### 2. IDs Dinámicos en Turnos
**Problema**: ShiftContext genera IDs aleatorios si no existen
```typescript
id: shift.id || `uid_${Math.random().toString(36).substr(2, 15)}`
```
**Impacto**: Puede causar problemas al buscar turnos por ID

### 3. Conversión a ES Modules
**Problema**: Scripts usaban `require` con `"type": "module"`
**Solución**: Todos los scripts convertidos a `import/export`

## 📐 Convenciones del Proyecto

1. **TypeScript**
   - Tipos estrictos obligatorios
   - Interfaces para todos los objetos de datos
   - No usar `any` sin justificación

2. **Componentes React**
   - Componentes funcionales únicamente
   - Hooks personalizados en `/hooks`
   - Props tipadas con interfaces

3. **Estado y Persistencia**
   - Context API para estado global
   - localStorage para persistencia local
   - Claves: `shiftColumns_{listId}`, `employeeSelections_{listId}`

4. **Estilos**
   - TailwindCSS para estilos
   - Clases utilitarias, no CSS custom
   - Componentes Radix UI para accesibilidad

## 🚀 Comandos Esenciales

```bash
# Desarrollo
npm run dev:win          # Windows
npm run dev              # Unix/Mac

# Testing
npm run test:run         # Tests unitarios
npm run test:e2e         # Tests E2E
npm run test:coverage    # Con cobertura

# Inicialización
init.bat                 # Setup completo Windows
npm run super-setup      # Setup inteligente

# Diagnóstico
npm run diagnose         # Diagnóstico completo
npm run health-check     # Verificación de salud
```

## 🔍 Consideraciones Especiales

### Horarios que Cruzan Medianoche
```typescript
// El sistema maneja correctamente turnos como 11PM - 7AM
// La función calculateDuration ajusta automáticamente:
if (endMinutes < startMinutes) {
  endMinutes += 24 * 60; // Añade 24 horas
}
```

### Turnos por Defecto
Al crear una nueva lista, se generan automáticamente:
- Turno de día: 7:00 AM - 3:00 PM
- Turno de tarde: 3:00 PM - 11:00 PM  
- Turno de noche: 11:00 PM - 7:00 AM

### Validaciones de Empleados
- Un empleado solo puede estar en UNA combinación de horarios
- Se valida antes de permitir la selección
- Se muestra en qué combinación está si ya fue asignado

## 📁 Archivos y Directorios Importantes

```
/client/src/
├── context/           # Lógica de negocio principal
│   ├── EmployeeListsContext.tsx
│   ├── ShiftContext.tsx
│   └── RulesContext.tsx
├── components/        # Componentes de UI
│   ├── SelectEmployeesForThisCombinationWorkingHours/
│   ├── ShiftConfiguration/
│   └── AddEmployees/
└── types/            # Definiciones TypeScript
    └── common.ts     # Tipos compartidos

/docs/
├── README.md         # Documentación completa
└── INICIO-RAPIDO.md  # Guía de inicio rápido
```

## 💡 Tips para Asistentes de IA

### Al Modificar Código
1. **Siempre verificar tipos**: El proyecto usa TypeScript estricto
2. **Probar con turnos nocturnos**: Asegurarse que funcionen turnos como 11PM-7AM
3. **Considerar localStorage**: Muchos datos se persisten localmente
4. **Validar formatos de duración**: Soportar "8:00" y "8h 0m"

### Al Debuggear
1. **Revisar la consola**: Hay console.logs útiles en componentes clave
2. **Verificar localStorage**: `shiftColumns_`, `employeeSelections_`
3. **IDs de turnos**: Pueden cambiar si no están persistidos

### Al Añadir Features
1. **Seguir patrones existentes**: Revisar componentes similares
2. **Actualizar tipos**: En `/types/common.ts` si es necesario
3. **Considerar contextos**: No todo necesita un contexto nuevo
4. **Documentar decisiones**: En `/docs/ADR/` para cambios arquitectónicos

## 📋 7 Reglas de Trabajo Obligatorias

### 1. Planificación Inicial
**Primero piensa en el problema**, lee el código base para archivos relevantes, y **escribe un plan en tasks/todo.md**.

### 2. Lista de Tareas
El plan debe tener una **lista de items todo** que puedas marcar como completados conforme avances.

### 3. Verificación del Plan
Antes de comenzar a trabajar, **consulta conmigo** y verificaré el plan.

### 4. Ejecución y Seguimiento
Luego, comienza a trabajar en los items todo, **marcándolos como completados** conforme avanzas.

### 5. Comunicación Continua
Por favor, en cada paso del camino dame una **explicación de alto nivel** de qué cambios realizaste.

### 6. Simplicidad Ante Todo
Haz cada tarea y cambio de código **lo más simple posible**. Queremos evitar hacer cambios masivos o complejos. Cada cambio debe **impactar la menor cantidad de código posible**. Todo se trata de simplicidad.

### 7. Revisión Final
Finalmente, agrega una **sección de revisión** al archivo todo.md con un resumen de los cambios realizados y cualquier otra información relevante.

## 🎯 Objetivo Principal

Facilitar la gestión eficiente de horarios laborales respetando:
- Regulaciones laborales
- Preferencias de empleados
- Necesidades operativas
- Restricciones y reglas customizadas

---

*Este documento es una guía viva. Actualízalo cuando encuentres nuevos patrones, problemas o soluciones importantes.*