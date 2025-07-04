// Utilidades para compatibilidad con navegadores

// Verificar soporte de localStorage
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Wrapper seguro para localStorage
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage no disponible');
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error al leer localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage no disponible');
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error al escribir en localStorage:', error);
    }
  },
  
  removeItem: (key: string): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
    }
  }
};

// Verificar soporte de drag and drop
export const isDragAndDropSupported = (): boolean => {
  const div = document.createElement('div');
  return ('draggable' in div || 'ondragstart' in div && 'ondrop' in div) &&
    'FormData' in window &&
    'FileReader' in window;
};

// Verificar soporte de Intl API
export const isIntlSupported = (): boolean => {
  return typeof Intl !== 'undefined' && 
    typeof Intl.DateTimeFormat !== 'undefined';
};

// Fallback para toLocaleDateString
export const safeToLocaleDateString = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (isIntlSupported()) {
    try {
      return date.toLocaleDateString(locale, options);
    } catch {
      // Fallback si el locale no es soportado
    }
  }
  
  // Fallback simple
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

// Fallback para toLocaleTimeString
export const safeToLocaleTimeString = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (isIntlSupported()) {
    try {
      return date.toLocaleTimeString(locale, options);
    } catch {
      // Fallback si el locale no es soportado
    }
  }
  
  // Fallback simple
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Verificar soporte de matchMedia
export const supportsMatchMedia = (): boolean => {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
};

// Wrapper seguro para matchMedia
export const safeMatchMedia = (query: string): MediaQueryList | null => {
  if (!supportsMatchMedia()) {
    return null;
  }
  return window.matchMedia(query);
};

// Detectar navegador y versión
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Trident') > -1) {
    browserName = 'IE';
    browserVersion = '11';
  }
  
  return { browserName, browserVersion };
};

// Verificar si el navegador es compatible
export const isBrowserSupported = (): boolean => {
  const { browserName, browserVersion } = getBrowserInfo();
  const version = parseInt(browserVersion);
  
  const minVersions: Record<string, number> = {
    Chrome: 80,
    Firefox: 75,
    Safari: 13,
    Edge: 80,
    IE: 99 // IE no soportado
  };
  
  return version >= (minVersions[browserName] || 0);
};

// Mensaje de navegador no soportado
export const getUnsupportedBrowserMessage = (): string => {
  const { browserName, browserVersion } = getBrowserInfo();
  return `Tu navegador ${browserName} ${browserVersion} puede no ser completamente compatible. 
    Recomendamos actualizar a la última versión o usar Chrome, Firefox, Safari o Edge modernos.`;
};