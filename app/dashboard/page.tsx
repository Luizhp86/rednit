'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { PhoneInputModal } from '@/components/phone-input-modal'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles, Compass, X, AlertTriangle, CheckCircle2, MessageCircle, Heart, Phone, Menu, LogOut, User } from 'lucide-react'

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
  activeAnalysesCount: number
  totalAnalysesCount?: number
  isFirstTime?: boolean
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
  const [showRouteCorrectionTooltip, setShowRouteCorrectionTooltip] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [therapist, setTherapist] = useState<{
    id: string
    name: string
    whatsapp: string | null
    photoUrl: string | null
  } | null>(null)
  const [showTherapistDisclaimer, setShowTherapistDisclaimer] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

      const res = await fetch('/api/analyses')
      if (res.ok) {
        const data = await res.json()
        setAnalyses(data)
      }

      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        setPlan(meData.plan)
        setUserName(meData.name)
        
        if (meData.routeCorrection) {
          setRouteCorrection(meData.routeCorrection)
          if (meData.routeCorrection.available) {
            setShowRouteCorrectionTooltip(true)
          }
        }
        
        if (!meData.phone) {
          setShowPhoneModal(true)
        }
        
        if (meData.therapist) {
          setTherapist(meData.therapist)
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
    if (!routeCorrection?.available) {
      setShowMinAnalysesModal(true)
      return
    }
    setShowRouteCorrectionTooltip(false)
    router.push('/dashboard/route-correction')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <Logo size="lg" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-purple-700">
                  Radar Match
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Coach de Relacionamentos
                </span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex gap-3 sm:gap-4 items-center">
              <Link
                href="/account"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Minha Conta
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Sair
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-6 animate-slide-in-right">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <nav className="mt-12 flex flex-col gap-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 py-3 border-b border-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Minha Conta</span>
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 py-3 border-b border-gray-100 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minhas Análises</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Backdrop para fechar tooltip ao clicar fora */}
            {showRouteCorrectionTooltip && routeCorrection?.available && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowRouteCorrectionTooltip(false)}
              />
            )}
            
            {/* Botão de Análise de Comportamento */}
            {analyses.length >= 1 && (
              <div className="relative">
                {showRouteCorrectionTooltip && routeCorrection?.available && (
                  <div className="absolute top-full right-0 mt-3 w-72 sm:w-80 z-50">
                    <div className="bg-gray-900 text-white text-sm rounded-xl p-4 shadow-xl relative">
                      <button
                        onClick={() => setShowRouteCorrectionTooltip(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="font-bold text-yellow-400">Novidade!</span>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          PRO
                        </span>
                      </div>
                      <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                        Descubra se você está evoluindo na atração de pessoas com mesmas intenções!
                      </p>
                      <div className="absolute -top-2 right-8 w-4 h-4 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleRouteCorrectionClick}
                  className={`relative w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm ${
                    routeCorrection?.available
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 ring-2 ring-purple-400 ring-offset-2'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Analisar meu comportamento</span>
                  <span className="sm:hidden">Analisar comportamento</span>
                  {routeCorrection?.available && (
                    <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {routeCorrection.activeAnalysesCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {/* Botão WhatsApp Terapeuta */}
            {therapist?.whatsapp && (
              <button
                onClick={() => setShowTherapistDisclaimer(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Falar com Terapeuta</span>
              </button>
            )}
            
            {/* Botão Nova Análise */}
            <Link
              href="/dashboard/new"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg text-sm"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nova Análise</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl text-center max-w-2xl mx-auto border border-purple-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
            
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <BarChart3 className="relative h-14 w-14 sm:h-16 sm:w-16 text-purple-600" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Pare de se enganar
            </h2>
            <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Faça uma análise <strong className="text-purple-600">objetiva</strong> do seu match baseada em estudos e dinâmicas atuais do Tinder.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {[
                { icon: Brain, color: "purple", label: "Baseado em Estudos" },
                { icon: TrendingUp, color: "pink", label: "Dinâmicas Atuais" },
                { icon: Shield, color: "purple", label: "100% Objetivo" },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center p-4 rounded-xl bg-${item.color}-50 border border-${item.color}-100`}>
                  <item.icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${item.color}-600 mb-2`} />
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">{item.label}</p>
                </div>
              ))}
            </div>
            
            <div className="relative inline-block">
              {/* 4 camadas de ondas de pulso */}
              <div className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-cta-pulse" />
              <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-25 animate-cta-pulse animation-delay-150" />
              <div className="absolute inset-0 -m-6 rounded-2xl bg-gradient-to-r from-purple-300 to-pink-300 opacity-20 animate-cta-pulse animation-delay-300" />
              <div className="absolute inset-0 -m-8 rounded-2xl bg-gradient-to-r from-purple-200 to-pink-200 opacity-15 animate-cta-pulse animation-delay-450" />
              
              <Link
                href="/dashboard/new"
                className="relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 sm:px-12 py-4 rounded-2xl text-base sm:text-lg font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                Analisar Agora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => {
              const gradientColor = analysis.hasRedFlag 
                ? 'from-red-500 via-red-400 to-orange-500'
                : analysis.hasGreenFlag 
                ? 'from-green-500 via-emerald-500 to-teal-500'
                : 'from-purple-600 via-purple-500 to-purple-700'
              
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
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor}`}></div>
                  
                  <div className="relative p-4 sm:p-6">
                    {/* Status badge */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      {analysis.isPaid || plan === 'PRO' ? (
                        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                          Completo
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                          Prévia
                        </span>
                      )}
                    </div>
                    
                    {/* Nome e Avatar */}
                    <div className="flex flex-col items-center text-center mb-3 sm:mb-4 pt-2">
                      {getGeneroImage(analysis.genero_match) && (
                        <div className="relative mb-2 sm:mb-3">
                          <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} rounded-full blur-md opacity-50`}></div>
                          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                            <Image
                              src={getGeneroImage(analysis.genero_match) as string}
                              alt={analysis.genero_match === 'ELE' ? 'Homem' : 'Mulher'}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain p-1.5 sm:p-2"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {analysis.hasRedFlag && (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        )}
                        <h3 className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                          {analysis.nome_match || 'Crush sem nome'}
                        </h3>
                        {analysis.hasGreenFlag && (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        )}
                      </div>
                      
                      {analysis.headline && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 line-clamp-2 max-w-md px-4">
                          {analysis.headline}
                        </p>
                      )}
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      {analysis.riskScore && (
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${getRiskColor(analysis.riskScore.value)}`}>
                          {analysis.riskScore.label}: {analysis.riskScore.value}%
                        </span>
                      )}
                      {analysis.compatScore !== null && analysis.compatScore !== undefined && (
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                          analysis.compatScore >= 65 ? 'text-green-600 bg-green-50' :
                          analysis.compatScore >= 45 ? 'text-yellow-600 bg-yellow-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          Compatibilidade: {analysis.compatScore}%
                        </span>
                      )}
                    </div>
                    
                    {/* Data e estágio */}
                    <div className="flex justify-center items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                      <span>{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{getStageLabel(analysis.stage)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Modal de mínimo de análises */}
        {showMinAnalysesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
              <button
                onClick={() => setShowMinAnalysesModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 mb-4">
                  <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {routeCorrection?.neededForNext === 1 
                    ? 'Falta só mais uma análise nova' 
                    : `Faltam ${routeCorrection?.neededForNext || 2} análises novas`}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  {routeCorrection?.isFirstTime 
                    ? 'Para gerar sua primeira Análise de Comportamento, você precisa ter pelo menos 3 análises de matches diferentes.'
                    : 'Para gerar uma nova Análise de Comportamento, você precisa fazer pelo menos 2 novas análises.'
                  }
                </p>
                {routeCorrection && routeCorrection.activeAnalysesCount > 0 && (
                  <p className="text-sm text-purple-600 mb-4 bg-purple-50 px-4 py-2 rounded-lg">
                    Você tem {routeCorrection.activeAnalysesCount} análise{routeCorrection.activeAnalysesCount > 1 ? 's' : ''} nova{routeCorrection.activeAnalysesCount > 1 ? 's' : ''}.
                  </p>
                )}
                <Link href="/dashboard/new">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition inline-flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Fazer nova análise</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal Disclaimer Terapeuta */}
        {showTherapistDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowTherapistDisclaimer(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 mb-4">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Aviso Importante</h3>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 text-left">
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                    Os especialistas parceiros oferecem <strong className="text-gray-900">orientação em relacionamentos</strong> e não substituem acompanhamento médico ou psicológico.
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    O Radar Match atua como <strong className="text-gray-900">intermediador</strong> e não se responsabiliza pelas orientações prestadas.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    <span className="text-red-700 font-semibold text-xs sm:text-sm">Precisa de ajuda urgente?</span>
                  </div>
                  <p className="text-red-600 text-xs sm:text-sm mb-2 sm:mb-3">
                    Se você está em crise emocional ou precisa de apoio imediato:
                  </p>
                  <a 
                    href="tel:188" 
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    CVV - Ligue 188
                  </a>
                  <p className="text-red-500 text-[10px] sm:text-xs mt-2">
                    Centro de Valorização da Vida • 24h • Gratuito
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={() => setShowTherapistDisclaimer(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <a
                    href={`https://wa.me/55${therapist?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowTherapistDisclaimer(false)}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Entendi, continuar
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de telefone */}
        <PhoneInputModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSave={(phone) => {
            setShowPhoneModal(false)
          }}
          userName={userName}
        />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        /* Animações de pulso para CTAs */
        @keyframes cta-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .animate-cta-pulse {
          animation: cta-pulse 2s ease-out infinite;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-450 {
          animation-delay: 0.45s;
        }
      `}</style>
    </div>
  )
}
