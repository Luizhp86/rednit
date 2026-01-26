'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { PhoneInputModal } from '@/components/phone-input-modal'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles, Compass, X, AlertTriangle, CheckCircle2, MessageCircle, Heart, Phone } from 'lucide-react'

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:66',message:'LOAD_START',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6,H9'})}).catch(()=>{});
      // #endregion

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:75',message:'AUTH_CHECK',data:{hasUser:!!user,userId:user?.id,email:user?.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6,H8'})}).catch(()=>{});
      // #endregion

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load analyses
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:89',message:'ANALYSES_FETCH_START',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7,H9'})}).catch(()=>{});
      // #endregion
      
      const res = await fetch('/api/analyses')
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:96',message:'ANALYSES_FETCH_RESPONSE',data:{ok:res.ok,status:res.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
      
      if (res.ok) {
        const data = await res.json()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:104',message:'ANALYSES_DATA_RECEIVED',data:{isArray:Array.isArray(data),length:data?.length,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H8'})}).catch(()=>{});
        // #endregion
        setAnalyses(data)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:109',message:'ANALYSES_STATE_SET',data:{count:data?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H8'})}).catch(()=>{});
        // #endregion
      }

      // Load plan info and route correction status
      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        setPlan(meData.plan)
        setUserName(meData.name)
        
        // Set route correction info
        if (meData.routeCorrection) {
          setRouteCorrection(meData.routeCorrection)
          
          // Show tooltip whenever route correction is available
          if (meData.routeCorrection.available) {
            setShowRouteCorrectionTooltip(true)
          }
        }
        
        // Mostrar modal de telefone se usuário não tem telefone cadastrado
        if (!meData.phone) {
          setShowPhoneModal(true)
        }
        
        // Setar terapeuta atribuído (se houver)
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
    // Check if route correction is available (needs 2+ active analyses)
    if (!routeCorrection?.available) {
      setShowMinAnalysesModal(true)
      return
    }

    // Hide tooltip when user clicks
    setShowRouteCorrectionTooltip(false)
    router.push('/dashboard/route-correction')
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
                  <Compass className="w-5 h-5" />
                  Analisar meu comportamento com I.A.
                  {/* Contador de análises quando disponível */}
                  {routeCorrection?.available && (
                    <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {routeCorrection.activeAnalysesCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            {/* Botão de WhatsApp para falar com terapeuta */}
            {therapist?.whatsapp && (
              <button
                onClick={() => setShowTherapistDisclaimer(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl ring-2 ring-green-400 ring-offset-2 animate-pulse-subtle"
              >
                {/* Efeito de brilho shimmer */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></span>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg blur-md opacity-50 -z-10"></div>
                <MessageCircle className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Falar com Terapeuta</span>
              </button>
            )}
            <Link
              href="/dashboard/new"
              className="group relative overflow-hidden bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition inline-flex items-center gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></span>
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Nova Análise</span>
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
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Gradiente no topo */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientColor}`}></div>
                  
                  {/* Glow effect de fundo */}
                  <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-r ${gradientColor}`}></div>
                  
                  <div className="relative p-6">
                    {/* Status badge no topo direito */}
                    <div className="absolute top-4 right-4">
                      {analysis.isPaid || plan === 'PRO' ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          Completo
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          Prévia
                        </span>
                      )}
                    </div>
                    
                    {/* Nome do match centralizado e em destaque */}
                    <div className="flex flex-col items-center text-center mb-4 pt-2">
                      {/* Imagem do gênero */}
                      {getGeneroImage(analysis.genero_match) && (
                        <div className="relative mb-3">
                          <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} rounded-full blur-md opacity-50`}></div>
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                            <Image
                              src={getGeneroImage(analysis.genero_match) as string}
                              alt={analysis.genero_match === 'ELE' ? 'Imagem de homem' : 'Imagem de mulher'}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Nome com efeitos */}
                      <div className="flex items-center justify-center gap-2">
                        {analysis.hasRedFlag && (
                          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                        )}
                        <h3 className={`text-2xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                          {analysis.nome_match ? analysis.nome_match : 'Crush sem nome'}
                        </h3>
                        {analysis.hasGreenFlag && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      {/* Headline resumido */}
                      {analysis.headline && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 max-w-md">
                          {analysis.headline}
                        </p>
                      )}
                    </div>
                    
                    {/* Badges de risco e compatibilidade */}
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {analysis.riskScore && (
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${getRiskColor(analysis.riskScore.value)}`}>
                          {analysis.riskScore.label}: {analysis.riskScore.value}%
                        </span>
                      )}
                      {analysis.compatScore !== null && analysis.compatScore !== undefined && (
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                          analysis.compatScore >= 65 ? 'text-green-600 bg-green-50' :
                          analysis.compatScore >= 45 ? 'text-yellow-600 bg-yellow-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          Compatibilidade: {analysis.compatScore}%
                        </span>
                      )}
                    </div>
                    
                    {/* Data e estágio */}
                    <div className="flex justify-center items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{getStageLabel(analysis.stage)}</span>
                    </div>
                    
                    {/* Indicador de hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                  <button className="group relative overflow-hidden bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition inline-flex items-center gap-2">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></span>
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Fazer nova análise</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* Modal de Disclaimer para falar com terapeuta */}
        {showTherapistDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowTherapistDisclaimer(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Aviso Importante</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <p className="text-gray-600 text-sm mb-3">
                    Os especialistas parceiros do Radar Match oferecem <strong className="text-gray-900">orientação em relacionamentos</strong> e não substituem acompanhamento médico ou psicológico profissional.
                  </p>
                  <p className="text-gray-600 text-sm">
                    O Radar Match atua apenas como <strong className="text-gray-900">intermediador</strong> e não se responsabiliza pelo conteúdo das conversas ou orientações prestadas pelos especialistas.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-semibold text-sm">Precisa de ajuda urgente?</span>
                  </div>
                  <p className="text-red-600 text-sm mb-3">
                    Se você está passando por uma crise emocional, pensamentos suicidas ou precisa de apoio imediato:
                  </p>
                  <a 
                    href="tel:188" 
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    CVV - Ligue 188
                  </a>
                  <p className="text-red-500 text-xs mt-2">
                    Centro de Valorização da Vida • 24 horas • Gratuito
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowTherapistDisclaimer(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <a
                    href={`https://wa.me/55${therapist?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar com você.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowTherapistDisclaimer(false)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Entendi, continuar
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de telefone para novos usuários */}
        <PhoneInputModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSave={(phone) => {
            setShowPhoneModal(false)
            // Lead SIGNUP é gerado automaticamente pelo endpoint /api/me PATCH
          }}
          userName={userName}
        />
      </div>
    </div>
  )
}
