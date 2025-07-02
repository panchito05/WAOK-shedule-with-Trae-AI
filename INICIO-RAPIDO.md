# 🚀 WAOK-Schedule - Guía de Inicio Rápido

## ⚡ Inicialización en 2 Comandos (Recomendado)

### Para Windows
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm run dev:win
```

**¡Listo!** Accede a: http://localhost:5000

---

## 🎯 Métodos de Inicialización

### Opción 1: UN SOLO COMANDO - SOLUCIONA TODO
```bash
# Script de inicialización ultra-rápida (Windows)
init.bat

# Con opciones:
init.bat --force        # Reinstalación completa
init.bat --no-server    # Solo setup, sin servidor
init.bat --help         # Ver todas las opciones
```

### Opción 2: Comandos NPM

| Comando | Descripción | Uso Recomendado |
|---------|-------------|----------------|
| `npm run quick-start` | Instalación + servidor | **Primer uso** |
| `npm run dev:win` | Solo servidor (Windows) | **Desarrollo diario** |
| `npm run dev` | Servidor multiplataforma | **Linux/Mac** |
| `npm run init:safe` | Inicialización segura | **Si hay problemas** |
| `npm run super-setup` | Setup inteligente con auto-reparación | **Problemas complejos** |

---

## ⚠️ Problemas Comunes SOLUCIONADOS

### ✅ Error "require is not defined"
**SOLUCIONADO PERMANENTEMENTE**
- Archivos convertidos a ES Modules
- No requiere acción manual

### ✅ Fallos de npm ci
**SOLUCIÓN**: Usar `npm install` en lugar de `npm ci`
- Scripts actualizados para evitar este problema

### ✅ Problemas de permisos en Windows
```bash
npm run clean
npm run start:fast
```

### ✅ Puerto 5000 ocupado
```bash
# Ver qué usa el puerto
netstat -ano | findstr :5000

# Detener proceso si es necesario
taskkill /F /PID <ID_DEL_PROCESO>

# O cambiar puerto en .env.local
PORT=5001
```

---

## 📋 Verificación Post-Inicialización

```bash
# Verificar que todo funciona
npm run quick-check

# Diagnóstico completo (opcional)
npm run diagnose

# Diagnóstico con auto-reparación
node scripts/diagnose.js --fix
```

---

## 🆘 Si Algo Falla

### Método 1: Reset Rápido
```bash
# Detener procesos
Get-Process node,npm,tsx | Stop-Process -Force

# Limpiar y reinstalar
npm run reset
npm install
npm run dev:win
```

### Método 2: Reset Manual
```bash
# Limpiar manualmente
rmdir /s /q node_modules
rmdir /s /q .vite
npm install --force
npm run start:fast
```

---

## 🌐 URLs de Acceso

- **Aplicación**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

## 📝 Desarrollo

### Testing Rápido
```bash
npm run test:quick       # Tests básicos
npm run test:coverage    # Con cobertura
npm run lint:fix         # Corregir linting
```

### Base de Datos
```bash
# Solo si tienes DATABASE_URL real configurada
npm run db:setup
npm run db:push
```

---

## 📋 Configuración Requerida

1. **Node.js**: Versión 18+ requerida
2. **Variables de entorno**: El archivo `.env.local` se crea automáticamente
3. **Base de datos**: Para usar base de datos real, editar `DATABASE_URL` en `.env.local`

---

## ✨ Funcionalidades Verificadas

- ✅ Servidor Express en puerto 5000
- ✅ Frontend React con Vite
- ✅ Hot reload automático
- ✅ TypeScript configurado
- ✅ Tailwind CSS funcionando
- ✅ Base de datos conectada
- ✅ Testing suite disponible
- ✅ ESLint configurado

---

**🎯 COMANDO RECOMENDADO PARA NUEVOS USUARIOS:**
```bash
npm run quick-start
```

**🎯 COMANDO RECOMENDADO PARA USO DIARIO:**
```bash
npm run dev:win
```

**✅ Después del setup, el servidor debería estar corriendo en http://localhost:5000**