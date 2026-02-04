'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

type PageLoaderProps = {
  message?: string
}

const ROTATING_PHRASES = [
  'Analisando os sinais de interesse...',
  'Decifrando as mensagens ocultas...',
  'Identificando red flags...',
  'Avaliando a compatibilidade...',
  'Calculando o nível de engajamento...',
  'Detectando padrões de comunicação...',
  'Verificando sinais de reciprocidade...',
  'Interpretando os comportamentos...',
  'Analisando a consistência das ações...',
  'Descobrindo as verdadeiras intenções...',
]

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  // Detecta se a mensagem é a padrão para usar frases rotativas
  const useRotatingPhrases = message === 'Analisando sua relação...'

  useEffect(() => {
    if (!useRotatingPhrases) return

    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length)
        setFadeIn(true)
      }, 300) // Tempo do fade out
    }, 3500) // Muda a cada 3.5 segundos

    return () => clearInterval(interval)
  }, [useRotatingPhrases])

  const displayMessage = useRotatingPhrases 
    ? ROTATING_PHRASES[currentPhraseIndex] 
    : message

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px] animate-pulse" />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <p 
            className={`mt-6 text-gray-600 font-medium transition-opacity duration-300 ${
              fadeIn ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ minHeight: '1.5rem' }}
          >
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  )
}
