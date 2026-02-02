'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

export type OnboardingStep = {
  target: string // data-onboarding attribute value
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

type OnboardingTourProps = {
  steps: OnboardingStep[]
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    let targetElement: HTMLElement | null = null
    let cleanup: (() => void) | null = null

    const updateTargetPosition = () => {
      const element = document.querySelector(`[data-onboarding="${step.target}"]`) as HTMLElement
      if (element) {
        targetElement = element
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)

        // Garantir que o elemento alvo tenha z-index alto para ficar visível acima do backdrop
        const originalZIndex = element.style.zIndex
        const originalPosition = element.style.position
        const computedPosition = window.getComputedStyle(element).position
        
        // Temporariamente aumentar z-index do elemento alvo
        if (computedPosition === 'static') {
          element.style.position = 'relative'
        }
        element.style.zIndex = '103'

        // Cleanup function
        cleanup = () => {
          element.style.zIndex = originalZIndex || ''
          if (originalPosition) {
            element.style.position = originalPosition
          } else {
            element.style.position = ''
          }
        }

        // Calcular posição inicial baseada no elemento target (antes do tooltip ser renderizado)
        const preferredPosition = step.position || 'bottom'
        const isMobile = window.innerWidth < 640
        
        // Posição inicial estimada (será refinada quando o tooltip for renderizado)
        let initialTop = 0
        let initialLeft = 0
        
        if (isMobile) {
          initialTop = window.innerHeight - 200 // Estimativa
          initialLeft = window.innerWidth / 2 - 200 // Estimativa
        } else {
          switch (preferredPosition) {
            case 'top':
              initialTop = rect.top - 150
              initialLeft = rect.left + rect.width / 2 - 200
              break
            case 'bottom':
              initialTop = rect.bottom + 20
              initialLeft = rect.left + rect.width / 2 - 200
              break
            case 'left':
              initialTop = rect.top + rect.height / 2 - 100
              initialLeft = rect.left - 250
              break
            case 'right':
              initialTop = rect.top + rect.height / 2 - 100
              initialLeft = rect.right + 30 // Espaçamento maior para ficar bem ao lado
              break
            case 'center':
              initialTop = window.innerHeight / 2 - 100
              initialLeft = window.innerWidth / 2 - 200
              break
          }
        }
        
        setTooltipPosition({ top: initialTop, left: initialLeft })

        // Aguardar o tooltip ser renderizado e recalcular posição precisa
        const recalculatePosition = () => {
          const tooltipEl = tooltipRef.current
          if (tooltipEl && rect.width > 0 && rect.height > 0) {
            const tooltipRect = tooltipEl.getBoundingClientRect()
            let top = 0
            let left = 0

            if (isMobile) {
              // Em mobile, sempre centralizar horizontalmente e posicionar no bottom
              top = window.innerHeight - tooltipRect.height - 20
              left = window.innerWidth / 2 - tooltipRect.width / 2
            } else {
              switch (preferredPosition) {
                case 'top':
                  top = rect.top - tooltipRect.height - 20
                  left = rect.left + rect.width / 2 - tooltipRect.width / 2
                  break
                case 'bottom':
                  top = rect.bottom + 30 // Aumentado espaçamento para não sobrepor
                  left = rect.left + rect.width / 2 - tooltipRect.width / 2
                  break
                case 'left':
                  top = rect.top + rect.height / 2 - tooltipRect.height / 2
                  left = rect.left - tooltipRect.width - 20
                  break
                case 'right':
                  top = rect.top + rect.height / 2 - tooltipRect.height / 2
                  left = rect.right + 30 // Espaçamento maior para ficar bem ao lado
                  break
                case 'center':
                  top = window.innerHeight / 2 - tooltipRect.height / 2
                  left = window.innerWidth / 2 - tooltipRect.width / 2
                  break
              }
            }

            // Ensure tooltip stays within viewport
            const padding = 16
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))

            setTooltipPosition({ top, left })
          }
        }

        // Recalcular após renderização
        requestAnimationFrame(() => {
          setTimeout(recalculatePosition, 50)
          setTimeout(recalculatePosition, 200) // Recalcular novamente após animação
        })

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
      if (cleanup) {
        cleanup()
      }
    }
  }, [currentStep, step.target, step.position])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSkip()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrevious()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep])

  if (!targetRect) return null

  // Ajustar padding do spotlight para mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const spotlightPadding = isMobile ? 8 : 12

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Backdrop SEM blur na área do elemento alvo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            // Remover blur completamente para não desfocar elementos
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          }}
          onClick={onSkip}
        >
          {/* Spotlight usando box-shadow - cria buraco real SEM blur */}
          <motion.div
            layout
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute"
            style={{
              top: `${targetRect.top - spotlightPadding}px`,
              left: `${targetRect.left - spotlightPadding}px`,
              width: `${targetRect.width + spotlightPadding * 2}px`,
              height: `${targetRect.height + spotlightPadding * 2}px`,
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Highlight ring around target - FORA do backdrop para não ter blur */}
        <motion.div
          layout
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute pointer-events-none"
          style={{
            top: `${targetRect.top - spotlightPadding}px`,
            left: `${targetRect.left - spotlightPadding}px`,
            width: `${targetRect.width + spotlightPadding * 2}px`,
            height: `${targetRect.height + spotlightPadding * 2}px`,
            borderRadius: '20px',
            border: '3px solid rgba(168, 85, 247, 0.9)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 30px rgba(168, 85, 247, 0.2)',
            zIndex: 102, // Acima do backdrop
          }}
        />

        {/* Tooltip - z-index 101 (abaixo do elemento destacado 103 e highlight 102) */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute pointer-events-auto bg-white rounded-2xl shadow-2xl border border-purple-100 mx-4 sm:mx-0 max-w-md w-auto z-[101]"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-t-2xl" />

          <div className="p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Remover ícone de estrela (Sparkles) da segunda mensagem (currentStep === 1) */}
                {currentStep !== 1 && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-purple-600 font-medium">
                    {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onSkip}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Pular tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-600 text-sm leading-relaxed mb-5 sm:mb-6">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all flex items-center gap-2 text-sm touch-manipulation"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:from-purple-700 active:to-pink-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25 text-sm touch-manipulation"
                >
                  <span>{isLastStep ? 'Começar' : 'Próximo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Skip link */}
            {!isLastStep && (
              <div className="mt-3 sm:mt-4 text-center">
                <button
                  onClick={onSkip}
                  className="text-xs text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors touch-manipulation py-2"
                >
                  Pular tutorial
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Completion celebration */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="text-6xl">✨</div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
