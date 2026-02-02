'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MessageCircle, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Phone,
  X,
  Heart,
  Shield
} from 'lucide-react'

type TherapistCtaProps = {
  userId?: string
  userName?: string
  userEmail: string
  userPhone?: string | null
  analysisId?: string
  matchName?: string
  hasRedFlags?: boolean
  onPhoneUpdated?: (phone: string) => void
  therapist?: {
    id: string
    name: string
    whatsapp: string | null
  } | null
}

export function TherapistCta({
  userId,
  userName,
  userEmail,
  userPhone,
  analysisId,
  matchName,
  hasRedFlags = false,
  onPhoneUpdated,
  therapist,
}: TherapistCtaProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [whatsappOpened, setWhatsappOpened] = useState(false)
  const [error, setError] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [currentPhone, setCurrentPhone] = useState(userPhone || '')
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(formatPhone(e.target.value))
    setError('')
  }

  const handleSavePhone = async () => {
    const digits = phoneInput.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      setError('Digite um telefone válido com DDD')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits })
      })

      if (res.ok) {
        setCurrentPhone(digits)
        setShowPhoneInput(false)
        onPhoneUpdated?.(digits)
        // Agora pode prosseguir com o CTA
        await handleGenerateLead(digits)
      } else {
        setError('Erro ao salvar telefone')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    // Mostrar disclaimer antes de prosseguir
    setShowDisclaimer(true)
  }

  const handleConfirmDisclaimer = () => {
    setShowDisclaimer(false)
    
    // Se já tem terapeuta com WhatsApp, abrir direto
    if (therapist?.whatsapp) {
      const whatsappUrl = `https://wa.me/55${therapist.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar sobre minha análise.')}`
      window.open(whatsappUrl, '_blank')
      setWhatsappOpened(true)
      setSuccess(true)
      return
    }
    
    // Se não tem terapeuta, mostrar mensagem que um especialista entrará em contato
    setWhatsappOpened(false)
    setSuccess(true)
  }

  const handleGenerateLead = async (phone: string) => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/lead/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CTA',
          userId,
          userName,
          userEmail,
          userPhone: phone,
          analysisId,
          matchName,
        })
      })
      
      const data = await res.json()
      
      if (!data.success) {
        setError(data.message || 'Não foi possível conectar com um especialista no momento')
        return
      }
      
      // Se tem URL do WhatsApp, abrir
      if (data.whatsappUrl) {
        // Registrar clique
        await fetch('/api/lead/track-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: data.leadId })
        })
        
        // Abrir WhatsApp
        window.open(data.whatsappUrl, '_blank')
      }
      
      setSuccess(true)
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-green-800 border-green-600 p-6">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-300 flex-shrink-0" />
          <div>
            {whatsappOpened ? (
              <>
                <h3 className="text-lg font-semibold text-white">WhatsApp aberto!</h3>
                <p className="text-gray-100 text-sm">
                  O WhatsApp foi aberto. Inicie a conversa com o especialista agora!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">Solicitação enviada!</h3>
                <p className="text-gray-100 text-sm">
                  Um especialista entrará em contato com você em breve.
                </p>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Se mostrando input de telefone
  if (showPhoneInput) {
    return (
      <Card className="p-6 bg-purple-900/30 border-purple-600">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600/20 rounded-full">
            <Phone className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Seu WhatsApp</h3>
            <p className="text-gray-400 text-sm mb-4">
              Para conectar você com um especialista, precisamos do seu WhatsApp
            </p>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phoneInput}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="bg-gray-700 border-gray-600 text-white flex-1"
                autoFocus
              />
              <Button
                onClick={handleSavePhone}
                disabled={loading || phoneInput.replace(/\D/g, '').length < 10}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </Card>
    )
  }

  // Modal de Disclaimer - agora como overlay fixo para melhor experiência mobile
  if (showDisclaimer) {
    return (
      <>
        {/* Overlay fixo para garantir visibilidade em mobile */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 border-2 border-purple-500/50 shadow-2xl">
            {/* Gradiente decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-t-2xl"></div>
            
            <div className="p-5 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-600/30 mb-4">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Aviso Importante</h3>
              
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4 text-left">
                <p className="text-gray-300 text-xs sm:text-sm mb-3">
                  Os especialistas parceiros do Radar Match oferecem <strong className="text-white">orientação em relacionamentos</strong> e não substituem acompanhamento médico ou psicológico profissional.
                </p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  O Radar Match atua apenas como <strong className="text-white">intermediador</strong> e não se responsabiliza pelo conteúdo das conversas ou orientações prestadas pelos especialistas.
                </p>
              </div>
              
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 sm:p-4 mb-5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-red-300 font-semibold text-xs sm:text-sm">Precisa de ajuda urgente?</span>
                </div>
                <p className="text-red-200 text-xs sm:text-sm mb-2">
                  Se você está passando por uma crise emocional ou precisa de apoio imediato:
                </p>
                <a 
                  href="tel:188" 
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  CVV - Ligue 188
                </a>
                <p className="text-red-300 text-[10px] sm:text-xs mt-2">
                  Centro de Valorização da Vida • 24 horas • Gratuito
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button
                  onClick={() => setShowDisclaimer(false)}
                  variant="outline"
                  className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700 order-2 sm:order-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDisclaimer}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold order-1 sm:order-2"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Entendi, continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card placeholder para manter o layout */}
        <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 opacity-50">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent" />
          </div>
        </Card>
      </>
    )
  }

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
      {/* Gradiente decorativo no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
      
      {/* Glow effect de fundo */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative p-4 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30">
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
          {hasRedFlags ? (
            <AlertTriangle className="relative w-8 h-8 text-purple-300" />
          ) : (
            <MessageCircle className="relative w-8 h-8 text-purple-300" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {hasRedFlags ? (
              <>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                Detectamos sinais que merecem atenção
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                Quer conversar com um especialista?
              </>
            )}
          </h3>
          <p className="text-purple-200/80 text-sm mt-2">
            {hasRedFlags 
              ? 'Um especialista pode te ajudar a entender melhor esses padrões e como lidar com eles.'
              : 'Nossos especialistas em relacionamentos podem te ajudar a entender melhor sua situação.'}
          </p>
        </div>
        
        <Button
          onClick={handleClick}
          disabled={loading}
          className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-5 text-lg font-bold rounded-xl border-2 border-green-400/50 shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 ring-2 ring-green-400/30 ring-offset-2 ring-offset-transparent hover:scale-105 transition-all duration-300"
        >
          {/* Efeito shimmer */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          {loading ? (
            <span className="relative flex items-center gap-3">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Conectando...
            </span>
          ) : (
            <span className="relative flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              Falar com especialista
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}
    </Card>
  )
}
