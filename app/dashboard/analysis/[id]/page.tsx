'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'
import { SubscriptionPlans } from '@/components/subscription-plans'
import { trackEvent } from '@/lib/tracking'
import { X, Lock, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Eye, Zap, Heart, Crown, ArrowLeft, Menu, LogOut, User, ChevronRight } from 'lucide-react'
import { TherapistCta } from '@/components/therapist-cta'
import { createClient } from '@/lib/supabase/client'

type AnalysisResult = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  free_teaser: any & { nome_match?: string }
  premium: (any & { nome_match?: string }) | null
  has_access: boolean
}

// Modelo B2B: Leads não têm créditos - todos têm acesso completo

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
  const supabase = createClient()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
    
    async function loadUserData() {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUserData({
          id: data.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          therapist: data.therapist || null,
        })
      }
    }
    
    loadAnalysis()
    loadUserData()
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px] animate-pulse" />
        </div>
        
        <nav className="relative z-40 bg-white/70 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
          <div className="container mx-auto px-4 py-4 sm:py-5">
            <div className="h-10 bg-purple-100/50 rounded-xl w-40 animate-pulse" />
          </div>
        </nav>
        
        <div className="relative z-10 container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
          <div className="h-6 bg-purple-100/50 rounded-xl w-40 mb-6 animate-pulse" />
          <div className="h-10 bg-purple-100/50 rounded-xl w-72 mb-8 animate-pulse" />
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-purple-100 p-7 rounded-3xl shadow-lg animate-pulse">
                <div className="h-6 bg-purple-100/50 rounded-lg w-48 mb-4" />
                <div className="h-20 bg-purple-50 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px]" />
        </div>
        <div className="relative text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-purple-100 shadow-xl max-w-md">
          <div className="text-lg text-gray-600 mb-4">Análise não encontrada</div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { free_teaser, premium, has_access } = analysis

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-orange-200/30 rounded-full blur-[80px]" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <nav className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Logo size="lg" />
                </div>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex gap-6 items-center">
              <Link
                href="/account"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
              >
                Minha Conta
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-purple-100 p-6 shadow-2xl animate-slide-in-right">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mt-16 space-y-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-4 px-4 rounded-xl transition-all group"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Minha Conta</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-4 px-4 rounded-xl transition-all w-full group"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3 transition-all animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para análises</span>
        </Link>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900 tracking-tight animate-fade-in-up animation-delay-100">
          {analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? <>Análise de <span className="text-gradient-primary">{analysis.premium?.nome_match || analysis.free_teaser?.nome_match}</span></>
            : 'Resultado da Análise'}
        </h1>

        {/* Unlock Banner */}
        {!has_access && (
          <div className="mb-8 sm:mb-10 animate-fade-in-up animation-delay-200">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold">Desbloqueie a análise completa</h2>
                </div>
                <p className="text-white/90 text-sm sm:text-base mb-6">
                  Veja as hipóteses alternativas, o mapa de risco e o plano de ação.
                </p>
                
                {/* Modelo B2B: Este bloco não será exibido pois has_access é sempre true */}
                <button
                  onClick={handleUnlockWithCredit}
                  disabled={unlocking}
                  className="w-full bg-white text-purple-700 hover:bg-gray-100 font-bold py-4 text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  {unlocking ? 'Processando...' : 'Desbloquear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Free Teaser Content */}
        {!has_access && (
          <div className="space-y-5 sm:space-y-6 mb-8">
            {/* Headline */}
            {free_teaser.headline && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-6 sm:p-8 rounded-3xl shadow-2xl text-center"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                />
                
                <motion.h2 
                  className="font-display text-xl sm:text-2xl md:text-3xl font-bold relative z-10 leading-tight"
                >
                  {free_teaser.headline}
                </motion.h2>
                
                {free_teaser.headline.includes('💚') && (
                  <>
                    <motion.div
                      className="absolute top-3 left-4"
                      animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Heart className="w-4 h-4 text-pink-300" />
                    </motion.div>
                    <motion.div
                      className="absolute top-4 right-8"
                      animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    </motion.div>
                  </>
                )}
                
                {(free_teaser.headline.includes('⚠️') || free_teaser.headline.includes('🚨')) && (
                  <motion.div
                    className="absolute top-3 right-4"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <AlertTriangle className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Hipótese Principal */}
              {free_teaser.hypothesis_1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border-2 border-blue-200 shadow-lg h-full"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl border border-blue-200">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-display text-base font-bold text-gray-900">Hipótese Principal</h3>
                  </div>
                  <h4 className="font-display text-lg font-bold text-gray-900 mb-3">
                    {getHypothesisTitle(free_teaser.hypothesis_1)}
                  </h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-xs font-semibold text-blue-800 border border-blue-200 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    {free_teaser.hypothesis_1.confidence === 'HIGH' ? 'Alta confiança' : 
                     free_teaser.hypothesis_1.confidence === 'MEDIUM' ? 'Média confiança' : 'Baixa confiança'}
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Análise completa no premium
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Score de Risco */}
              {free_teaser.ONE_risk_score && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border-2 border-orange-200 shadow-lg h-full"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 bg-orange-100 rounded-xl border border-orange-200">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-display text-base font-bold text-gray-900">Risco Detectado</h3>
                  </div>
                  <div className="text-center mb-4">
                    <motion.div 
                      className={`font-display text-4xl sm:text-5xl font-bold mb-2 ${
                        free_teaser.ONE_risk_score.value > 60 ? 'text-red-600' : 
                        free_teaser.ONE_risk_score.value > 40 ? 'text-orange-600' : 'text-yellow-600'
                      }`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {free_teaser.ONE_risk_score.value}%
                    </motion.div>
                    <p className="text-sm font-semibold text-gray-700">
                      {free_teaser.ONE_risk_score.label}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        free_teaser.ONE_risk_score.value > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        free_teaser.ONE_risk_score.value > 50 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${free_teaser.ONE_risk_score.value}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    />
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Mapa completo no premium
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Flags */}
            {(free_teaser.red_flag || free_teaser.green_flag) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className={`bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border-2 shadow-lg ${
                  free_teaser.red_flag 
                    ? 'border-red-200'
                    : 'border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {free_teaser.red_flag ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="p-2 bg-red-100 rounded-xl border border-red-200 flex-shrink-0"
                    >
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="p-2 bg-emerald-100 rounded-xl border border-emerald-200 flex-shrink-0"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </motion.div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-1">
                      {free_teaser.red_flag?.title || free_teaser.green_flag?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {free_teaser.red_flag?.impact || free_teaser.green_flag?.benefit}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Todos os flags disponíveis no premium
                  </p>
                </div>
              </motion.div>
            )}

            {/* Próximos Passos */}
            {free_teaser.observe_48h && free_teaser.observe_48h.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border-2 border-yellow-200 shadow-lg"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-xl border border-yellow-200">
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-display text-base font-bold text-gray-900">Próximos Passos</h3>
                </div>
                <div className="space-y-2 mb-4">
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Checklist completo no premium
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Premium Content */}
        {has_access && premium && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in-up">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900">Sua Análise Completa</h2>

            {/* Executive Summary */}
            {premium.executive_summary && premium.executive_summary.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 p-5 sm:p-6 rounded-3xl shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📋 Resumo da Situação
                </h3>
                <ul className="space-y-3">
                  {premium.executive_summary.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base">
                      <span className="text-base">{item.startsWith('✅') || item.startsWith('⚠️') || item.startsWith('🚨') || item.startsWith('🚩') || item.startsWith('💚') ? '' : '•'}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mapa de Risco */}
            {premium.full_risk_map && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 p-5 sm:p-6 rounded-3xl shadow-lg">
                <h3 className="font-display text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
                  🎯 Mapa de Risco
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Risco de Ghosting */}
                  <div className={`p-5 rounded-2xl border ${
                    premium.full_risk_map.risco_ghosting > 60 
                      ? 'bg-red-50 border-red-200' 
                      : premium.full_risk_map.risco_ghosting > 40 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-800 text-sm">Risco de Ghosting</span>
                      <span className={`text-2xl font-bold ${
                        premium.full_risk_map.risco_ghosting > 60 ? 'text-red-600' : 
                        premium.full_risk_map.risco_ghosting > 40 ? 'text-yellow-600' : 'text-emerald-600'
                      }`}>
                        {premium.full_risk_map.risco_ghosting}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-full rounded-full transition-all ${
                          premium.full_risk_map.risco_ghosting > 60 ? 'bg-red-500' :
                          premium.full_risk_map.risco_ghosting > 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_ghosting}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {premium.full_risk_map.risco_ghosting > 60 ? 'Alto risco - não invista demais' : 
                       premium.full_risk_map.risco_ghosting > 40 ? 'Risco moderado - observe' : 'Baixo risco - consistente'}
                    </p>
                  </div>

                  {/* Risco de Enrolação */}
                  <div className={`p-5 rounded-2xl border ${
                    premium.full_risk_map.risco_enrolacao > 60 
                      ? 'bg-red-50 border-red-200' 
                      : premium.full_risk_map.risco_enrolacao > 40 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-800 text-sm">Risco de Enrolação</span>
                      <span className={`text-2xl font-bold ${
                        premium.full_risk_map.risco_enrolacao > 60 ? 'text-red-600' : 
                        premium.full_risk_map.risco_enrolacao > 40 ? 'text-yellow-600' : 'text-emerald-600'
                      }`}>
                        {premium.full_risk_map.risco_enrolacao}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-full rounded-full transition-all ${
                          premium.full_risk_map.risco_enrolacao > 60 ? 'bg-red-500' :
                          premium.full_risk_map.risco_enrolacao > 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_enrolacao}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {premium.full_risk_map.risco_enrolacao > 60 ? 'Alto risco - defina prazos' : 
                       premium.full_risk_map.risco_enrolacao > 40 ? 'Risco moderado - observe' : 'Baixo risco - comprometido'}
                    </p>
                  </div>
                </div>

                {premium.full_risk_map.explanations && premium.full_risk_map.explanations.length > 0 && (
                  <div className="mt-5 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="font-semibold mb-3 text-gray-800 text-sm">O que isso significa:</p>
                    <ul className="space-y-2">
                      {premium.full_risk_map.explanations.map((exp: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
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
              <div className={`p-5 sm:p-6 rounded-3xl shadow-lg border-2 backdrop-blur-sm ${
                premium.compatibility_explained.alignment === 'ALINHADO'
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : premium.compatibility_explained.alignment === 'PARCIAL'
                    ? 'bg-yellow-50/80 border-yellow-300'
                    : 'bg-red-50/80 border-red-300'
              }`}>
                <h3 className="font-display text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  {premium.compatibility_explained.alignment === 'ALINHADO' ? '💚' : 
                   premium.compatibility_explained.alignment === 'PARCIAL' ? '⚠️' : '🚨'} Compatibilidade
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className={`text-4xl font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO' ? 'text-emerald-600' :
                    premium.compatibility_explained.alignment === 'PARCIAL' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {premium.compatibility_explained.score}%
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'bg-emerald-200 text-emerald-800'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                  }`}>
                    {premium.compatibility_explained.alignment === 'ALINHADO' ? '✓ Compatível' : 
                     premium.compatibility_explained.alignment === 'PARCIAL' ? '~ Parcial' : '✗ Incompatível'}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {premium.compatibility_explained.explanation}
                </p>
              </div>
            )}

            {/* Checklist */}
            {premium.validation_checklist && premium.validation_checklist.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 p-5 sm:p-6 rounded-3xl shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  ✅ O Que Fazer Agora
                </h3>
                <p className="text-gray-600 text-sm mb-4">Marque conforme for observando:</p>
                <ul className="space-y-3">
                  {premium.validation_checklist.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-200">
                      <input 
                        type="checkbox" 
                        className="mt-0.5 h-5 w-5 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500 flex-shrink-0" 
                      />
                      <span className="text-gray-800 leading-relaxed text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Plano por Estágio */}
            {premium.stage_plan && premium.stage_plan.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 p-5 sm:p-6 rounded-3xl shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📍 Plano para seu Momento
                </h3>
                {premium.stage_plan.map((plan: any, idx: number) => {
                  const stageLabels: Record<string, string> = {
                    'FIRST_CHAT': 'Primeira Conversa',
                    'TALKING': 'Conversando', 
                    'POST_DATE': 'Após Encontro'
                  }
                  return (
                    <div key={idx} className="space-y-4">
                      <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-800 font-semibold text-sm border border-purple-200">
                        📍 {stageLabels[plan.stage] || plan.stage}
                      </div>
                      
                      {plan.actions && plan.actions.length > 0 && (
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                          <p className="font-bold mb-3 text-gray-800 text-sm">🎯 Próximas ações:</p>
                          <ul className="space-y-2">
                            {plan.actions.map((action: string, aIdx: number) => (
                              <li key={aIdx} className="flex items-start gap-3 text-gray-700 text-sm">
                                <span className="text-purple-600 font-bold">{aIdx + 1}.</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {plan.metrics && plan.metrics.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <p className="font-bold mb-3 text-gray-800 text-sm">📊 O que observar:</p>
                          <ul className="space-y-2">
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
              <details className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl shadow-lg overflow-hidden group">
                <summary className="p-5 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-gray-900">
                      🔍 Hipóteses Detalhadas
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
                  </div>
                </summary>
                <div className="p-5 sm:p-6 pt-0 space-y-4">
                  {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3]
                    .filter(Boolean)
                    .map((hypothesis: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <span className="font-bold text-base text-gray-900">{hypothesis.title || hypothesis.key}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              hypothesis.confidence === 'HIGH'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : hypothesis.confidence === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {hypothesis.confidence === 'HIGH' ? 'Alta' : hypothesis.confidence === 'MEDIUM' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        {hypothesis.description && (
                          <p className="text-gray-700 mb-4 leading-relaxed text-sm">{hypothesis.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {hypothesis.observe_to_confirm && hypothesis.observe_to_confirm.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-gray-200">
                              <p className="font-semibold mb-2 text-emerald-700 text-xs">✓ Para confirmar:</p>
                              <ul className="space-y-1 text-gray-600">
                                {hypothesis.observe_to_confirm.slice(0, 2).map((obs: string, oIdx: number) => (
                                  <li key={oIdx} className="text-xs">• {obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {hypothesis.observe_to_refute && hypothesis.observe_to_refute.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-gray-200">
                              <p className="font-semibold mb-2 text-red-700 text-xs">✗ Para descartar:</p>
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
              <div className="mt-8">
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
          <div className="mt-10 animate-fade-in-up">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold">Desbloqueie a análise completa</h2>
                </div>
                <p className="text-white/90 text-sm sm:text-base mb-6">
                  Veja hipóteses, mapa de risco e plano de ação detalhados.
                </p>
                
                {/* Modelo B2B: Este bloco não será exibido pois has_access é sempre true */}
                <button
                  onClick={handleUnlockWithCredit}
                  disabled={unlocking}
                  className="w-full bg-white text-purple-700 hover:bg-gray-100 font-bold py-4 text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  {unlocking ? 'Processando...' : 'Desbloquear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Unlock */}
        {showUnlockModal && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg animate-fade-in-up">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-purple-100">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 mb-4 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                    Desbloqueie a Análise Completa
                  </h3>
                  <p className="text-gray-600">
                    Veja insights que vão te ajudar a decidir melhor
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: Sparkles, color: 'purple', title: 'Hipóteses Completas', desc: 'Com validação detalhada' },
                    { icon: TrendingUp, color: 'orange', title: 'Mapa de Risco', desc: 'Scores explicados' },
                    { icon: Shield, color: 'blue', title: 'Checklist', desc: 'Plano de ação' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl border ${
                      item.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                      item.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`p-2 rounded-xl ${
                        item.color === 'purple' ? 'bg-purple-100' :
                        item.color === 'orange' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <item.icon className={`w-4 h-4 ${
                          item.color === 'purple' ? 'text-purple-600' :
                          item.color === 'orange' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modelo B2B: Este modal não será exibido pois has_access é sempre true */}
                <button
                  onClick={handleUnlockWithCredit}
                  disabled={unlocking}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all mb-3 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {unlocking ? 'Processando...' : 'Desbloquear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Subscription Plans */}
        {showSubscriptionPlans && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl animate-fade-in-up">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-h-[90vh] overflow-y-auto border border-purple-100">
                <button
                  onClick={() => setShowSubscriptionPlans(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <SubscriptionPlans
                  onSelect={handleSubscribe}
                  loading={unlocking}
                  prices={subscriptionPrices}
                />

                <div className="mt-6 text-center text-sm text-gray-600">
                  ✨ Análises ilimitadas • 🎯 Relatórios completos • 🔄 Cancele quando quiser
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        
        .font-display {
          font-family: var(--font-playfair), Georgia, serif;
        }
      `}</style>
    </div>
  )
}
