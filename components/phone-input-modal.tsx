'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, X, CheckCircle2, Sparkles, Shield, MessageCircle } from 'lucide-react'

type PhoneInputModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (phone: string) => void
  userName?: string | null
}

export function PhoneInputModal({ isOpen, onClose, onSave, userName }: PhoneInputModalProps) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, '')
    
    if (digits.length < 10 || digits.length > 11) {
      setError('Digite um telefone válido com DDD')
      return
    }
    
    setLoading(true)
    
    try {
      // Salvar telefone no perfil do usuário
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits })
      })
      
      if (res.ok) {
        onSave(digits)
        onClose()
      } else {
        setError('Erro ao salvar telefone. Tente novamente.')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="bg-white border-gray-200 p-0 w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Só mais um passo!'}
              </h2>
              <p className="text-white/80 text-sm">Complete seu cadastro</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Benefícios */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Conecte-se com especialistas em relacionamentos</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 bg-green-100 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">Seus dados são protegidos e privados</span>
            </div>
          </div>

          {/* Input */}
          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">Seu WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="bg-gray-50 border-gray-300 text-gray-900 text-lg mt-2 h-14 text-center font-medium"
              autoFocus
            />
            <p className="text-gray-500 text-xs mt-2 text-center">
              Usamos apenas para conectar você com especialistas
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Continuar para análises
              </span>
            )}
          </Button>

          <button
            onClick={onClose}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition py-2"
          >
            Pular por agora
          </button>
        </div>
      </Card>
    </div>
  )
}
