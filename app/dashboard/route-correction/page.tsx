'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  ArrowLeft,
  Sparkles,
  Eye,
  Zap
} from 'lucide-react'

type RouteCorrectionResult = {
  alignment_status: 'ALINHADO' | 'PARCIALMENTE_ALINHADO' | 'DESALINHADO'
  pattern_summary: {
    main_pattern: string
    description: string
    evidence_count: number
    total_analyses: number
  }
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

  useEffect(() => {
    async function loadCorrection() {
      try {
        const res = await fetch('/api/route-correction')
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erro ao carregar correção de rota')
          setLoading(false)
          return
        }
        const data = await res.json()
        setCorrection(data.correction)
        setTotalAnalyses(data.total_analyses)
      } catch (err: any) {
        setError('Erro ao carregar correção de rota')
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
            <Logo size="lg" />
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
            <Link href="/dashboard">
              <Logo size="lg" />
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
              <h1 className="text-3xl font-bold text-gray-900">Correção de Rota</h1>
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
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Padrão Identificado
            </h3>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {correction.pattern_summary.main_pattern}
            </p>
            <p className="text-gray-700 mb-3">
              {correction.pattern_summary.description}
            </p>
            <p className="text-sm text-gray-600">
              Evidência em {correction.pattern_summary.evidence_count} de {correction.pattern_summary.total_analyses} análises
            </p>
          </div>
        </Card>

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
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
              Fazer Nova Análise
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
