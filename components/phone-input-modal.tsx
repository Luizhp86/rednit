'use client'

import { useState } from 'react'
import { Phone, X, CheckCircle2, Sparkles, Shield, MessageCircle, Instagram, Facebook, Star } from 'lucide-react'

type PhoneInputModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (phone: string, social?: { facebook?: string; instagram?: string; signo?: string }) => void
  userName?: string | null
}

export function PhoneInputModal({ isOpen, onClose, onSave, userName }: PhoneInputModalProps) {
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [signo, setSigno] = useState('')
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

  const formatSocialHandle = (value: string) => {
    // Remove @ if user types it
    return value.replace(/^@/, '').trim()
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Preparar dados para salvar
      const updateData: any = { phone: digits }
      if (instagram.trim()) updateData.instagram = formatSocialHandle(instagram)
      if (facebook.trim()) updateData.facebook = formatSocialHandle(facebook)
      if (signo) updateData.signo = signo
      
      // Salvar no perfil do usuário
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (res.ok) {
        onSave(digits, { 
          facebook: facebook.trim() || undefined, 
          instagram: instagram.trim() || undefined,
          signo: signo || undefined
        })
        onClose()
      } else {
        setError('Erro ao salvar. Tente novamente.')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl border border-purple-100 overflow-hidden">
          {/* Header com gradiente */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-6 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Só mais um passo!'}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">Complete seu cadastro</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Benefícios */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-purple-100 rounded-xl border border-purple-200">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Conecte-se com especialistas em relacionamentos</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-200">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium">Seus dados são protegidos e privados</span>
              </div>
            </div>

            {/* Telefone - Obrigatório */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-2">
                <Phone className="w-4 h-4 text-purple-600" />
                Seu WhatsApp
                <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-lg rounded-2xl px-4 py-4 text-center font-semibold placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                autoFocus
              />
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Redes sociais (opcional)</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Instagram - Opcional */}
            <div>
              <label htmlFor="instagram" className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                <input
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(formatSocialHandle(e.target.value))}
                  placeholder="seu.usuario"
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 pl-9 placeholder:text-gray-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
                />
              </div>
            </div>

            {/* Facebook - Opcional */}
            <div>
              <label htmlFor="facebook" className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="facebook"
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value.trim())}
                placeholder="Nome do perfil ou link"
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Signo - Opcional */}
            <div>
              <label htmlFor="signo" className="flex items-center gap-2 text-gray-700 font-medium text-sm mb-2">
                <Star className="w-4 h-4 text-amber-500" />
                Seu Signo
                <span className="text-xs text-gray-400 font-normal">(opcional)</span>
              </label>
              <select
                id="signo"
                value={signo}
                onChange={(e) => setSigno(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
              >
                <option value="">Selecione seu signo</option>
                <option value="Áries">Áries</option>
                <option value="Touro">Touro</option>
                <option value="Gêmeos">Gêmeos</option>
                <option value="Câncer">Câncer</option>
                <option value="Leão">Leão</option>
                <option value="Virgem">Virgem</option>
                <option value="Libra">Libra</option>
                <option value="Escorpião">Escorpião</option>
                <option value="Sagitário">Sagitário</option>
                <option value="Capricórnio">Capricórnio</option>
                <option value="Aquário">Aquário</option>
                <option value="Peixes">Peixes</option>
              </select>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Usamos seus contatos apenas para conectar você com especialistas
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || phone.replace(/\D/g, '').length < 10}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 text-lg font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Continuar para análises</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        .font-display {
          font-family: var(--font-playfair), Georgia, serif;
        }
      `}</style>
    </div>
  )
}
