import * as React from "react"
import { safeMatchMedia } from "@/utils/browserCompat"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Verificar soporte de matchMedia
    const mql = safeMatchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    if (mql) {
      // Usar addEventListener/removeEventListener para mejor compatibilidad
      if ('addEventListener' in mql) {
        mql.addEventListener("change", onChange)
      } else if ('addListener' in mql) {
        // Fallback para navegadores antiguos
        (mql as any).addListener(onChange)
      }
      
      setIsMobile(mql.matches)
      
      return () => {
        if ('removeEventListener' in mql) {
          mql.removeEventListener("change", onChange)
        } else if ('removeListener' in mql) {
          // Fallback para navegadores antiguos
          (mql as any).removeListener(onChange)
        }
      }
    } else {
      // Fallback si matchMedia no está soportado
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return !!isMobile
}
