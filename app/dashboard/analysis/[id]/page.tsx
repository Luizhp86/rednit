'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionPlans } from '@/components/subscription-plans'
import { trackEvent } from '@/lib/tracking'
import { X, Lock, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Eye, Zap, Heart, Crown, ArrowLeft } from 'lucide-react'
import { TherapistCta } from '@/components/therapist-cta'

type AnalysisResult = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  free_teaser: any & { nome_match?: string }
  premium: (any & { nome_match?: string }) | null
  has_access: boolean
}

type UserCredits = {
  creditsPaid: number
}

type UserData = {
  id: string
  email: string
  name: string | null
  phone: string | null
  therapist?: {
    id: string
    name: string
    whatsapp: string | null
  } | null
}

export default function AnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false)
  const [subscriptionPrices, setSubscriptionPrices] = useState({
    monthly: 2990,
    quarterly: 7990,
    yearly: 29900,
  })

  const hypothesisLabels: Record<string, string> = {
    EXPLORANDO: 'Explorando possibilidades',
    BUSCA_FIXO: 'Busca relacionamento sério',
    CARENCIA_VALIDACAO: 'Carência por validação',
    RECEM_SAIU_RELACAO: 'Recém saiu de um relacionamento',
    SEM_DISPONIBILIDADE_REAL: 'Sem disponibilidade real',
  }

  const getHypothesisTitle = (hypothesis: any) => {
    if (!hypothesis) return ''
    if (hypothesis.title) return hypothesis.title
    if (hypothesis.key && hypothesisLabels[hypothesis.key]) return hypothesisLabels[hypothesis.key]
    if (hypothesis.key) return hypothesis.key.replace(/_/g, ' ')
    return ''
  }

  useEffect(() => {
    async function loadAnalysis() {
      const res = await fetch(`/api/analyses/${id}`)
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data)
        trackEvent('ANALYSIS_VIEWED', {
          analysisId: id,
          hasAccess: data.has_access,
          isPaid: data.isPaid,
          stage: data.stage,
        })
      }
      setLoading(false)
    }
    
    async function loadUserCredits() {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUserCredits({ creditsPaid: data.creditsPaid || 0 })
        setUserData({
          id: data.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          therapist: data.therapist || null,
        })
        
        if (data.prices?.subscription) {
          setSubscriptionPrices({
            monthly: data.prices.subscription.monthly,
            quarterly: data.prices.subscription.quarterly,
            yearly: data.prices.subscription.yearly,
          })
        }
      }
    }
    
    loadAnalysis()
    loadUserCredits()
  }, [id])

  const handleUnlockWithCredit = async () => {
    setUnlocking(true)
    trackEvent('UNLOCK_WITH_CREDIT_STARTED', { analysisId: id })
    
    try {
      const res = await fetch(`/api/analyses/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const error = await res.json()
        trackEvent('UNLOCK_WITH_CREDIT_FAILED', { analysisId: id, error: error.error })
        alert(error.error || 'Erro ao desbloquear análise')
        return
      }

      trackEvent('UNLOCK_WITH_CREDIT_SUCCESS', { analysisId: id })
      alert('Análise desbloqueada com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      trackEvent('UNLOCK_WITH_CREDIT_FAILED', { analysisId: id, error: 'unknown' })
      alert('Erro ao desbloquear análise')
    } finally {
      setUnlocking(false)
    }
  }

  const handleSubscribe = async (period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY', couponCode?: string) => {
    setUnlocking(true)
    trackEvent('CHECKOUT_STARTED', { type: 'SUBSCRIPTION', period, coupon: couponCode })
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'SUBSCRIPTION',
          subscriptionPeriod: period,
          couponCode,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        trackEvent('CHECKOUT_FAILED', { type: 'SUBSCRIPTION', period, error: error.error })
        alert(error.error || 'Erro ao criar checkout')
        return
      }

      const data = await res.json()
      
      if (data.success || data.upgraded) {
        const isCoupon = !!data.couponApplied
        trackEvent('CHECKOUT_COMPLETED', { type: 'SUBSCRIPTION', period, coupon: data.couponApplied, dev: !isCoupon })
        alert(data.message || 'Plano PRO ativado!')
        window.location.reload()
        return
      }
      
      trackEvent('CHECKOUT_REDIRECT', { type: 'SUBSCRIPTION', period })
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      trackEvent('CHECKOUT_FAILED', { type: 'SUBSCRIPTION', period, error: 'unknown' })
      alert('Erro ao criar checkout')
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-purple-100/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center p-8">
          <div className="text-lg text-gray-600">Análise não encontrada</div>
          <Link href="/dashboard" className="text-purple-600 hover:underline mt-2 inline-block">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { free_teaser, premium, has_access } = analysis

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-[300px] h-[300px] bg-pink-200/20 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <nav className="relative z-40 bg-white/80 backdrop-blur-xl shadow-sm border-b border-purple-100/50 sticky top-0">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-purple-700">
                Radar Match
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Resultado da Análise
              </span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para análises</span>
        </Link>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2 sm:gap-3">
          {analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? `Análise de ${analysis.premium?.nome_match || analysis.free_teaser?.nome_match}`
            : 'Resultado da Análise'}
        </h1>

        {/* Unlock Banner */}
        {!has_access && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Lock className="w-5 h-5 sm:w-7 sm:h-7" />
                <h2 className="text-lg sm:text-2xl font-bold">Desbloqueie a análise completa</h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-6">
                Veja as hipóteses alternativas, o mapa de risco e o plano de ação.
              </p>
              
              {userCredits && userCredits.creditsPaid > 0 ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleUnlockWithCredit}
                    disabled={unlocking}
                    className="w-full bg-white text-purple-700 hover:text-purple-800 font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    {unlocking ? 'Processando...' : `Usar 1 Crédito (${userCredits.creditsPaid} disponíveis)`}
                  </Button>
                  <button
                    onClick={() => setShowSubscriptionPlans(true)}
                    className="w-full text-white/90 text-xs sm:text-sm underline hover:text-white transition-colors"
                  >
                    Ou assine PRO com análises ilimitadas
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSubscriptionPlans(true)}
                  disabled={unlocking}
                  className="w-full bg-white text-purple-700 hover:text-purple-800 font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  {unlocking ? 'Processando...' : 'Assinar PRO'}
                </Button>
              )}
              
              <p className="text-[10px] sm:text-xs text-white/80 mt-3 text-center">
                A partir de R$ {(subscriptionPrices.monthly / 100).toFixed(2).replace('.', ',')}/mês • Pix e cartão
              </p>
            </div>
          </div>
        )}

        {/* Free Teaser Content */}
        {!has_access && (
          <div className="space-y-4 sm:space-y-6 mb-6">
            {/* Headline */}
            {free_teaser.headline && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl text-center"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
                
                <motion.h2 
                  className="text-xl sm:text-2xl md:text-3xl font-bold relative z-10 leading-tight"
                >
                  {free_teaser.headline}
                </motion.h2>
                
                {free_teaser.headline.includes('💚') && (
                  <>
                    <motion.div
                      className="absolute top-2 left-2 sm:left-4"
                      animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300" />
                    </motion.div>
                    <motion.div
                      className="absolute top-3 sm:top-4 right-4 sm:right-8"
                      animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    >
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                    </motion.div>
                  </>
                )}
                
                {(free_teaser.headline.includes('⚠️') || free_teaser.headline.includes('🚨')) && (
                  <motion.div
                    className="absolute top-2 sm:top-3 right-2 sm:right-4"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Hipótese Principal */}
              {free_teaser.hypothesis_1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </motion.div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">Hipótese Principal</h3>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {getHypothesisTitle(free_teaser.hypothesis_1)}
                    </h4>
                    <motion.div 
                      className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-blue-200/50 text-xs sm:text-sm font-semibold text-blue-800 mb-3"
                    >
                      <motion.span 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      {free_teaser.hypothesis_1.confidence === 'HIGH' ? 'Alta confiança' : 
                       free_teaser.hypothesis_1.confidence === 'MEDIUM' ? 'Média confiança' : 'Baixa confiança'}
                    </motion.div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200">
                      <p className="text-[10px] sm:text-xs text-gray-700 font-semibold flex items-center">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                        Análise completa no premium
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Score de Risco */}
              {free_teaser.ONE_risk_score && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg h-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </motion.div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">Risco Detectado</h3>
                    </div>
                    <div className="text-center mb-3 sm:mb-4">
                      <motion.div 
                        className={`text-4xl sm:text-5xl font-bold mb-1 sm:mb-2 ${
                          free_teaser.ONE_risk_score.value > 60 ? 'text-red-600' : 
                          free_teaser.ONE_risk_score.value > 40 ? 'text-orange-600' : 'text-yellow-600'
                        }`}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {free_teaser.ONE_risk_score.value}%
                      </motion.div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">
                        {free_teaser.ONE_risk_score.label}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-3 sm:mb-4 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          free_teaser.ONE_risk_score.value > 70
                            ? 'bg-red-600'
                            : free_teaser.ONE_risk_score.value > 50
                              ? 'bg-orange-600'
                              : 'bg-yellow-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${free_teaser.ONE_risk_score.value}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      />
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200">
                      <p className="text-[10px] sm:text-xs text-gray-700 font-semibold flex items-center">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                        Mapa completo no premium
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Flags */}
            {(free_teaser.red_flag || free_teaser.green_flag) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 shadow-lg ${
                  free_teaser.red_flag 
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
                    : 'border-green-200 bg-gradient-to-br from-green-50 to-green-100'
                }`}>
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {free_teaser.red_flag ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex-shrink-0"
                      >
                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </motion.div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1">
                        {free_teaser.red_flag?.title || free_teaser.green_flag?.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {free_teaser.red_flag?.impact || free_teaser.green_flag?.benefit}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200">
                    <p className="text-[10px] sm:text-xs text-gray-700 font-semibold flex items-center">
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Todos os flags disponíveis no premium
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Próximos Passos */}
            {free_teaser.observe_48h && free_teaser.observe_48h.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    </motion.div>
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900">Próximos Passos</h3>
                  </div>
                  <div className="space-y-2 mb-3 sm:mb-4">
                    {free_teaser.observe_48h.slice(0, 1).map((obs: string, idx: number) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + idx * 0.2 }}
                      >
                        <span className="text-yellow-600 mt-1 font-bold">•</span>
                        <p className="text-gray-700 text-sm sm:text-base flex-1">{obs}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200">
                    <p className="text-[10px] sm:text-xs text-gray-700 font-semibold flex items-center">
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Checklist completo no premium
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {/* Premium Content */}
        {has_access && premium && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Sua Análise Completa</h2>

            {/* Executive Summary */}
            {premium.executive_summary && premium.executive_summary.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                  📋 Resumo da Situação
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {premium.executive_summary.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                      <span className="text-base sm:text-lg">{item.startsWith('✅') || item.startsWith('⚠️') || item.startsWith('🚨') || item.startsWith('🚩') || item.startsWith('💚') ? '' : '•'}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mapa de Risco */}
            {premium.full_risk_map && (
              <div className="bg-white border-2 border-orange-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center gap-2">
                  🎯 Mapa de Risco
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Risco de Ghosting */}
                  <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${
                    premium.full_risk_map.risco_ghosting > 60 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : premium.full_risk_map.risco_ghosting > 40 
                        ? 'bg-yellow-50 border-2 border-yellow-200' 
                        : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">Risco de Ghosting</span>
                      <span className={`text-2xl sm:text-3xl font-bold ${
                        premium.full_risk_map.risco_ghosting > 60 
                          ? 'text-red-600' 
                          : premium.full_risk_map.risco_ghosting > 40 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {premium.full_risk_map.risco_ghosting}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                      <div
                        className={`h-full rounded-full transition-all ${
                          premium.full_risk_map.risco_ghosting > 60
                            ? 'bg-red-500'
                            : premium.full_risk_map.risco_ghosting > 40
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_ghosting}%` }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      {premium.full_risk_map.risco_ghosting > 60 
                        ? 'Alto risco - não invista demais' 
                        : premium.full_risk_map.risco_ghosting > 40 
                          ? 'Risco moderado - observe' 
                          : 'Baixo risco - consistente'}
                    </p>
                  </div>

                  {/* Risco de Enrolação */}
                  <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${
                    premium.full_risk_map.risco_enrolacao > 60 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : premium.full_risk_map.risco_enrolacao > 40 
                        ? 'bg-yellow-50 border-2 border-yellow-200' 
                        : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">Risco de Enrolação</span>
                      <span className={`text-2xl sm:text-3xl font-bold ${
                        premium.full_risk_map.risco_enrolacao > 60 
                          ? 'text-red-600' 
                          : premium.full_risk_map.risco_enrolacao > 40 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {premium.full_risk_map.risco_enrolacao}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                      <div
                        className={`h-full rounded-full transition-all ${
                          premium.full_risk_map.risco_enrolacao > 60
                            ? 'bg-red-500'
                            : premium.full_risk_map.risco_enrolacao > 40
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_enrolacao}%` }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      {premium.full_risk_map.risco_enrolacao > 60 
                        ? 'Alto risco - defina prazos' 
                        : premium.full_risk_map.risco_enrolacao > 40 
                          ? 'Risco moderado - observe' 
                          : 'Baixo risco - comprometido'}
                    </p>
                  </div>
                </div>

                {premium.full_risk_map.explanations && premium.full_risk_map.explanations.length > 0 && (
                  <div className="mt-4 sm:mt-6 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="font-semibold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base">O que isso significa:</p>
                    <ul className="space-y-1 sm:space-y-2">
                      {premium.full_risk_map.explanations.map((exp: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-xs sm:text-sm">
                          <span className="mt-0.5">→</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Compatibilidade */}
            {premium.compatibility_explained && (
              <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border-2 ${
                premium.compatibility_explained.alignment === 'ALINHADO'
                  ? 'bg-green-50 border-green-300'
                  : premium.compatibility_explained.alignment === 'PARCIAL'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-red-50 border-red-300'
              }`}>
                <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                  {premium.compatibility_explained.alignment === 'ALINHADO' 
                    ? '💚' 
                    : premium.compatibility_explained.alignment === 'PARCIAL' 
                      ? '⚠️' 
                      : '🚨'} Compatibilidade
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <span className={`text-3xl sm:text-4xl font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'text-green-600'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {premium.compatibility_explained.score}%
                  </span>
                  <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'bg-green-200 text-green-800'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                  }`}>
                    {premium.compatibility_explained.alignment === 'ALINHADO' 
                      ? '✓ Compatível' 
                      : premium.compatibility_explained.alignment === 'PARCIAL' 
                        ? '~ Parcial' 
                        : '✗ Incompatível'}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {premium.compatibility_explained.explanation}
                </p>
              </div>
            )}

            {/* Checklist */}
            {premium.validation_checklist && premium.validation_checklist.length > 0 && (
              <div className="bg-white border-2 border-blue-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                  ✅ O Que Fazer Agora
                </h3>
                <p className="text-gray-600 text-sm mb-3 sm:mb-4">Marque conforme for observando:</p>
                <ul className="space-y-2 sm:space-y-3">
                  {premium.validation_checklist.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-colors">
                      <input 
                        type="checkbox" 
                        className="mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500 flex-shrink-0" 
                      />
                      <span className="text-gray-800 leading-relaxed text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Plano por Estágio */}
            {premium.stage_plan && premium.stage_plan.length > 0 && (
              <div className="bg-white border-2 border-purple-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                  📍 Plano para seu Momento
                </h3>
                {premium.stage_plan.map((plan: any, idx: number) => {
                  const stageLabels: Record<string, string> = {
                    'FIRST_CHAT': 'Primeira Conversa',
                    'TALKING': 'Conversando', 
                    'POST_DATE': 'Após Encontro'
                  }
                  return (
                    <div key={idx} className="space-y-3 sm:space-y-4">
                      <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 rounded-full text-purple-800 font-semibold text-sm sm:text-base">
                        📍 {stageLabels[plan.stage] || plan.stage}
                      </div>
                      
                      {plan.actions && plan.actions.length > 0 && (
                        <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                          <p className="font-bold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base">🎯 Próximas ações:</p>
                          <ul className="space-y-1 sm:space-y-2">
                            {plan.actions.map((action: string, aIdx: number) => (
                              <li key={aIdx} className="flex items-start gap-2 sm:gap-3 text-gray-700 text-sm">
                                <span className="text-purple-600 font-bold">{aIdx + 1}.</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {plan.metrics && plan.metrics.length > 0 && (
                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                          <p className="font-bold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base">📊 O que observar:</p>
                          <ul className="space-y-1 sm:space-y-2">
                            {plan.metrics.map((metric: string, mIdx: number) => (
                              <li key={mIdx} className="flex items-start gap-2 text-gray-700 text-sm">
                                <span>•</span>
                                <span>{metric}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Hipóteses Detalhadas */}
            {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3].filter(Boolean).length > 0 && (
              <details className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <summary className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-base sm:text-xl font-bold text-gray-900">
                    🔍 Hipóteses Detalhadas
                  </span>
                  <span className="text-gray-500 ml-2 text-xs sm:text-sm">(toque para expandir)</span>
                </summary>
                <div className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3]
                    .filter(Boolean)
                    .map((hypothesis: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="text-xl sm:text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <span className="font-bold text-sm sm:text-base text-gray-900">{hypothesis.title || hypothesis.key}</span>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                              hypothesis.confidence === 'HIGH'
                                ? 'bg-green-100 text-green-800'
                                : hypothesis.confidence === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {hypothesis.confidence === 'HIGH' ? 'Alta' : hypothesis.confidence === 'MEDIUM' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        {hypothesis.description && (
                          <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm">{hypothesis.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          {hypothesis.observe_to_confirm && hypothesis.observe_to_confirm.length > 0 && (
                            <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                              <p className="font-semibold mb-1.5 sm:mb-2 text-green-700">✓ Para confirmar:</p>
                              <ul className="space-y-1 text-gray-600">
                                {hypothesis.observe_to_confirm.slice(0, 2).map((obs: string, oIdx: number) => (
                                  <li key={oIdx} className="text-xs">• {obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {hypothesis.observe_to_refute && hypothesis.observe_to_refute.length > 0 && (
                            <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                              <p className="font-semibold mb-1.5 sm:mb-2 text-red-700">✗ Para descartar:</p>
                              <ul className="space-y-1 text-gray-600">
                                {hypothesis.observe_to_refute.slice(0, 2).map((obs: string, oIdx: number) => (
                                  <li key={oIdx} className="text-xs">• {obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}

            {/* CTA Terapeuta */}
            {userData && (
              <div className="mt-6 sm:mt-8">
                <TherapistCta
                  userId={userData.id}
                  userName={userData.name || undefined}
                  userEmail={userData.email}
                  userPhone={userData.phone}
                  analysisId={id}
                  matchName={premium?.nome_match || free_teaser?.nome_match}
                  hasRedFlags={premium?.red_flags?.length > 0 || free_teaser?.red_flag}
                  onPhoneUpdated={(phone) => setUserData(prev => prev ? { ...prev, phone } : null)}
                  therapist={userData.therapist}
                />
              </div>
            )}
          </div>
        )}

        {/* Final Unlock CTA */}
        {!has_access && (
          <div className="mt-8 sm:mt-10">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Lock className="w-5 h-5 sm:w-7 sm:h-7" />
                <h2 className="text-lg sm:text-2xl font-bold">Desbloqueie a análise completa</h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-6">
                Veja hipóteses, mapa de risco e plano de ação detalhados.
              </p>
              
              {userCredits && userCredits.creditsPaid > 0 ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleUnlockWithCredit}
                    disabled={unlocking}
                    className="w-full bg-white text-purple-700 hover:text-purple-800 font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    {unlocking ? 'Processando...' : `Usar 1 Crédito (${userCredits.creditsPaid} disponíveis)`}
                  </Button>
                  <button
                    onClick={() => setShowSubscriptionPlans(true)}
                    className="w-full text-white/90 text-xs sm:text-sm underline hover:text-white transition-colors"
                  >
                    Ou assine PRO com análises ilimitadas
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSubscriptionPlans(true)}
                  disabled={unlocking}
                  className="w-full bg-white text-purple-700 hover:text-purple-800 font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  {unlocking ? 'Processando...' : 'Assinar PRO'}
                </Button>
              )}
              
              <p className="text-[10px] sm:text-xs text-white/80 mt-3 text-center">
                A partir de R$ {(subscriptionPrices.monthly / 100).toFixed(2).replace('.', ',')}/mês • Pix e cartão
              </p>
            </div>
          </div>
        )}

        {/* Modal Unlock */}
        {showUnlockModal && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-3 sm:mb-4">
                  <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Desbloqueie a Análise Completa
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Veja insights que vão te ajudar a decidir melhor
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {[
                  { icon: Sparkles, color: 'purple', title: 'Hipóteses Completas', desc: 'Com validação detalhada' },
                  { icon: TrendingUp, color: 'orange', title: 'Mapa de Risco', desc: 'Scores explicados' },
                  { icon: Shield, color: 'blue', title: 'Checklist', desc: 'Plano de ação' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-${item.color}-50`}>
                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${item.color}-600 mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {userCredits && userCredits.creditsPaid > 0 ? (
                <Button
                  onClick={handleUnlockWithCredit}
                  disabled={unlocking}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {unlocking ? 'Processando...' : `Usar 1 Crédito (${userCredits.creditsPaid})`}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowUnlockModal(false)
                    setShowSubscriptionPlans(true)
                  }}
                  disabled={unlocking}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  {unlocking ? 'Processando...' : `Assinar PRO`}
                </Button>
              )}

              <p className="text-center text-[10px] sm:text-xs text-gray-500">
                💳 Pix e cartão • ⚡ Acesso imediato • 🔄 Cancele quando quiser
              </p>
            </div>
          </div>
        )}

        {/* Modal Subscription Plans */}
        {showSubscriptionPlans && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowSubscriptionPlans(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <SubscriptionPlans
                onSelect={handleSubscribe}
                loading={unlocking}
                prices={subscriptionPrices}
              />

              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
                ✨ Análises ilimitadas • 🎯 Relatórios completos • 🔄 Cancele quando quiser
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
