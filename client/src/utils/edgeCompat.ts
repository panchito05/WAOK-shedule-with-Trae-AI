// Utilidades específicas para compatibilidad con Microsoft Edge

import { getBrowserInfo } from './browserCompat';

// Detectar si es Microsoft Edge
export const isEdge = (): boolean => {
  const { browserName } = getBrowserInfo();
  return browserName === 'Edge';
};

// Detectar versión de Edge
export const getEdgeVersion = (): number => {
  const { browserName, browserVersion } = getBrowserInfo();
  if (browserName === 'Edge') {
    return parseInt(browserVersion) || 0;
  }
  return 0;
};

// Fix para autofocus en Edge
export const edgeAutoFocus = (element: HTMLElement | null, delay: number = 100): void => {
  if (!element) return;
  
  if (isEdge()) {
    // En Edge, el autofocus a veces necesita un delay
    setTimeout(() => {
      element.focus();
      // Forzar el foco nuevamente si no funcionó
      if (document.activeElement !== element) {
        element.click();
        element.focus();
      }
    }, delay);
  } else {
    element.focus();
  }
};

// Fix para date inputs en Edge
export const getDateInputStyles = (): string => {
  if (isEdge()) {
    // Estilos específicos para Edge
    return `
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-calendar-picker-indicator]:absolute
      [&::-webkit-calendar-picker-indicator]:right-0
      [&::-webkit-calendar-picker-indicator]:w-full
      [&::-webkit-calendar-picker-indicator]:h-full
      [&::-webkit-calendar-picker-indicator]:cursor-pointer
      [&::-ms-clear]:display-none
      [&::-ms-reveal]:display-none
    `;
  }
  return `
    [&::-webkit-calendar-picker-indicator]:opacity-0
    [&::-webkit-calendar-picker-indicator]:absolute
    [&::-webkit-calendar-picker-indicator]:right-0
    [&::-webkit-calendar-picker-indicator]:w-full
    [&::-webkit-calendar-picker-indicator]:h-full
    [&::-webkit-calendar-picker-indicator]:cursor-pointer
  `;
};

// Fix para window.print en Edge
export const safePrint = (onAfterPrint?: () => void): void => {
  if (isEdge()) {
    // En Edge, usar MediaQueryList como alternativa
    const mediaQueryList = window.matchMedia('print');
    
    const handlePrintChange = (mql: MediaQueryListEvent | MediaQueryList) => {
      if (!mql.matches && onAfterPrint) {
        // Saliendo del modo impresión
        onAfterPrint();
        mediaQueryList.removeEventListener('change', handlePrintChange);
      }
    };
    
    mediaQueryList.addEventListener('change', handlePrintChange);
    window.print();
    
    // Fallback con timeout para Edge antiguo
    if (onAfterPrint) {
      setTimeout(() => {
        onAfterPrint();
        mediaQueryList.removeEventListener('change', handlePrintChange);
      }, 1000);
    }
  } else {
    // Navegadores modernos
    if (onAfterPrint) {
      window.onafterprint = onAfterPrint;
    }
    window.print();
  }
};

// Fix para drag and drop en Edge
export const getDragAndDropProps = () => {
  if (isEdge()) {
    return {
      // Edge a veces necesita estos atributos adicionales
      draggable: true,
      style: {
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
      }
    };
  }
  return {};
};

// Fix para canvas/blob en Edge
export const safeCreateObjectURL = (blob: Blob): string => {
  if (isEdge() && getEdgeVersion() < 90) {
    // Edge antiguo puede tener problemas con createObjectURL
    try {
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating object URL in Edge:', error);
      // Fallback: convertir a data URL
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }) as any; // Esto necesitaría manejo asíncrono
    }
  }
  return URL.createObjectURL(blob);
};

// Fix para scroll behavior en Edge
export const smoothScrollTo = (element: HTMLElement, options?: ScrollIntoViewOptions): void => {
  if (isEdge() && getEdgeVersion() < 88) {
    // Edge antiguo puede no soportar smooth scroll
    element.scrollIntoView({ behavior: 'auto', ...options });
  } else {
    element.scrollIntoView({ behavior: 'smooth', ...options });
  }
};

// Detectar soporte para ciertas características
export const edgeFeatureSupport = () => {
  return {
    smoothScroll: 'scrollBehavior' in document.documentElement.style,
    focusVisible: CSS.supports('selector(:focus-visible)'),
    gap: CSS.supports('gap', '1px'),
    aspectRatio: CSS.supports('aspect-ratio', '1/1'),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
  };
};