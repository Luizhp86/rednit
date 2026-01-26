'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  ArrowDownRight
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
  const [loading, setLoading] = useState(true)
  const [correction, setCorrection] = useState<RouteCorrectionResult | null>(null)
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Evitar múltiplas requisições (StrictMode do React faz o efeito rodar 2x)
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    
    async function loadCorrection() {
      try {
        const res = await fetch('/api/route-correction')
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erro ao carregar análise de comportamento')
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
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold text-purple-700">
                  Coach de Relacionamentos
                </span>
                <span className="text-xs text-gray-500 hidden md:block">
                  Análise objetiva do seu match
                </span>
              </div>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button>Voltar para Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!correction) {
    return null
  }

  const alignmentColors = {
    ALINHADO: 'from-green-600 to-emerald-600',
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
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
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
    if (trend === 'UP') return <ArrowUpRight className="w-4 h-4 text-green-600" />
    if (trend === 'DOWN') return <ArrowDownRight className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (trend: 'UP' | 'STABLE' | 'DOWN') => {
    if (trend === 'UP') return 'text-green-600'
    if (trend === 'DOWN') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Logo size="lg" />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/dashboard"
          className="text-purple-600 hover:text-purple-700 mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para análises
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análise do Meu Comportamento</h1>
              <p className="text-gray-600">Baseado em {totalAnalyses} análises</p>
            </div>
          </div>
        </div>

        {/* Status de Alinhamento */}
        <Card className="p-8 rounded-3xl border-2 shadow-xl mb-6 bg-gradient-to-br from-white to-gray-50">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${alignmentColors[correction.alignment_status]} text-white mb-6`}>
            <Target className="w-6 h-6" />
            <span className="text-lg font-bold">
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
                    <div key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{highlight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Padrão Principal */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-600" />
              Padrão Identificado
            </h3>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {correction.pattern_summary.main_pattern}
            </p>
            <p className="text-gray-700 mb-3">
              {correction.pattern_summary.description}
            </p>
            <p className="text-sm text-gray-600">
              Baseado em {correction.pattern_summary.total_analyses} análises
            </p>
          </div>
        </Card>

        {/* NOVO: Card de Evolução */}
        {correction.evolution && (
          <Card className={`p-8 rounded-3xl border-2 ${evolutionConfig[correction.evolution.overall_trend].borderColor} shadow-xl mb-6 bg-gradient-to-br ${evolutionConfig[correction.evolution.overall_trend].bgColor}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-gradient-to-r ${evolutionConfig[correction.evolution.overall_trend].color}`}>
                  {(() => {
                    const IconComponent = evolutionConfig[correction.evolution.overall_trend].icon
                    return <IconComponent className="w-8 h-8 text-white" />
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Sua Evolução
                    <span className="text-2xl">{evolutionConfig[correction.evolution.overall_trend].emoji}</span>
                  </h2>
                  <p className="text-gray-600">Comparando suas análises recentes com as anteriores</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${evolutionConfig[correction.evolution.overall_trend].color} text-white font-bold`}>
                {evolutionConfig[correction.evolution.overall_trend].label}
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {correction.evolution.trend_description}
            </p>

            {/* Milestone conquistado */}
            {correction.evolution.milestone_achieved && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-yellow-800">Conquista Desbloqueada!</p>
                  <p className="text-yellow-700">{correction.evolution.milestone_achieved}</p>
                </div>
              </div>
            )}

            {/* Score Changes Grid */}
            {correction.evolution.score_changes && correction.evolution.score_changes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mudanças nos Indicadores</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {correction.evolution.score_changes.map((change, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl bg-white/80 border ${
                        change.trend === 'UP' ? 'border-green-200' : 
                        change.trend === 'DOWN' ? 'border-red-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">{change.label}</span>
                        {getTrendIcon(change.trend)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">{change.after}</span>
                        <span className={`text-sm font-semibold ${getTrendColor(change.trend)}`}>
                          {change.change > 0 ? '+' : ''}{change.change}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">era {change.before}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Melhorias e Preocupações lado a lado */}
            <div className="grid md:grid-cols-2 gap-4">
              {correction.evolution.key_improvements.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Melhorias Recentes
                  </h4>
                  <ul className="space-y-2">
                    {correction.evolution.key_improvements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {correction.evolution.areas_of_concern.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
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
          </Card>
        )}

        {/* Análise de Comportamento */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Pontos Fortes */}
          {correction.behavior_analysis.strengths.length > 0 && (
            <Card className="p-6 rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Pontos Fortes</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Pontos de Atenção */}
          {correction.behavior_analysis.weaknesses.length > 0 && (
            <Card className="p-6 rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Atenção</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Pontos Cegos */}
          {correction.behavior_analysis.blind_spots.length > 0 && (
            <Card className="p-6 rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Pontos Cegos</h3>
              </div>
              <ul className="space-y-2">
                {correction.behavior_analysis.blind_spots.map((blindSpot, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{blindSpot}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Recomendações */}
        <Card className="p-8 rounded-3xl border-2 shadow-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-7 h-7 text-purple-600" />
            Recomendações
          </h2>

          {/* Ações Corretivas */}
          {correction.recommendations.corrective_actions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Corretivas</h3>
              <div className="space-y-4">
                {correction.recommendations.corrective_actions.map((action, idx) => {
                  const priorityColors = {
                    HIGH: 'border-red-300 bg-red-50',
                    MEDIUM: 'border-orange-300 bg-orange-50',
                    LOW: 'border-yellow-300 bg-yellow-50',
                  }
                  const priorityLabels = {
                    HIGH: 'Alta',
                    MEDIUM: 'Média',
                    LOW: 'Baixa',
                  }
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 ${priorityColors[action.priority]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 flex-1">{action.action}</p>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700 ml-3">
                          {priorityLabels[action.priority]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{action.reason}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Continue Fazendo */}
          {correction.recommendations.keep_doing.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Continue Fazendo</h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {correction.recommendations.keep_doing.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Foco Semanal */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Foco da Semana
            </h3>
            <p className="text-lg font-bold text-gray-900 mb-3">
              {correction.recommendations.weekly_focus.focus}
            </p>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Métrica: </span>
                <span className="text-gray-700">{correction.recommendations.weekly_focus.metric}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Meta: </span>
                <span className="text-gray-700">{correction.recommendations.weekly_focus.goal}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard/new">
            <Button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></span>
              <Sparkles className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Fazer Nova Análise</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
