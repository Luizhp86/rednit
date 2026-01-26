'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Envia evento de tracking para o servidor
 * Fire and forget - não bloqueia a UI
 */
export function trackEvent(
  eventType: string,
  eventData?: Record<string, any>,
  options?: {
    page?: string
    duration?: number
  }
) {
  if (typeof window === 'undefined') return

  // Em desenvolvimento, logar no console
  if (process.env.NODE_ENV === 'development') {
    console.log('[TRACK]', eventType, { eventData, ...options })
  }

  fetch('/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType,
      eventData,
      page: options?.page || window.location.pathname,
      duration: options?.duration,
    }),
  }).catch((error) => {
    // Falha silenciosa - tracking não deve quebrar a aplicação
    if (process.env.NODE_ENV === 'development') {
      console.error('[TRACK ERROR]', error)
    }
  })
}

/**
 * Hook para rastrear visualizações de página automaticamente
 * Registra PAGE_VIEW quando a página muda e calcula duração
 */
export function usePageTracking() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const previousPathRef = useRef<string | null>(null)
  const hasTrackedInitialRef = useRef<boolean>(false)

  useEffect(() => {
    // Se já temos uma página anterior, registrar saída com duração
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      const duration = Date.now() - startTimeRef.current
      trackEvent('PAGE_VIEW', { type: 'exit' }, {
        page: previousPathRef.current,
        duration,
      })
    }

    // Registrar entrada na nova página (sempre, incluindo a primeira)
    if (!hasTrackedInitialRef.current || previousPathRef.current !== pathname) {
      trackEvent('PAGE_VIEW', { type: 'enter' }, {
        page: pathname,
      })
      hasTrackedInitialRef.current = true
    }

    // Atualizar referências
    startTimeRef.current = Date.now()
    previousPathRef.current = pathname

    // Cleanup: registrar duração quando componente desmonta (usuário saindo)
    return () => {
      if (previousPathRef.current) {
        const duration = Date.now() - startTimeRef.current
        trackEvent('PAGE_EXIT', undefined, {
          page: previousPathRef.current,
          duration,
        })
      }
    }
  }, [pathname])
}

/**
 * Hook para rastrear profundidade de scroll
 * Registra marcos de 25%, 50%, 75%, 100%
 */
export function useScrollTracking(page?: string) {
  const scrollMarksRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    // Reset marcas quando página muda
    scrollMarksRef.current.clear()

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY
      const percentage = Math.round((scrolled / scrollHeight) * 100)

      // Registrar marcos
      const marks = [25, 50, 75, 100]
      for (const mark of marks) {
        if (percentage >= mark && !scrollMarksRef.current.has(mark)) {
          scrollMarksRef.current.add(mark)
          trackEvent('SCROLL_DEPTH', {
            depth: mark,
            page: page || window.location.pathname,
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page])
}

/**
 * Hook para rastrear cliques em botões/elementos
 */
export function useClickTracking() {
  return (element: string, data?: Record<string, any>) => {
    trackEvent('BUTTON_CLICK', {
      element,
      ...data,
    })
  }
}

/**
 * Hook para rastrear erros
 */
export function useErrorTracking() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent('ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('ERROR', {
        message: 'Unhandled Promise Rejection',
        reason: event.reason?.toString(),
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}

/**
 * Hook completo que combina tracking de página, scroll e erros
 */
export function useTracking() {
  usePageTracking()
  useScrollTracking()
  useErrorTracking()
}
