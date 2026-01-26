'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, X, CheckCircle2 } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-full">
              <Phone className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Seu telefone</h2>
              <p className="text-gray-400 text-sm">Para conectar você com um especialista</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-gray-300">WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="bg-gray-700 border-gray-600 text-white text-lg mt-1"
              autoFocus
            />
            <p className="text-gray-500 text-xs mt-1">
              Usado apenas para conectar você com especialistas
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Continuar
              </span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
