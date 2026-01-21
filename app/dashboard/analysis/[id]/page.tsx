'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Lock, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Eye, Zap } from 'lucide-react'

type AnalysisResult = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  free_teaser: any & { nome_match?: string }
  premium: (any & { nome_match?: string }) | null
  has_access: boolean
}

export default function AnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)

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
      }
      setLoading(false)
    }
    loadAnalysis()
  }, [id])

  // Mostrar modal após 5 segundos se não tiver acesso premium
  useEffect(() => {
    if (!loading && analysis && !analysis.has_access) {
      const timer = setTimeout(() => {
        setShowUnlockModal(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [loading, analysis])

  const handleUnlock = async () => {
    setUnlocking(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, type: 'UNLOCK' }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Erro ao criar checkout')
        return
      }

      const data = await res.json()
      
      // In development, unlock directly and reload
      if (data.unlocked || data.success) {
        alert('Análise desbloqueada! (modo desenvolvimento)')
        window.location.reload()
        return
      }
      
      // In production, redirect to payment
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao criar checkout')
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
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

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Análise não encontrada</div>
      </div>
    )
  }

  const { free_teaser, premium, has_access } = analysis

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
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-700 mb-4 inline-block"
          >
            ← Voltar para análises
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
          {(analysis as any).avatar_match && (
            <span className="text-4xl">{(analysis as any).avatar_match}</span>
          )}
          {analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? `Análise de ${analysis.premium?.nome_match || analysis.free_teaser?.nome_match}`
            : 'Resultado da Análise'}
        </h1>

        {!has_access && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Desbloqueie sua análise completa</h2>
              </div>
              <p className="text-white/90 text-base mb-6">
                Veja as hipóteses alternativas, o mapa completo de risco e o plano de ação por estágio.
                É aqui que estão as decisões mais inteligentes.
              </p>
              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-white text-purple-700 hover:text-purple-800 font-extrabold py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-6 h-6 mr-2" />
                {unlocking ? 'Processando...' : 'Quero desbloquear agora • R$ 9,90'}
              </Button>
              <p className="text-xs text-white/80 mt-3 text-center">
                Pix e cartão • Acesso imediato • Compra única
              </p>
            </div>
          </div>
        )}

        {/* Free Teaser - Simplificado e Instigante */}
        {!has_access && (
          <div className="space-y-6 mb-6">
          {/* Headline Impactante */}
          {free_teaser.headline && (
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl text-center">
              <h2 className="text-3xl font-bold">{free_teaser.headline}</h2>
            </div>
          )}

          {/* Grid de Cards Instigantes */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hipótese Principal - Card Simplificado */}
            {free_teaser.hypothesis_1 && (
              <Card className="p-6 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Hipótese Principal</h3>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {getHypothesisTitle(free_teaser.hypothesis_1)}
                    </h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-200/50 text-sm font-semibold text-blue-800 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      {free_teaser.hypothesis_1.confidence === 'HIGH' ? 'Alta confiança' : 
                       free_teaser.hypothesis_1.confidence === 'MEDIUM' ? 'Média confiança' : 'Baixa confiança'}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mt-4 border border-purple-200">
                  <p className="text-xs text-gray-700 font-semibold">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Hipóteses alternativas e análise completa no premium
                  </p>
                </div>
              </Card>
            )}

            {/* Score de Risco - Card Visual */}
            {free_teaser.ONE_risk_score && (
              <Card className="p-6 rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Risco Detectado</h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    {free_teaser.ONE_risk_score.value}%
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {free_teaser.ONE_risk_score.label}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      free_teaser.ONE_risk_score.value > 70
                        ? 'bg-red-600'
                        : free_teaser.ONE_risk_score.value > 50
                          ? 'bg-orange-600'
                          : 'bg-yellow-600'
                    }`}
                    style={{ width: `${free_teaser.ONE_risk_score.value}%` }}
                  />
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-700 font-semibold">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Mapa completo de risco disponível no premium
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Flags - Apenas 1 (red OU green, o mais relevante) */}
          {(free_teaser.red_flag || free_teaser.green_flag) && (
            <Card className={`p-6 rounded-3xl border-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] ${
              free_teaser.red_flag 
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
                : 'border-green-200 bg-gradient-to-br from-green-50 to-green-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {free_teaser.red_flag ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {free_teaser.red_flag?.title || free_teaser.green_flag?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {free_teaser.red_flag?.impact || free_teaser.green_flag?.benefit}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mt-4 border border-purple-200">
                <p className="text-xs text-gray-700 font-semibold">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Todos os flags e análise detalhada no premium
                </p>
              </div>
            </Card>
          )}

          {/* Observe 48h - Card de Ação */}
          {free_teaser.observe_48h && free_teaser.observe_48h.length > 0 && (
            <Card className="p-6 rounded-3xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Próximos Passos</h3>
              </div>
              <div className="space-y-2 mb-4">
                {free_teaser.observe_48h.slice(0, 1).map((obs: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1 font-bold">•</span>
                    <p className="text-gray-700 flex-1">{obs}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                <p className="text-xs text-gray-700 font-semibold">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Checklist completo e plano por estágio no premium
                </p>
              </div>
            </Card>
          )}
          </div>
        )}


        {/* Premium Content */}
        {has_access && premium && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Relatório Completo</h2>

            {/* Executive Summary */}
            {premium.executive_summary && premium.executive_summary.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumo Executivo</h3>
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {premium.executive_summary.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* All Scores */}
            {premium && (premium as any).scores && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Todos os Scores</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries((premium as any).scores).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-2xl font-bold text-purple-600">{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top 3 Hypotheses */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 3 Hipóteses</h3>
              <div className="space-y-4">
                {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3]
                  .filter(Boolean)
                  .map((hypothesis: any, idx: number) => (
                    <div key={idx} className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-lg">{hypothesis.title || hypothesis.key}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            hypothesis.confidence === 'HIGH'
                              ? 'bg-green-100 text-green-800'
                              : hypothesis.confidence === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {hypothesis.confidence === 'HIGH' ? 'Alta' : hypothesis.confidence === 'MEDIUM' ? 'Média' : 'Baixa'} Confiança
                        </span>
                      </div>
                      {hypothesis.description && (
                        <p className="text-gray-700 mb-3 leading-relaxed">{hypothesis.description}</p>
                      )}
                      {hypothesis.signals && hypothesis.signals.length > 0 && (
                        <div className="text-sm mb-3">
                          <p className="font-semibold mb-1">Sinais:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {hypothesis.signals.map((signal: any, sIdx: number) => (
                              <li key={sIdx}>
                                {signal.label}: {signal.why}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hypothesis.observe_to_confirm && hypothesis.observe_to_confirm.length > 0 && (
                        <div className="text-sm mb-2">
                          <p className="font-semibold mb-1">Observe para confirmar:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {hypothesis.observe_to_confirm.map((obs: string, oIdx: number) => (
                              <li key={oIdx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hypothesis.observe_to_refute && hypothesis.observe_to_refute.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Observe para refutar:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {hypothesis.observe_to_refute.map((obs: string, oIdx: number) => (
                              <li key={oIdx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Full Risk Map */}
            {premium.full_risk_map && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Mapa Completo de Risco</h3>
                <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">Risco de Ghosting</span>
                        <span className="text-2xl font-bold text-orange-600">{premium.full_risk_map.risco_ghosting}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            premium.full_risk_map.risco_ghosting > 70
                              ? 'bg-red-600'
                              : premium.full_risk_map.risco_ghosting > 50
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                          }`}
                          style={{ width: `${premium.full_risk_map.risco_ghosting}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">Risco de Enrolação</span>
                        <span className="text-2xl font-bold text-orange-600">{premium.full_risk_map.risco_enrolacao}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            premium.full_risk_map.risco_enrolacao > 70
                              ? 'bg-red-600'
                              : premium.full_risk_map.risco_enrolacao > 50
                                ? 'bg-orange-600'
                                : 'bg-yellow-600'
                          }`}
                          style={{ width: `${premium.full_risk_map.risco_enrolacao}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {premium.full_risk_map.explanations && premium.full_risk_map.explanations.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold mb-2 text-gray-800">Explicações:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {premium.full_risk_map.explanations.map((exp: string, idx: number) => (
                          <li key={idx}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compatibility */}
            {premium.compatibility_explained && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Compatibilidade</h3>
                <div className={`p-6 rounded-lg border-2 ${
                  premium.compatibility_explained.alignment === 'ALINHADO'
                    ? 'bg-green-50 border-green-200'
                    : premium.compatibility_explained.alignment === 'PARCIAL'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Score de Compatibilidade</span>
                    <span className="text-2xl font-bold text-purple-600">{premium.compatibility_explained.score}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{premium.compatibility_explained.explanation}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'bg-green-100 text-green-800'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {premium.compatibility_explained.alignment === 'ALINHADO' ? 'Alinhado' : 
                     premium.compatibility_explained.alignment === 'PARCIAL' ? 'Parcial' : 'Desalinhado'}
                  </span>
                </div>
              </div>
            )}

            {/* Validation Checklist */}
            {premium.validation_checklist && premium.validation_checklist.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Checklist de Validação</h3>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <ul className="space-y-3">
                    {premium.validation_checklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Stage Plan */}
            {premium.stage_plan && premium.stage_plan.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Plano por Estágio</h3>
                <div className="space-y-4">
                  {premium.stage_plan.map((plan: any, idx: number) => (
                    <div key={idx} className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                      <h4 className="font-bold text-lg mb-3 text-gray-900">
                        Estágio: {plan.stage.replace(/_/g, ' ')}
                      </h4>
                      {plan.actions && plan.actions.length > 0 && (
                        <div className="mb-4">
                          <p className="font-semibold mb-2 text-gray-800">Ações:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {plan.actions.map((action: string, aIdx: number) => (
                              <li key={aIdx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {plan.metrics && plan.metrics.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2 text-gray-800">Métricas para acompanhar:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {plan.metrics.map((metric: string, mIdx: number) => (
                              <li key={mIdx}>{metric}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!has_access && (
          <div className="mt-10">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Desbloqueie sua análise completa</h2>
              </div>
              <p className="text-white/90 text-base mb-6">
                Veja as hipóteses alternativas, o mapa completo de risco e o plano de ação por estágio.
                É aqui que estão as decisões mais inteligentes.
              </p>
              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-white text-purple-700 hover:text-purple-800 font-extrabold py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-6 h-6 mr-2" />
                {unlocking ? 'Processando...' : 'Quero desbloquear agora • R$ 9,90'}
              </Button>
              <p className="text-xs text-white/80 mt-3 text-center">
                Pix e cartão • Acesso imediato • Compra única
              </p>
            </div>
          </div>
        )}

        {/* Modal de Desbloqueio - Aparece após alguns segundos */}
        {showUnlockModal && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all duration-300 scale-100">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Desbloqueie a Análise Completa
                </h3>
                <p className="text-gray-600">
                  Veja insights detalhados que vão te ajudar a tomar decisões mais inteligentes
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Top 3 Hipóteses Completas</div>
                    <div className="text-sm text-gray-600">Com confiança e validação detalhada</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Mapa Completo de Risco</div>
                    <div className="text-sm text-gray-600">Todos os scores explicados</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Checklist de Validação</div>
                    <div className="text-sm text-gray-600">Plano de ação por estágio</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
              >
                <Zap className="w-5 h-5 mr-2" />
                {unlocking ? 'Processando...' : 'Desbloquear Agora - R$ 9,90'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  💳 Pix e cartão • ⚡ Acesso imediato • 🔄 Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
