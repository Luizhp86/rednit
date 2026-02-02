'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'
import { 
  Compass, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  ArrowLeft,
  Sparkles,
  Eye,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
  MessageCircle,
  Heart
} from 'lucide-react'

type EvolutionTrend = 'IMPROVING' | 'STABLE' | 'DECLINING'

type EvolutionAnalysis = {
  overall_trend: EvolutionTrend
  trend_description: string
  score_changes?: {
    dimension: string
    label: string
    before: number
    after: number
    change: number
    trend: 'UP' | 'STABLE' | 'DOWN'
  }[]
  key_improvements: string[]
  areas_of_concern: string[]
  milestone_achieved?: string
}

type RouteCorrectionResult = {
  alignment_status: 'ALINHADO' | 'PARCIALMENTE_ALINHADO' | 'DESALINHADO'
  pattern_summary: {
    main_pattern: string
    description: string
    evidence_count: number
    total_analyses: number
  }
  evolution?: EvolutionAnalysis
  behavior_analysis: {
    strengths: string[]
    weaknesses: string[]
    blind_spots: string[]
  }
  recommendations: {
    corrective_actions: Array<{
      action: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      reason: string
    }>
    keep_doing: string[]
    weekly_focus: {
      focus: string
      metric: string
      goal: string
    }
  }
  encouragement?: {
    message: string
    highlights: string[]
  }
}

export default function RouteCorrectionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [correction, setCorrection] = useState<RouteCorrectionResult | null>(null)
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLimitError, setIsLimitError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const hasFetchedRef = useRef(false)
  const [userData, setUserData] = useState<{
    name?: string
    email?: string
    phone?: string
    specialist?: { whatsapp?: string }
  } | null>(null)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [submittingLead, setSubmittingLead] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    
    async function loadCorrection() {
      try {
        // Buscar dados do usuário para a funcionalidade de especialista
        const meRes = await fetch('/api/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          setUserData({
            name: meData.name,
            email: meData.email,
            phone: meData.phone,
            specialist: meData.therapist
          })
        }

        const res = await fetch('/api/route-correction')
        if (!res.ok) {
          const data = await res.json()
          const errorMessage = data.error || 'Erro ao carregar análise de comportamento'
          setError(errorMessage)
          // Detectar se é erro de limite
          if (errorMessage.includes('limite') || errorMessage.includes('Volte amanhã')) {
            setIsLimitError(true)
          }
          setLoading(false)
          return
        }
        const data = await res.json()
        setCorrection(data.correction)
        setTotalAnalyses(data.total_analyses)
      } catch (err: any) {
        setError('Erro ao carregar análise de comportamento')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadCorrection()
  }, [])

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
          <div className="h-6 bg-purple-100/50 rounded-xl w-48 mb-6 animate-pulse" />
          <div className="h-12 bg-purple-100/50 rounded-xl w-80 mb-8 animate-pulse" />
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-purple-100 p-7 rounded-3xl shadow-lg animate-pulse">
                <div className="h-6 bg-purple-100/50 rounded-lg w-48 mb-4" />
                <div className="h-24 bg-purple-50 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px]" />
        </div>
        
        <nav className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Logo size="lg" />
                </div>
              </div>
            </Link>
          </div>
        </nav>
        
        <div className="relative z-10 container mx-auto px-4 py-10 max-w-4xl">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-yellow-200 text-center">
              {leadSubmitted ? (
                /* Lead enviado com sucesso */
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 border border-emerald-200 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Perfeito!</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Um especialista entrará em contato com você em breve pelo WhatsApp ou telefone cadastrado.
                  </p>
                  <Link href="/dashboard">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]">
                      Ver minhas análises
                    </button>
                  </Link>
                </>
              ) : (
                /* Modal de erro padrão */
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-yellow-100 border border-yellow-200 mb-6">
                    <AlertTriangle className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ops!</h2>
                  <p className="text-gray-600 mb-6 text-lg">{error}</p>
                  
                  {/* Opção de falar com especialista - apenas para erro de limite */}
                  {isLimitError && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 mb-6 border border-emerald-200">
                      <p className="text-sm text-emerald-800 font-medium mb-4 flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-emerald-600" />
                        Que tal conversar com um especialista agora?
                      </p>
                      
                      {userData?.specialist?.whatsapp ? (
                        /* Com especialista - WhatsApp direto */
                        <a
                          href={`https://wa.me/55${userData.specialist.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Falar no WhatsApp
                        </a>
                      ) : (
                        /* Sem especialista - Gerar lead */
                        <button
                          onClick={async () => {
                            setSubmittingLead(true)
                            try {
                              const response = await fetch('/api/lead/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  type: 'CTA',
                                  userEmail: userData?.email || '',
                                  userPhone: userData?.phone || '00000000000',
                                  userName: userData?.name || '',
                                })
                              })
                              if (response.ok) {
                                setLeadSubmitted(true)
                              }
                            } catch (error) {
                              console.error('Erro ao gerar lead:', error)
                            } finally {
                              setSubmittingLead(false)
                            }
                          }}
                          disabled={submittingLead}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {submittingLead ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <MessageCircle className="w-5 h-5" />
                              Quero ser contatado
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  
                  <Link href="/dashboard">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]">
                      <ArrowLeft className="w-5 h-5" />
                      Voltar para Dashboard
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!correction) {
    return null
  }

  const alignmentColors = {
    ALINHADO: 'from-emerald-600 to-green-600',
    PARCIALMENTE_ALINHADO: 'from-yellow-600 to-orange-600',
    DESALINHADO: 'from-red-600 to-pink-600',
  }

  const alignmentLabels = {
    ALINHADO: 'Alinhado',
    PARCIALMENTE_ALINHADO: 'Parcialmente Alinhado',
    DESALINHADO: 'Desalinhado',
  }

  const evolutionConfig = {
    IMPROVING: {
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-300',
      icon: TrendingUp,
      label: 'Evoluindo',
      emoji: '🚀'
    },
    STABLE: {
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      icon: Minus,
      label: 'Estável',
      emoji: '⚖️'
    },
    DECLINING: {
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-300',
      icon: TrendingDown,
      label: 'Atenção',
      emoji: '⚠️'
    }
  }

  const getTrendIcon = (trend: 'UP' | 'STABLE' | 'DOWN') => {
    if (trend === 'UP') return <ArrowUpRight className="w-4 h-4 text-emerald-600" />
    if (trend === 'DOWN') return <ArrowDownRight className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (trend: 'UP' | 'STABLE' | 'DOWN') => {
    if (trend === 'UP') return 'text-emerald-600'
    if (trend === 'DOWN') return 'text-red-600'
    return 'text-gray-600'
  }

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
          onClick={() => {
            // Marcar que o usuário completou a visualização da análise de comportamento
            if (localStorage.getItem('visiting_route_correction') === 'true') {
              localStorage.setItem('just_completed_route_correction', 'true')
              localStorage.removeItem('visiting_route_correction')
              console.log('[ROUTE-CORRECTION] Marcado para destacar botão especialista no dashboard')
            }
          }}
          className="inline-flex items-center gap-2.5 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3 transition-all animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para análises</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up animation-delay-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Compass className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Análise do Meu <span className="text-gradient-primary">Comportamento</span>
              </h1>
              <p className="text-gray-600 mt-1">Baseado em {totalAnalyses} análises</p>
            </div>
          </div>
        </div>

        {/* Status de Alinhamento */}
        <div className="relative mb-6 animate-fade-in-up animation-delay-200">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-[2rem] blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xl">
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r ${alignmentColors[correction.alignment_status]} text-white mb-6 shadow-lg`}>
              <Target className="w-5 h-5" />
              <span className="text-base font-bold">
                {alignmentLabels[correction.alignment_status]}
              </span>
            </div>
            
            {correction.encouragement && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {correction.encouragement.message}
                </p>
                {correction.encouragement.highlights && correction.encouragement.highlights.length > 0 && (
                  <div className="space-y-2">
                    {correction.encouragement.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-100 rounded-lg border border-purple-200 mt-0.5">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-700">{highlight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Padrão Principal */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                Padrão Identificado
              </h3>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {correction.pattern_summary.main_pattern}
              </p>
              <p className="text-gray-700 mb-3">
                {correction.pattern_summary.description}
              </p>
              <p className="text-sm text-gray-500">
                Baseado em {correction.pattern_summary.total_analyses} análises
              </p>
            </div>
          </div>
        </div>

        {/* Card de Evolução */}
        {correction.evolution && (
          <div className={`relative mb-6 animate-fade-in-up animation-delay-300`}>
            <div className={`absolute -inset-2 bg-gradient-to-r ${evolutionConfig[correction.evolution.overall_trend].bgColor} rounded-[2rem] blur-xl opacity-50`} />
            <div className={`relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border-2 ${evolutionConfig[correction.evolution.overall_trend].borderColor} shadow-xl`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${evolutionConfig[correction.evolution.overall_trend].color} shadow-lg`}>
                    {(() => {
                      const IconComponent = evolutionConfig[correction.evolution.overall_trend].icon
                      return <IconComponent className="w-7 h-7 text-white" />
                    })()}
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      Sua Evolução
                      <span className="text-2xl">{evolutionConfig[correction.evolution.overall_trend].emoji}</span>
                    </h2>
                    <p className="text-gray-600 text-sm">Comparando suas análises recentes com as anteriores</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${evolutionConfig[correction.evolution.overall_trend].color} text-white font-bold text-sm shadow-lg`}>
                  {evolutionConfig[correction.evolution.overall_trend].label}
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-700 mb-6">
                {correction.evolution.trend_description}
              </p>

              {/* Milestone conquistado */}
              {correction.evolution.milestone_achieved && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-sm">
                  <div className="p-2.5 bg-yellow-100 rounded-xl border border-yellow-300">
                    <Award className="w-7 h-7 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-yellow-800">Conquista Desbloqueada!</p>
                    <p className="text-yellow-700">{correction.evolution.milestone_achieved}</p>
                  </div>
                </div>
              )}

              {/* Score Changes Grid */}
              {correction.evolution.score_changes && correction.evolution.score_changes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Mudanças nos Indicadores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {correction.evolution.score_changes.map((change, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl bg-white/90 border-2 ${
                          change.trend === 'UP' ? 'border-emerald-200' : 
                          change.trend === 'DOWN' ? 'border-red-200' : 'border-gray-200'
                        } shadow-sm`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">{change.label}</span>
                          {getTrendIcon(change.trend)}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">{change.after}</span>
                          <span className={`text-sm font-bold ${getTrendColor(change.trend)}`}>
                            {change.change > 0 ? '+' : ''}{change.change}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">era {change.before}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Melhorias e Preocupações lado a lado */}
              <div className="grid md:grid-cols-2 gap-4">
                {correction.evolution.key_improvements.length > 0 && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-5 h-5" />
                      Melhorias Recentes
                    </h4>
                    <ul className="space-y-2">
                      {correction.evolution.key_improvements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-emerald-700 text-sm">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {correction.evolution.areas_of_concern.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      Pontos de Atenção
                    </h4>
                    <ul className="space-y-2">
                      {correction.evolution.areas_of_concern.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-orange-700 text-sm">
                          <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Análise de Comportamento */}
        <div className="grid md:grid-cols-3 gap-5 mb-6 animate-fade-in-up animation-delay-400">
          {/* Pontos Fortes */}
          {correction.behavior_analysis.strengths.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-display text-base font-bold text-gray-900">Pontos Fortes</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-emerald-600 mt-1 font-bold">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pontos de Atenção */}
          {correction.behavior_analysis.weaknesses.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl border border-orange-200">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-display text-base font-bold text-gray-900">Atenção</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-orange-600 mt-1 font-bold">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pontos Cegos */}
          {correction.behavior_analysis.blind_spots.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border-2 border-red-200 shadow-lg">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-red-100 rounded-xl border border-red-200">
                  <Eye className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-display text-base font-bold text-gray-900">Pontos Cegos</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.blind_spots.map((blindSpot, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-red-600 mt-1 font-bold">•</span>
                    <span>{blindSpot}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recomendações */}
        <div className="relative mb-8 animate-fade-in-up animation-delay-500">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-[2rem] blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl border border-purple-200">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              Recomendações
            </h2>

            {/* Ações Corretivas */}
            {correction.recommendations.corrective_actions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Ações Corretivas</h3>
                <div className="space-y-3">
                  {correction.recommendations.corrective_actions.map((action, idx) => {
                    const priorityColors = {
                      HIGH: 'border-red-200 bg-red-50',
                      MEDIUM: 'border-orange-200 bg-orange-50',
                      LOW: 'border-yellow-200 bg-yellow-50',
                    }
                    const priorityLabels = {
                      HIGH: 'Alta',
                      MEDIUM: 'Média',
                      LOW: 'Baixa',
                    }
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border-2 ${priorityColors[action.priority]}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900 flex-1 text-sm">{action.action}</p>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 ml-3 border border-gray-200">
                            {priorityLabels[action.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{action.reason}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Continue Fazendo */}
            {correction.recommendations.keep_doing.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Continue Fazendo</h3>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                  <ul className="space-y-2">
                    {correction.recommendations.keep_doing.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-gray-700 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Foco Semanal */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
              <h3 className="font-display text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Foco da Semana
              </h3>
              <p className="text-lg font-bold text-gray-900 mb-3">
                {correction.recommendations.weekly_focus.focus}
              </p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Métrica: </span>
                  <span className="text-gray-600">{correction.recommendations.weekly_focus.metric}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Meta: </span>
                  <span className="text-gray-600">{correction.recommendations.weekly_focus.goal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in-up animation-delay-600">
          <div className="relative inline-block">
            <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-cta-pulse blur-xl" />
            <div className="absolute inset-0 -m-5 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-cta-pulse animation-delay-150 blur-2xl" />
            
            <Link href="/dashboard/new">
              <button className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all inline-flex items-center gap-3 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.98]">
                <Sparkles className="w-6 h-6" />
                <span>Fazer Nova Análise</span>
              </button>
            </Link>
          </div>
        </div>
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
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        
        @keyframes cta-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .animate-cta-pulse {
          animation: cta-pulse 2s ease-out infinite;
        }
        
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
