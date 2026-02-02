'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'
import { SubscriptionPlans } from '@/components/subscription-plans'
import { trackEvent } from '@/lib/tracking'
import { X, Lock, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Eye, Zap, Heart, Crown, ArrowLeft, Menu, LogOut, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { PageLoader } from '@/components/page-loader'
import { TherapistCta } from '@/components/therapist-cta'
import { createClient } from '@/lib/supabase/client'

type AnalysisResult = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  nome_match?: string // Nome do match no nível raiz
  free_teaser: any & { nome_match?: string }
  premium: (any & { nome_match?: string; encouragement_message?: string; next_actions?: string[] }) | null
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
  const [navigating, setNavigating] = useState(false)
  const [subscriptionPrices, setSubscriptionPrices] = useState({
    monthly: 2990,
    quarterly: 7990,
    yearly: 29900,
  })
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [carouselDirection, setCarouselDirection] = useState(0)
  const [autoAdvancePaused, setAutoAdvancePaused] = useState(false)

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

  function getCarouselSlideCount(p: typeof premium, u: UserData | null): number {
    if (!p) return 0
    let n = 0
    if (p.executive_summary?.length) n++
    if (p.full_risk_map) n++
    if (p.compatibility_explained) n++
    if (p.validation_checklist?.length) n++
    if (p.stage_plan?.length) n++
    if ([p.hypothesis_1, p.hypothesis_2, p.hypothesis_3].filter(Boolean).length > 0) n++
    if (u) n++
    return n
  }

  useEffect(() => {
    if (!analysis?.has_access || !analysis?.premium || autoAdvancePaused) return
    const total = getCarouselSlideCount(analysis.premium, userData)
    if (total <= 1) return
    
    // Calcular as keys dos slides para verificar se está no slide do terapeuta
    const slideKeys = [
      analysis.premium.executive_summary?.length && 'executive_summary',
      analysis.premium.full_risk_map && 'risk_map',
      analysis.premium.compatibility_explained && 'compatibility',
      analysis.premium.validation_checklist?.length && 'checklist',
      analysis.premium.stage_plan?.length && 'stage_plan',
      [analysis.premium.hypothesis_1, analysis.premium.hypothesis_2, analysis.premium.hypothesis_3].filter(Boolean).length > 0 && 'hypotheses',
      userData && 'therapist',
    ].filter(Boolean) as string[]
    
    const currentKey = slideKeys[carouselIndex % slideKeys.length]
    
    // Parar o auto-advance quando chegar no slide do terapeuta
    if (currentKey === 'therapist') {
      return
    }
    
    const t = setInterval(() => {
      setCarouselDirection(1)
      setCarouselIndex((i) => (i + 1) % total)
    }, 9000)
    return () => clearInterval(t)
  }, [analysis, autoAdvancePaused, userData, carouselIndex])

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

  if (navigating) {
    return <PageLoader message="Voltando para análises..." />
  }

  // Usa a mesma mensagem do formulário para transição suave
  if (loading) {
    return <PageLoader message="Analisando sua relação..." />
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
        <button
          onClick={() => {
            setNavigating(true)
            router.push('/dashboard')
          }}
          className="inline-flex items-center gap-2.5 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3 transition-all animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para análises</span>
        </button>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900 tracking-tight animate-fade-in-up animation-delay-100">
          {analysis.nome_match || analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? <>Análise de <span className="text-gradient-primary">{analysis.nome_match || analysis.premium?.nome_match || analysis.free_teaser?.nome_match}</span></>
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

        {/* Premium Content - Carrossel */}
        {has_access && premium && (() => {
          const slideKeys = [
            premium.executive_summary?.length && 'executive_summary',
            premium.full_risk_map && 'risk_map',
            premium.compatibility_explained && 'compatibility',
            premium.validation_checklist?.length && 'checklist',
            premium.stage_plan?.length && 'stage_plan',
            [premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3].filter(Boolean).length > 0 && 'hypotheses',
            userData && 'therapist',
          ].filter(Boolean) as string[]
          const currentKey = slideKeys.length ? slideKeys[carouselIndex % slideKeys.length] : ''
          return (
            <div className="animate-fade-in-up">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-6">Sua Análise Completa</h2>
              <div className="relative" onMouseEnter={() => setAutoAdvancePaused(true)} onMouseLeave={() => setAutoAdvancePaused(false)}>
                <div className="h-[520px] overflow-hidden rounded-3xl flex flex-col">
                  <AnimatePresence mode="wait" initial={false} custom={carouselDirection}>
                    <motion.div
                      key={currentKey}
                      custom={carouselDirection}
                      variants={{
                        enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full overflow-y-auto"
                    >
                      {currentKey === 'executive_summary' && (
                        <div className="h-full min-h-[480px] flex flex-col">
                          <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-gray-950 p-0 shadow-2xl flex-1 flex flex-col">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/60 via-gray-950 to-gray-950 pointer-events-none" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-purple-500/30 via-pink-500/20 to-transparent blur-3xl pointer-events-none" />
                            <motion.div 
                              className="absolute top-20 right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            />
                            <motion.div 
                              className="absolute bottom-32 left-10 w-24 h-24 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                            />

                            {/* Header */}
                            <div className="relative px-6 sm:px-8 pt-6 sm:pt-8">
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 mb-3"
                              >
                                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                  Análise Personalizada
                                </span>
                                <motion.span 
                                  className="w-2 h-2 rounded-full bg-emerald-500"
                                  animate={{ opacity: [1, 0.4, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                              </motion.div>
                              <motion.h3 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="font-display text-2xl sm:text-3xl font-bold text-white mb-2"
                              >
                                Descobrimos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">{slideKeys.length - 1} insights</span> sobre
                              </motion.h3>
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 text-base"
                              >
                                seu relacionamento com <span className="text-white font-semibold">{analysis.nome_match || premium?.nome_match || 'seu match'}</span>
                              </motion.p>
                            </div>

                            {/* Preview Cards - Teaser */}
                            <div className="relative flex-1 px-6 sm:px-8 py-6">
                              <div className="grid grid-cols-3 gap-3">
                                {/* Risk Preview */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4"
                                >
                                  <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risco</p>
                                  <p className="text-2xl font-bold text-white tabular-nums">
                                    {premium?.full_risk_map?.risco_ghosting ?? '—'}
                                    <span className="text-sm text-gray-500">%</span>
                                  </p>
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
                                  <p className="absolute bottom-2 left-4 text-[10px] text-gray-600">Deslize para ver</p>
                                </motion.div>

                                {/* Compatibility Preview */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.6 }}
                                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-4"
                                >
                                  <Heart className="w-5 h-5 text-emerald-400 mb-2" />
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Match</p>
                                  <p className="text-2xl font-bold text-white tabular-nums">
                                    {premium?.compatibility_explained?.score ?? '—'}
                                    <span className="text-sm text-gray-500">%</span>
                                  </p>
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
                                  <p className="absolute bottom-2 left-4 text-[10px] text-gray-600">Deslize para ver</p>
                                </motion.div>

                                {/* Actions Preview */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.7 }}
                                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4"
                                >
                                  <Zap className="w-5 h-5 text-purple-400 mb-2" />
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ações</p>
                                  <p className="text-2xl font-bold text-white tabular-nums">
                                    {premium?.validation_checklist?.length ?? '—'}
                                    <span className="text-sm text-gray-500"> itens</span>
                                  </p>
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
                                  <p className="absolute bottom-2 left-4 text-[10px] text-gray-600">Deslize para ver</p>
                                </motion.div>
                              </div>

                              {/* Blurred preview of content */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-4 relative"
                              >
                                <div className="space-y-2 blur-[6px] select-none pointer-events-none">
                                  {premium.executive_summary?.slice(0, 2).map((item: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-gray-400 text-sm bg-white/5 rounded-xl p-3">
                                      <span className="text-purple-400 mt-0.5">•</span>
                                      <span className="line-clamp-1">{item}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                                    + {(premium.executive_summary?.length || 0)} pontos para explorar
                                  </span>
                                </div>
                              </motion.div>
                            </div>

                            {/* Footer CTA */}
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.9 }}
                              className="relative px-6 sm:px-8 pb-6 sm:pb-8"
                            >
                              <button
                                type="button"
                                onClick={() => { setCarouselDirection(1); setCarouselIndex(1); setAutoAdvancePaused(true); }}
                                className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-[2px] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                              >
                                <div className="relative rounded-[14px] bg-gray-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <motion.div
                                      animate={{ rotate: [0, 10, -10, 0] }}
                                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    >
                                      <Eye className="w-5 h-5 text-purple-400" />
                                    </motion.div>
                                    <span className="text-white font-semibold">Ver análise completa</span>
                                  </div>
                                  <motion.div
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                    className="flex items-center gap-1 text-purple-300"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                    <ChevronRight className="w-5 h-5 -ml-3 opacity-60" />
                                  </motion.div>
                                </div>
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                                  animate={{ translateX: ['−100%', '100%'] }}
                                  transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
                                />
                              </button>
                              <p className="text-center text-gray-600 text-xs mt-3">
                                Ou aguarde — o próximo slide carrega automaticamente
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {currentKey === 'risk_map' && premium.full_risk_map && (
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

                      {currentKey === 'compatibility' && premium.compatibility_explained && (
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

                      {currentKey === 'checklist' && premium.validation_checklist && premium.validation_checklist.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 p-4 sm:p-5 rounded-3xl shadow-lg h-full flex flex-col">
                <h3 className="font-display text-lg font-bold mb-2 text-gray-900 flex items-center gap-2">
                  ✅ O Que Fazer Agora
                </h3>
                <p className="text-gray-600 text-xs mb-3">Marque conforme for observando:</p>
                <ul className="space-y-2 flex-1">
                  {premium.validation_checklist.slice(0, 6).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
                      <input 
                        type="checkbox" 
                        className="mt-0.5 h-4 w-4 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500 flex-shrink-0" 
                      />
                      <span className="text-gray-800 leading-snug text-xs sm:text-sm line-clamp-2">{item}</span>
                    </li>
                  ))}
                </ul>
                {premium.validation_checklist.length > 6 && (
                  <p className="text-blue-600 text-xs mt-2 text-center font-medium">
                    +{premium.validation_checklist.length - 6} itens adicionais
                  </p>
                )}
              </div>
                      )}

                      {currentKey === 'stage_plan' && premium.stage_plan && premium.stage_plan.length > 0 && (
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

                      {currentKey === 'hypotheses' && [premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3].filter(Boolean).length > 0 && (
              <details className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl shadow-lg overflow-hidden group" open>
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

                      {currentKey === 'therapist' && userData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-400/70 bg-gradient-to-br from-emerald-500/15 via-teal-500/15 to-cyan-500/15 p-5 sm:p-6 shadow-2xl shadow-emerald-500/25 ring-2 ring-emerald-400/40">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/15 via-transparent to-cyan-400/15 pointer-events-none" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
                  <div className="relative">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50">
                        <Heart className="w-5 h-5 text-emerald-600" />
                      </span>
                      <p className="text-emerald-800 font-display text-xl font-bold">Fale com um especialista</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 text-center sm:text-left">Conte com apoio para entender melhor sua análise.</p>
                    <div className="animate-cta-pulse-strong">
                      <TherapistCta
                      userId={userData.id}
                      userName={userData.name || undefined}
                      userEmail={userData.email}
                      userPhone={userData.phone}
                      analysisId={id}
                      matchName={analysis.nome_match || premium?.nome_match || free_teaser?.nome_match}
                      hasRedFlags={premium?.red_flags?.length > 0 || free_teaser?.red_flag}
                      onPhoneUpdated={(phone) => setUserData(prev => prev ? { ...prev, phone } : null)}
                      therapist={userData.therapist}
                    />
                    </div>
                  </div>
                </div>
              </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {slideKeys.length > 1 && (
                  <div className="flex flex-col items-center gap-3 mt-6">
                    <span className="text-sm font-medium text-gray-500 tabular-nums">
                      Slide {carouselIndex % slideKeys.length + 1} de {slideKeys.length}
                    </span>
                    <div className="flex items-center justify-between gap-4 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => { setCarouselDirection(-1); setCarouselIndex(i => (i - 1 + slideKeys.length) % slideKeys.length); setAutoAdvancePaused(true); }}
                      className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/90 backdrop-blur border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-lg"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                      {slideKeys.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setCarouselDirection(i > carouselIndex ? 1 : -1); setCarouselIndex(i); setAutoAdvancePaused(true); }}
                          className={`h-2.5 rounded-full transition-all ${i === carouselIndex % slideKeys.length ? 'w-8 bg-purple-600' : 'w-2.5 bg-purple-200 hover:bg-purple-300'}`}
                          aria-label={`Slide ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCarouselDirection(1); setCarouselIndex(i => (i + 1) % slideKeys.length); setAutoAdvancePaused(true); }}
                      className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/90 backdrop-blur border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-lg"
                      aria-label="Próximo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

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
        
        @keyframes cta-pulse-strong {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6),
                        0 0 0 0 rgba(16, 185, 129, 0.4),
                        0 0 30px 5px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 40px 15px rgba(34, 197, 94, 0.5),
                        0 0 80px 30px rgba(16, 185, 129, 0.3),
                        0 0 120px 50px rgba(34, 197, 94, 0.2);
          }
        }
        
        .animate-cta-pulse-strong {
          animation: cta-pulse-strong 1.5s ease-in-out infinite;
          border-radius: 1rem;
          position: relative;
        }
        
        .animate-cta-pulse-strong::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 1.25rem;
          background: linear-gradient(90deg, #22c55e, #10b981, #22c55e);
          background-size: 200% 100%;
          animation: border-glow 1.5s ease-in-out infinite;
          z-index: -1;
          opacity: 0.7;
        }
        
        @keyframes border-glow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.5;
          }
          50% {
            background-position: 100% 50%;
            opacity: 1;
          }
        }
        
        .animate-cta-pulse-strong button {
          animation: button-glow-strong 1s ease-in-out infinite;
        }
        
        @keyframes button-glow-strong {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 40px -5px rgba(34, 197, 94, 0.6),
                        0 0 20px rgba(34, 197, 94, 0.4);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 20px 60px -5px rgba(34, 197, 94, 0.8),
                        0 0 50px rgba(34, 197, 94, 0.6),
                        0 0 80px rgba(16, 185, 129, 0.4);
          }
        }
      `}</style>
    </div>
  )
}
