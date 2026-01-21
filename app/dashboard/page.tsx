'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles, Compass, Lock, Zap, X } from 'lucide-react'

type Analysis = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  nome_match?: string | null
  genero_match?: 'ELE' | 'ELA' | null
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<'FREE' | 'PRO' | null>(null)
  const [showMinAnalysesModal, setShowMinAnalysesModal] = useState(false)
  const [showRoutePaywallModal, setShowRoutePaywallModal] = useState(false)
  const [unlockingRoute, setUnlockingRoute] = useState(false)

  const stageLabels: Record<string, string> = {
    FIRST_CHAT: 'Primeira conversa',
    TALKING: 'Conversando',
    POST_DATE: 'Pós-encontro',
  }

  const getStageLabel = (stage: string) => stageLabels[stage] || stage.replace('_', ' ')
  const getGeneroImage = (genero?: 'ELE' | 'ELA' | null) => {
    if (genero === 'ELE') return '/images/sexy-homem.jpg'
    if (genero === 'ELA') return '/images/sexy-mulher.svg'
    return null
  }

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load analyses
      const res = await fetch('/api/analyses')
      if (res.ok) {
        const data = await res.json()
        setAnalyses(data)
      }

      // Load plan info
      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        setPlan(meData.plan)
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleRouteCorrectionClick = () => {
    if (analyses.length < 2) {
      setShowMinAnalysesModal(true)
      return
    }

    if (plan === 'FREE') {
      setShowRoutePaywallModal(true)
      return
    }

    router.push('/dashboard/route-correction')
  }

  const handleRouteCheckout = async () => {
    setUnlockingRoute(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SUBSCRIPTION' }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Erro ao criar checkout')
        return
      }

      const data = await res.json()

      if (data.upgraded || data.success) {
        alert('Plano PRO ativado! (modo desenvolvimento)')
        window.location.reload()
        return
      }

      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao criar checkout')
    } finally {
      setUnlockingRoute(false)
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
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Logo size="lg" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/account"
              className="text-gray-700 hover:text-purple-600"
            >
              Minha Conta
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-purple-600"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Análises</h1>
          <div className="flex gap-3">
            {analyses.length >= 1 && (
              <button
                onClick={handleRouteCorrectionClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Compass className="w-5 h-5" />
                Correção de Rota
              </button>
            )}
            <Link
              href="/dashboard/new"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Nova Análise
            </Link>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-2xl mx-auto border-2 border-transparent bg-clip-padding relative overflow-hidden">
            {/* Gradiente decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
            
            {/* Ícone principal animado */}
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <BarChart3 className="relative h-16 w-16 text-purple-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pare de se enganar
            </h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Ao invés de análises subjetivas e emocionais, faça uma análise <strong className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">objetiva</strong> com base em estudos e dinâmicas sociais atuais do Tinder.
            </p>
            
            {/* Cards informativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Baseado em Estudos</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-pink-50 border border-pink-100">
                <TrendingUp className="h-8 w-8 text-pink-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Dinâmicas Atuais</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">100% Objetivo</p>
              </div>
            </div>
            
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Analisar Agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/dashboard/analysis/${analysis.id}`}
                className="relative overflow-hidden bg-white p-6 pt-8 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {analysis.nome_match ? analysis.nome_match : 'Crush sem nome'}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Data: {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</p>
                      <p>Estágio: {getStageLabel(analysis.stage)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {analysis.isPaid || plan === 'PRO' ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Completo
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Prévia
                      </span>
                    )}
                    {getGeneroImage(analysis.genero_match) && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-purple-100 bg-purple-50">
                        <Image
                          src={getGeneroImage(analysis.genero_match) as string}
                          alt={
                            analysis.genero_match === 'ELE'
                              ? 'Imagem sexy de homem'
                              : 'Imagem sexy de mulher'
                          }
                          width={96}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showMinAnalysesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowMinAnalysesModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <Compass className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Falta só mais uma análise
                </h3>
                <p className="text-gray-600 mb-6">
                  Para gerar a Correção de Rota, você precisa ter pelo menos 2 análises.
                </p>
                <Link href="/dashboard/new">
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                    Fazer nova análise
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {showRoutePaywallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
              <button
                onClick={() => setShowRoutePaywallModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Desbloqueie a Correção de Rota
                </h3>
                <p className="text-gray-600">
                  Entenda seus padrões com base em todas as análises e receba um plano claro de ajustes.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50">
                  <Compass className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Diagnóstico de padrão</div>
                    <div className="text-sm text-gray-600">O que se repete e por quê</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Ações corretivas</div>
                    <div className="text-sm text-gray-600">Passo a passo de ajuste</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Plano semanal</div>
                    <div className="text-sm text-gray-600">Foco e métrica para evoluir</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRouteCheckout}
                disabled={unlockingRoute}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                {unlockingRoute ? 'Processando...' : 'Quero desbloquear agora'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Pix e cartão • Acesso imediato • Plano PRO
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
