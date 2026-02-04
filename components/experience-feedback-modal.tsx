'use client'

import { useState } from 'react'
import { X, Star, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ExperienceFeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, message: string) => Promise<void>
  onSkip: () => Promise<void>
}

export function ExperienceFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
}: ExperienceFeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma nota')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(rating, message)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setSubmitting(true)
    try {
      await onSkip()
    } catch (error) {
      console.error('Error skipping feedback:', error)
      alert('Erro ao processar')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md animate-fade-in-up"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />

          <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-purple-100">
            <button
              onClick={onClose}
              disabled={submitting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              {/* Icon */}
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border border-purple-200">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                Como está sendo sua experiência?
              </h3>
              <p className="text-gray-600 text-sm">
                Sua opinião nos ajuda a melhorar a plataforma
              </p>
            </div>

            {/* Rating Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={submitting}
                  className="p-2 transition-all hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    className={`w-8 h-8 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Message textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quer nos contar mais? (opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                disabled={submitting}
                placeholder="O que você achou? Sugestões são bem-vindas..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                rows={4}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {message.length}/1000 caracteres
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSkip}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
              >
                Agora não
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-lg shadow-purple-500/25"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar avaliação
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
