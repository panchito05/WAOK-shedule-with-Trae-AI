import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isBrowserSupported, getBrowserInfo } from '@/utils/browserCompat';

export const BrowserCompatibilityBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si ya se descartó el aviso
    const wasDismissed = localStorage.getItem('browserCompatibilityDismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Mostrar banner si el navegador no es compatible
    if (!isBrowserSupported()) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('browserCompatibilityDismissed', 'true');
  };

  if (!show || dismissed) {
    return null;
  }

  const { browserName, browserVersion } = getBrowserInfo();

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <strong>Aviso de compatibilidad:</strong> Estás usando {browserName} {browserVersion}. 
              Para una mejor experiencia, recomendamos actualizar a la última versión de Chrome, Firefox, Safari o Edge.
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};