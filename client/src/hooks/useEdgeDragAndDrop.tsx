import { useEffect } from 'react';
import { isEdge } from '@/utils/edgeCompat';

// Hook para mejorar compatibilidad de drag and drop en Edge
export const useEdgeDragAndDrop = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isEdge() || !elementRef.current) return;

    const element = elementRef.current;
    
    // Agregar atributos específicos para Edge
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    (element.style as any).msUserSelect = 'none';
    
    // Prevenir comportamiento por defecto en Edge
    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        // Edge a veces necesita datos dummy
        try {
          e.dataTransfer.setData('text/html', element.innerHTML);
        } catch (err) {
          // Fallback si falla
          e.dataTransfer.setData('text', '');
        }
      }
    };
    
    const handleDragOver = (e: DragEvent) => {
      if (e.preventDefault) {
        e.preventDefault();
      }
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      return false;
    };
    
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    
    return () => {
      element.removeEventListener('dragstart', handleDragStart);
      element.removeEventListener('dragover', handleDragOver);
    };
  }, [elementRef]);
};

// Función helper para obtener props de drag and drop compatibles con Edge
export const getEdgeDragProps = (isDragging?: boolean) => {
  if (!isEdge()) return {};
  
  return {
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      msUserSelect: 'none',
      opacity: isDragging ? 0.5 : 1,
    },
    // Edge necesita estos atributos
    draggable: true,
    'data-draggable': 'true',
  };
};