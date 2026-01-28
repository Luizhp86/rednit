'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Target, Zap } from 'lucide-react'

type QuestionTransitionLoaderProps = {
  isVisible: boolean
  currentQuestion?: number
  totalQuestions?: number
}

// Frases temáticas que aparecem durante as transições
const transitionPhrases = [
  "Analisando os sinais...",
  "Processando padrões...",
  "Calculando compatibilidade...",
  "Decifrando comportamentos...",
  "Conectando os pontos...",
  "Revelando insights...",
  "Mapeando o radar...",
  "Detectando red flags...",
  "Avaliando green flags...",
  "Interpretando os dados...",
]

export function QuestionTransitionLoader({ 
  isVisible, 
  currentQuestion = 1, 
  totalQuestions = 14 
}: QuestionTransitionLoaderProps) {
  // Seleciona uma frase baseada no índice da pergunta para consistência
  const phraseIndex = currentQuestion % transitionPhrases.length
  const phrase = transitionPhrases[phraseIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/95 via-pink-50/95 to-orange-50/95 backdrop-blur-md"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating hearts */}
            <motion.div
              className="absolute top-1/4 left-1/5"
              animate={{
                y: [0, -15, 0],
                rotate: [-5, 5, -5],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-8 h-8 text-pink-300/50 fill-pink-300/30" />
            </motion.div>
            
            <motion.div
              className="absolute top-1/3 right-1/4"
              animate={{
                y: [0, -20, 0],
                rotate: [5, -5, 5],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-purple-300/50" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-1/3 left-1/4"
              animate={{
                y: [0, -12, 0],
                rotate: [-3, 3, -3],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Target className="w-7 h-7 text-orange-300/50" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-1/4 right-1/5"
              animate={{
                y: [0, -18, 0],
                rotate: [3, -3, 3],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <Zap className="w-5 h-5 text-yellow-400/50" />
            </motion.div>

            {/* Gradient orbs */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-[80px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-300/20 rounded-full blur-[60px]"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Main loader content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Animated radar/heart icon */}
            <div className="relative mb-6">
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-purple-400/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-pink-400/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-orange-400/40" />
              </motion.div>

              {/* Central icon */}
              <motion.div
                className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30"
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Phrase */}
            <motion.p
              key={phrase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-600 font-medium text-sm tracking-wide"
            >
              {phrase}
            </motion.p>

            {/* Animated dots */}
            <div className="flex gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
