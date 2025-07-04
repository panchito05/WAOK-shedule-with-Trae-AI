import { useState, useEffect } from 'react';
import { safeLocalStorage } from '@/utils/browserCompat';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para almacenar nuestro valor
  // Pasar la función de inicialización a useState para que la lógica solo se ejecute una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener del localStorage por clave
      const item = safeLocalStorage.getItem(key);
      // Parsear el JSON almacenado o devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, devolver initialValue
      console.error(`Error al leer localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor en localStorage y estado
  const setValue = (value: T) => {
    try {
      // Permitir que value sea una función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar el estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      safeLocalStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error al escribir en localStorage key "${key}":`, error);
    }
  };

  // Sincronizar con otros tabs/ventanas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error al sincronizar localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}