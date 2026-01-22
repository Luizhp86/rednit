'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles, Compass, Lock, Zap, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

type Analysis = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  nome_match?: string | null
  genero_match?: 'ELE' | 'ELA' | null
  headline?: string | null
  riskScore?: {
    type: 'risco_ghosting' | 'risco_enrolacao'
    value: number
    label: string
  } | null
  hasRedFlag?: boolean
  hasGreenFlag?: boolean
  compatScore?: number | null
}

type RouteCorrection = {
  available: boolean
  activeAnalysesCount: number // Análises novas (não usadas)
  totalAnalysesCount?: number // Total de análises
  isFirstTime?: boolean // Nunca fez análise de comportamento
  isFirstTimeAvailable: boolean
  neededForNext: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<'FREE' | 'PRO' | null>(null)
  const [routeCorrection, setRouteCorrection] = useState<RouteCorrection | null>(null)
  const [showMinAnalysesModal, setShowMinAnalysesModal] = useState(false)
  const [showRoutePaywallModal, setShowRoutePaywallModal] = useState(false)
  const [showRouteCorrectionTooltip, setShowRouteCorrectionTooltip] = useState(false)
  const [unlockingRoute, setUnlockingRoute] = useState(false)

  const stageLabels: Record<string, string> = {
    FIRST_CHAT: 'Primeira conversa',
    TALKING: 'Conversando',
    POST_DATE: 'Pós-encontro',
  }

  const getStageLabel = (stage: string) => stageLabels[stage] || stage.replace('_', ' ')
  const getGeneroImage = (genero?: 'ELE' | 'ELA' | null) => {
    if (genero === 'ELE') return '/images/homem.svg'
    if (genero === 'ELA') return '/images/mulher.svg'
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

      // Load plan info and route correction status
      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        setPlan(meData.plan)
        
        // Set route correction info
        if (meData.routeCorrection) {
          setRouteCorrection(meData.routeCorrection)
          
          // Show tooltip whenever route correction is available
          if (meData.routeCorrection.available) {
            setShowRouteCorrectionTooltip(true)
          }
        }
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
    // Check if route correction is available (needs 2+ active analyses)
    if (!routeCorrection?.available) {
      setShowMinAnalysesModal(true)
      return
    }

    if (plan === 'FREE') {
      setShowRoutePaywallModal(true)
      return
    }

    // Hide tooltip when user clicks
    setShowRouteCorrectionTooltip(false)
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
            {/* Backdrop para fechar tooltip ao clicar fora */}
            {showRouteCorrectionTooltip && routeCorrection?.available && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowRouteCorrectionTooltip(false)}
              />
            )}
            
            {analyses.length >= 1 && (
              <div className="relative">
                {/* Tooltip explicativo - aparece quando análise de comportamento fica disponível */}
                {showRouteCorrectionTooltip && routeCorrection?.available && (
                  <div className="absolute top-full right-0 mt-3 w-80 z-50">
                    <div className="bg-gray-900 text-white text-sm rounded-xl p-4 shadow-xl relative">
                      <button
                        onClick={() => setShowRouteCorrectionTooltip(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="font-bold text-yellow-400">Novidade disponível!</span>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">
                        Descubra se você está <strong>evoluindo</strong> ou <strong>regredindo</strong> na atração de pessoas com mesmas intenções. Veja sua evolução ao longo do tempo!
                      </p>
                      {plan === 'FREE' && (
                        <p className="text-yellow-300 text-xs mt-2 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Recurso exclusivo do Plano PRO
                        </p>
                      )}
                      {/* Seta do tooltip */}
                      <div className="absolute -top-2 right-8 w-4 h-4 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleRouteCorrectionClick}
                  className={`relative px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-md hover:shadow-lg ${
                    routeCorrection?.available
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 animate-pulse-subtle ring-2 ring-purple-400 ring-offset-2'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {/* Glow effect quando disponível */}
                  {routeCorrection?.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-md opacity-50 -z-10"></div>
                  )}
                  {plan === 'FREE' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                  Analisar meu comportamento
                  {/* Badge PRO para usuários FREE */}
                  {plan === 'FREE' && (
                    <span className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-900">
                      PRO
                    </span>
                  )}
                  {/* Contador de análises quando disponível */}
                  {routeCorrection?.available && (
                    <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {routeCorrection.activeAnalysesCount}
                    </span>
                  )}
                </button>
              </div>
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
            {analyses.map((analysis) => {
              // Determinar cor do gradiente baseado nas flags
              const gradientColor = analysis.hasRedFlag 
                ? 'from-red-500 via-red-400 to-orange-500'
                : analysis.hasGreenFlag 
                ? 'from-green-500 via-emerald-500 to-teal-500'
                : 'from-purple-600 via-purple-500 to-purple-700'
              
              // Determinar cor do risco
              const getRiskColor = (value: number) => {
                if (value >= 70) return 'text-red-600 bg-red-50'
                if (value >= 50) return 'text-orange-600 bg-orange-50'
                if (value >= 30) return 'text-yellow-600 bg-yellow-50'
                return 'text-green-600 bg-green-50'
              }
              
              return (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analysis/${analysis.id}`}
                  className="relative overflow-hidden bg-white p-6 pt-8 rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.01]"
                >
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradientColor}`}></div>
                  
                  <div className="flex justify-between items-start gap-4">
                    {/* Lado esquerdo - Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {analysis.nome_match ? analysis.nome_match : 'Crush sem nome'}
                        </h3>
                        {analysis.hasRedFlag && (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        {analysis.hasGreenFlag && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Headline resumido */}
                      {analysis.headline && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-1">
                          {analysis.headline}
                        </p>
                      )}
                      
                      {/* Badges de risco e compatibilidade */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {analysis.riskScore && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(analysis.riskScore.value)}`}>
                            {analysis.riskScore.label}: {analysis.riskScore.value}%
                          </span>
                        )}
                        {analysis.compatScore !== null && analysis.compatScore !== undefined && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            analysis.compatScore >= 65 ? 'text-green-600 bg-green-50' :
                            analysis.compatScore >= 45 ? 'text-yellow-600 bg-yellow-50' :
                            'text-red-600 bg-red-50'
                          }`}>
                            Compatibilidade: {analysis.compatScore}%
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{getStageLabel(analysis.stage)}</span>
                      </div>
                    </div>
                    
                    {/* Lado direito - Imagem e status */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {analysis.isPaid || plan === 'PRO' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          Completo
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          Prévia
                        </span>
                      )}
                      {getGeneroImage(analysis.genero_match) && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-purple-100 bg-purple-50 shadow-sm">
                          <Image
                            src={getGeneroImage(analysis.genero_match) as string}
                            alt={
                              analysis.genero_match === 'ELE'
                                ? 'Imagem de homem'
                                : 'Imagem de mulher'
                            }
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
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
                  {routeCorrection?.neededForNext === 1 
                    ? 'Falta só mais uma análise nova' 
                    : `Faltam ${routeCorrection?.neededForNext || 2} análises novas`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {routeCorrection?.isFirstTime 
                    ? 'Para gerar sua primeira Análise de Comportamento e ver sua evolução, você precisa ter pelo menos 3 análises de matches diferentes.'
                    : 'Para gerar uma nova Análise de Comportamento e ver sua evolução, você precisa fazer pelo menos 2 novas análises de matches.'
                  }
                </p>
                {routeCorrection && routeCorrection.activeAnalysesCount > 0 && (
                  <p className="text-sm text-purple-600 mb-4 bg-purple-50 px-4 py-2 rounded-lg">
                    Você tem {routeCorrection.activeAnalysesCount} análise{routeCorrection.activeAnalysesCount > 1 ? 's' : ''} nova{routeCorrection.activeAnalysesCount > 1 ? 's' : ''}.
                    {routeCorrection.totalAnalysesCount && routeCorrection.totalAnalysesCount > routeCorrection.activeAnalysesCount && (
                      <span className="block text-gray-500 text-xs mt-1">
                        ({routeCorrection.totalAnalysesCount} análises no total)
                      </span>
                    )}
                  </p>
                )}
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
                  Desbloqueie a Análise de Comportamento
                </h3>
                <p className="text-gray-600">
                  Descubra se você está evoluindo ou regredindo na atração de pessoas certas.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Gráfico de Evolução</div>
                    <div className="text-sm text-gray-600">Veja se está melhorando ou piorando</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50">
                  <Compass className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Diagnóstico de padrão</div>
                    <div className="text-sm text-gray-600">O que se repete e por quê</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50">
                  <Zap className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Ações corretivas</div>
                    <div className="text-sm text-gray-600">Passo a passo para evoluir</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRouteCheckout}
                disabled={unlockingRoute}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
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
