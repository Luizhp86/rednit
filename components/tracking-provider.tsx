'use client'

import { useTracking } from '@/lib/tracking'

/**
 * Provider que adiciona tracking automático de página, scroll e erros
 * Deve ser usado no layout raiz
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  useTracking()
  return <>{children}</>
}
