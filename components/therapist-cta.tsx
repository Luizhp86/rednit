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
  Phone
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
}: TherapistCtaProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [currentPhone, setCurrentPhone] = useState(userPhone || '')

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

  const handleClick = async () => {
    // Se não tem telefone, mostrar input
    if (!currentPhone) {
      setShowPhoneInput(true)
      return
    }
    await handleGenerateLead(currentPhone)
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
      <Card className="bg-green-900/20 border-green-700 p-6">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white">Especialista notificado!</h3>
            <p className="text-green-300 text-sm">
              Um especialista foi notificado e entrará em contato em breve.
              {' '}Se o WhatsApp abriu, você pode iniciar a conversa agora!
            </p>
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

  return (
    <Card className={`p-6 ${hasRedFlags ? 'bg-purple-900/30 border-purple-600' : 'bg-gray-800/50 border-gray-700'}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={`p-3 rounded-full ${hasRedFlags ? 'bg-purple-600/20' : 'bg-gray-700'}`}>
          {hasRedFlags ? (
            <AlertTriangle className="w-8 h-8 text-purple-400" />
          ) : (
            <MessageCircle className="w-8 h-8 text-purple-400" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {hasRedFlags ? (
              <>
                <Sparkles className="w-5 h-5 text-purple-400" />
                Detectamos sinais que merecem atenção
              </>
            ) : (
              'Quer conversar com um especialista?'
            )}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {hasRedFlags 
              ? 'Um especialista pode te ajudar a entender melhor esses padrões e como lidar com eles.'
              : 'Nossos especialistas em relacionamentos podem te ajudar a entender melhor sua situação.'}
          </p>
        </div>
        
        <Button
          onClick={handleClick}
          disabled={loading}
          className={`${hasRedFlags ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white px-6`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Conectando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Falar com especialista
              <ArrowRight className="w-4 h-4" />
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
