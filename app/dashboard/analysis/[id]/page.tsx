'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'

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

        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          {analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? `Análise de ${analysis.premium?.nome_match || analysis.free_teaser?.nome_match}`
            : 'Resultado da Análise'}
        </h1>

        {/* Free Teaser */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Prévia Gratuita</h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              ✅ Gerado por IA
            </span>
          </div>
          
          {/* Insight Preview se disponível */}
          {free_teaser.insight_preview && (
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-6 rounded">
              <p className="text-purple-900 font-medium">{free_teaser.insight_preview}</p>
            </div>
          )}

          {free_teaser.hypothesis && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Hipótese Principal</h3>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {free_teaser.hypothesis.title && (
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {free_teaser.hypothesis.title}
                      </h4>
                    )}
                    {free_teaser.hypothesis.description && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {free_teaser.hypothesis.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                      free_teaser.hypothesis.confidence === 'HIGH'
                        ? 'bg-green-100 text-green-800'
                        : free_teaser.hypothesis.confidence === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {free_teaser.hypothesis.confidence === 'HIGH' ? 'Alta' : free_teaser.hypothesis.confidence === 'MEDIUM' ? 'Média' : 'Baixa'} Confiança
                  </span>
                </div>
                {!free_teaser.hypothesis.title && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-gray-900">{free_teaser.hypothesis.key}</span>
                  </div>
                )}
                <div className="text-sm mb-3">
                  <p className="font-semibold mb-2 text-gray-900">Sinais observados:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {free_teaser.hypothesis.signals.map((signal: any, idx: number) => (
                      <li key={idx}>
                        <strong>{signal.label}:</strong> {signal.why}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Upgrade Hook se disponível */}
                {free_teaser.hypothesis.upgrade_hook && (
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mt-3">
                    <p className="text-sm text-purple-900">
                      💡 {free_teaser.hypothesis.upgrade_hook}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Flags</h3>
            <div className="space-y-3">
              {free_teaser.flags.map((flag: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    flag.severity === 'HIGH' && flag.title.includes('Red')
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{flag.title}</h4>
                      {flag.description && (
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                          {flag.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        flag.severity === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : flag.severity === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {flag.severity === 'HIGH' ? 'Alta' : flag.severity === 'MEDIUM' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{flag.impact}</p>
                  {flag.upgrade_hook && (
                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 mt-2">
                      <p className="text-xs text-purple-900">{flag.upgrade_hook}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold">Evidências:</p>
                    <ul className="list-disc list-inside">
                      {flag.evidence_signals.map((signal: any, sIdx: number) => (
                        <li key={sIdx}>{signal.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Scores Principais</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(free_teaser.scores || {}).map(([key, value]: [string, any]) => (
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
        </div>

        {/* Paywall Melhorado - Clareza, não bloqueio */}
        {!has_access && (
          <div className="bg-white border-2 border-purple-200 rounded-lg shadow-lg mb-6 overflow-hidden">
            {/* O que você já tem */}
            <div className="bg-green-50 border-b border-green-200 p-6">
              <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                ✅ O que você já tem:
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Hipótese principal com nível de confiança</li>
                <li>• 2-3 flags (red/green) com evidências</li>
                <li>• 2 scores principais (risco ghosting + intenção)</li>
                <li>• Insight preview gerado por IA</li>
              </ul>
            </div>

            {/* O que falta (com cadeado visual) */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🔒 O plano PRO libera:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <div className="font-semibold text-gray-900">2-3 hipóteses alternativas</div>
                    <div className="text-xs text-gray-600">Com níveis de confiança e validação/refutação</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Mapa completo de risco</div>
                    <div className="text-xs text-gray-600">Todos os 7 scores + análise profunda</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Flags completos</div>
                    <div className="text-xs text-gray-600">Todos os red flags e green flags detectados</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Plano de ação</div>
                    <div className="text-xs text-gray-600">Próximas ações sugeridas por estágio</div>
                  </div>
                </div>
              </div>

              {/* CTA claro */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 mb-3">
                  <strong>💡 Benefício:</strong> Entenda padrões que podem estar se formando e tome decisões informadas com base em evidências, não em suposições.
                </p>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {unlocking ? 'Processando...' : 'Desbloquear Relatório Completo - R$ 9,90'}
                </button>
                <p className="text-xs text-center text-purple-700 mt-2">
                  Pagamento via Pix e cartão • Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Content */}
        {has_access && premium && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Relatório Completo</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Todos os Scores</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(premium.all_scores || {}).map(([key, value]: [string, any]) => (
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Todas as Hipóteses</h3>
              <div className="space-y-4">
                {premium.all_hypotheses?.map((hypothesis: any, idx: number) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{hypothesis.key}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          hypothesis.confidence === 'HIGH'
                            ? 'bg-green-100 text-green-800'
                            : hypothesis.confidence === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {hypothesis.confidence}
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <p className="font-semibold mb-1">Sinais:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {hypothesis.signals.map((signal: any, sIdx: number) => (
                          <li key={sIdx} className="text-gray-600">
                            {signal.label}: {signal.why}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Observe para confirmar:</p>
                      <ul className="list-disc list-inside">
                        {hypothesis.observe_to_confirm.map((obs: string, oIdx: number) => (
                          <li key={oIdx} className="text-gray-600">
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Red Flags Completos</h3>
              <div className="space-y-3">
                {premium.all_red_flags?.map((flag: any, idx: number) => (
                  <div key={idx} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{flag.title}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          flag.severity === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : flag.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{flag.impact}</p>
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold">Evidências:</p>
                      <ul className="list-disc list-inside">
                        {flag.evidence_signals.map((signal: any, sIdx: number) => (
                          <li key={sIdx}>{signal.label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Green Flags Completos</h3>
              <div className="space-y-3">
                {premium.all_green_flags?.map((flag: any, idx: number) => (
                  <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{flag.title}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          flag.severity === 'HIGH'
                            ? 'bg-green-100 text-green-800'
                            : flag.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{flag.impact}</p>
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold">Evidências:</p>
                      <ul className="list-disc list-inside">
                        {flag.evidence_signals.map((signal: any, sIdx: number) => (
                          <li key={sIdx}>{signal.label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {premium.next_actions && premium.next_actions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Próximas Ações</h3>
                <div className="space-y-3">
                  {premium.next_actions.map((action: any, idx: number) => (
                    <div key={idx} className="bg-purple-50 p-4 rounded-lg">
                      <div className="font-semibold mb-1">{action.action}</div>
                      <div className="text-sm text-gray-600">
                        Estágio: {action.stage.replace(/_/g, ' ')} | {action.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
