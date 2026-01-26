'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { Tag, CheckCircle2, Loader2 } from 'lucide-react'

type UserData = {
  id: string
  email: string
  name: string
  plan: string
  creditsFreeDaily: number
  creditsPaid: number
  proUntil: string | null
  stats: {
    totalAnalyses: number
    totalPayments: number
  }
  prices?: {
    subscription: {
      monthly: number
      quarterly: number
      yearly: number
    }
  }
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  
  // Estados do cupom
  const [couponCode, setCouponCode] = useState('')
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; percentOff: number } | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      if (res.ok) {
        router.push('/')
      } else {
        alert('Erro ao excluir conta')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir conta')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAnalyses = async () => {
    if (!confirm('Tem certeza que deseja excluir todas as suas análises? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/analyses', { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        alert(data.message || 'Análises excluídas com sucesso')
        // Reload user data to update the count
        const userRes = await fetch('/api/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        router.push('/dashboard')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir análises')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir análises')
    } finally {
      setDeleting(false)
    }
  }

  const handleDowngradePlan = async () => {
    if (!confirm('Tem certeza que deseja voltar ao plano FREE?')) {
      return
    }

    setDowngrading(true)
    try {
      const res = await fetch('/api/downgrade-plan', { method: 'POST' })
      if (res.ok) {
        const userRes = await fetch('/api/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        alert('Seu plano foi alterado para FREE.')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao atualizar plano')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar plano')
    } finally {
      setDowngrading(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')
    setCouponValid(null)

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setCouponValid(true)
        setAppliedCoupon({
          id: data.coupon.id,
          percentOff: data.coupon.percentOff,
        })
      } else {
        setCouponValid(false)
        setCouponError(data.error || 'Cupom inválido')
        setAppliedCoupon(null)
      }
    } catch {
      setCouponValid(false)
      setCouponError('Erro ao validar cupom')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponValid(null)
    setCouponError('')
    setAppliedCoupon(null)
  }

  const handleSubscribe = async (period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => {
    setSubscribing(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'SUBSCRIPTION', 
          subscriptionPeriod: period,
          couponCode: appliedCoupon?.id 
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert(data.message || 'Assinatura ativada!')
          window.location.reload()
        } else {
          window.location.href = data.checkoutUrl
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar assinatura')
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-purple-700">
                Coach de Relacionamentos
              </span>
              <span className="text-xs text-gray-500 hidden md:block">
                Análise objetiva do seu match
              </span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Minha Conta</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nome:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Plano:</span>{' '}
                <span
                  className={`px-2 py-1 rounded ${
                    user.plan === 'PRO' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.plan}
                </span>
              </p>
              {user.proUntil && (
                <p>
                  <span className="font-semibold">PRO até:</span>{' '}
                  {new Date(user.proUntil).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Estatísticas</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Análises totais:</span> {user.stats.totalAnalyses}
              </p>
              <p>
                <span className="font-semibold">Créditos gratuitos restantes hoje:</span>{' '}
                {user.creditsFreeDaily}
              </p>
              <p>
                <span className="font-semibold">Créditos pagos:</span> {user.creditsPaid}
              </p>
            </div>
          </div>

          {user.plan === 'FREE' && (
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">✨ Upgrade para PRO</h3>
              <p className="text-gray-700 mb-4">
                Acesso ilimitado a análises completas e todos os recursos premium.
              </p>
              
              {/* Planos de assinatura */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleSubscribe('MONTHLY')}
                  disabled={subscribing}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer"
                >
                  Mensal - R$ {((user.prices?.subscription.monthly || 2990) / 100).toFixed(2).replace('.', ',')}/mês
                </button>
                <button
                  onClick={() => handleSubscribe('QUARTERLY')}
                  disabled={subscribing}
                  className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50 relative cursor-pointer"
                >
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    11% OFF
                  </span>
                  Trimestral - R$ {((user.prices?.subscription.quarterly || 7990) / 100).toFixed(2).replace('.', ',')}
                </button>
                <button
                  onClick={() => handleSubscribe('YEARLY')}
                  disabled={subscribing}
                  className="w-full bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:opacity-50 relative cursor-pointer"
                >
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    17% OFF
                  </span>
                  Anual - R$ {((user.prices?.subscription.yearly || 29900) / 100).toFixed(2).replace('.', ',')}/ano
                </button>
              </div>

              {/* Cupom de desconto - sempre visível de forma discreta */}
              <div className="pt-4 border-t border-purple-200">
                {!appliedCoupon ? (
                  <div className="flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Cupom de desconto"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                      disabled={couponLoading}
                      className="w-40 h-9 text-sm border border-purple-200 rounded-lg px-3 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-9 px-3 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Aplicar'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {appliedCoupon.percentOff === 100 ? '1 mês PRO grátis!' : `${appliedCoupon.percentOff}% de desconto aplicado`}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-gray-500 hover:text-red-500 underline ml-2 cursor-pointer"
                    >
                      remover
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-red-500 text-center mt-2">{couponError}</p>
                )}
              </div>
            </div>
          )}

          {user.plan === 'PRO' && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Plano PRO ativo</h3>
              <p className="text-gray-700 mb-4">
                Se quiser, voce pode voltar ao plano FREE a qualquer momento.
              </p>
              <button
                onClick={handleDowngradePlan}
                disabled={downgrading}
                className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
              >
                {downgrading ? 'Atualizando...' : 'Voltar ao plano FREE'}
              </button>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Privacidade</h2>
            <div className="space-y-4">
              <button
                onClick={handleDeleteAnalyses}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition cursor-pointer"
              >
                Excluir Todas as Análises
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 block cursor-pointer"
              >
                {deleting ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
