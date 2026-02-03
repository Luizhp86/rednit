'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { PhoneInputModal } from '@/components/phone-input-modal'
import { PageLoader } from '@/components/page-loader'
import { FloatingLoader } from '@/components/floating-loader'
import { OnboardingTour, OnboardingStep } from '@/components/onboarding-tour'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles, Compass, X, AlertTriangle, CheckCircle2, MessageCircle, Heart, Phone, Menu, LogOut, User, ChevronRight, Flame, Target, Zap, Trash2 } from 'lucide-react'

type Analysis = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  nome_match?: string | null
  genero_match?: 'ELE' | 'ELA' | null
  signo_match?: string | null
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
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardPageInner />
    </Suspense>
  )
}

function DashboardPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showWelcomeLoader, setShowWelcomeLoader] = useState(false)
  // Modelo B2B: Leads não têm planos - todos têm acesso completo
  const [routeCorrection, setRouteCorrection] = useState<RouteCorrection | null>(null)
  const [showMinAnalysesModal, setShowMinAnalysesModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [specialist, setSpecialist] = useState<{
    id: string
    name: string
    whatsapp: string | null
    photoUrl: string | null
  } | null>(null)
  const [showSpecialistModal, setShowSpecialistModal] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [submittingLead, setSubmittingLead] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasFormsAvailable, setHasFormsAvailable] = useState<boolean>(true) // Por padrão, assumir que há formulários (otimista)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [loadingRouteCorrection, setLoadingRouteCorrection] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false)
  const [showPostFirstAnalysisOnboarding, setShowPostFirstAnalysisOnboarding] = useState(false)
  const [shouldShowPostFirstAnalysisOnboarding, setShouldShowPostFirstAnalysisOnboarding] = useState(false)
  const [highlightSpecialistButton, setHighlightSpecialistButton] = useState(false)

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

  // Ref para controlar o timer do welcome loader (evita cancelamento em re-renders)
  const welcomeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const welcomeLoaderShownRef = useRef(false)
  
  // Mostrar loader de boas-vindas quando usuário acabou de logar
  useEffect(() => {
    const welcome = searchParams.get('welcome')
    
    // Só executa uma vez por sessão de login
    if (welcome === 'true' && !welcomeLoaderShownRef.current) {
      welcomeLoaderShownRef.current = true
      setShowWelcomeLoader(true)
      console.log('[DASHBOARD] ✅ Mostrando welcome loader por 5 segundos')
      
      // Remove a query param da URL sem recarregar a página
      const url = new URL(window.location.href)
      url.searchParams.delete('welcome')
      window.history.replaceState({}, '', url.toString())
      
      // Esconde o loader após 5 segundos
      welcomeTimerRef.current = setTimeout(() => {
        console.log('[DASHBOARD] ⏱️ Welcome loader timeout - escondendo')
        setShowWelcomeLoader(false)
        welcomeTimerRef.current = null
      }, 5000)
    }
    
    // NÃO cancela o timer no cleanup de re-render
    // Isso evita que o timer seja cancelado quando searchParams muda
  }, [searchParams])
  
  // Cleanup do timer apenas no unmount do componente
  useEffect(() => {
    return () => {
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current)
        welcomeTimerRef.current = null
      }
    }
  }, [])

  // Mostrar onboarding APÓS o loading terminar e elementos estarem renderizados
  useEffect(() => {
    // Só tentar mostrar onboarding quando não estiver carregando
    if (!loading && shouldShowOnboarding && !showOnboarding && !showPhoneModal) {
      // O elemento existe tanto quando hasFormsAvailable é true quanto false
      // (adicionamos o atributo no botão desabilitado também)
      console.log('[DASHBOARD] ===== TENTANDO MOSTRAR ONBOARDING APÓS LOADING =====')
      console.log('[DASHBOARD] hasFormsAvailable:', hasFormsAvailable)
      console.log('[DASHBOARD] O elemento deve existir em ambos os casos (botão habilitado ou desabilitado)')
      
      let retryCount = 0
      const maxRetries = 10
      const delay = 300
      
      const attempt = () => {
        retryCount++
        console.log(`[DASHBOARD] Tentativa ${retryCount}/${maxRetries} - Procurando elemento...`)
        
        const targetElement = document.querySelector('[data-onboarding="nova-analise"]')
        console.log(`[DASHBOARD] Elemento encontrado?`, !!targetElement)
        console.log(`[DASHBOARD] analyses.length:`, analyses.length)
        console.log(`[DASHBOARD] hasFormsAvailable:`, hasFormsAvailable)
        
        if (targetElement) {
          console.log('[DASHBOARD] ✅ Elemento encontrado, mostrando onboarding!')
          setShowOnboarding(true)
        } else if (retryCount < maxRetries) {
          console.log(`[DASHBOARD] ⏳ Elemento não encontrado, tentando novamente em ${delay}ms...`)
          setTimeout(attempt, delay)
        } else {
          console.error('[DASHBOARD] ❌ Elemento não encontrado após todas as tentativas')
          console.error('[DASHBOARD] Verificando elementos disponíveis...')
          const allElements = document.querySelectorAll('[data-onboarding]')
          console.error('[DASHBOARD] Elementos encontrados:', Array.from(allElements).map(el => el.getAttribute('data-onboarding')))
          console.error('[DASHBOARD] ⚠️ O elemento deveria existir - pode ser problema de renderização')
        }
      }
      
      // Aguardar um pouco para garantir que o DOM está completamente renderizado
      const timer = setTimeout(attempt, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [loading, shouldShowOnboarding, showOnboarding, showPhoneModal, analyses.length, hasFormsAvailable])
  
  // Monitorar mudanças de estado para debug
  useEffect(() => {
    console.log('[DASHBOARD STATE] ===== MUDANÇA DE ESTADO =====')
    console.log('[DASHBOARD STATE] showWelcomeLoader:', showWelcomeLoader)
    console.log('[DASHBOARD STATE] loading:', loading)
    console.log('[DASHBOARD STATE] showPhoneModal:', showPhoneModal)
    console.log('[DASHBOARD STATE] showOnboarding:', showOnboarding)
    console.log('[DASHBOARD STATE] shouldShowOnboarding:', shouldShowOnboarding)
    console.log('[DASHBOARD STATE] hasFormsAvailable:', hasFormsAvailable)
    console.log('[DASHBOARD STATE] analyses.length:', analyses.length)
    
    // Log para debug: verificar se modal deveria estar visível
    if (showPhoneModal && !showWelcomeLoader && !loading) {
      console.log('[DASHBOARD STATE] ✅ Modal de telefone DEVERIA estar visível agora!')
    } else if (showPhoneModal && (showWelcomeLoader || loading)) {
      console.log('[DASHBOARD STATE] ⏳ Modal de telefone está pendente (aguardando welcome/loading)')
    }
    
    // Verificar elementos do DOM quando não está carregando
    if (!loading && !showWelcomeLoader) {
      const targetElement = document.querySelector('[data-onboarding="nova-analise"]')
      console.log('[DASHBOARD STATE] Elemento [data-onboarding="nova-analise"] existe?', !!targetElement)
      if (targetElement) {
        console.log('[DASHBOARD STATE] Elemento encontrado:', targetElement)
      }
    }
  }, [showOnboarding, shouldShowOnboarding, hasFormsAvailable, loading, analyses.length, showPhoneModal, showWelcomeLoader])

  // Mostrar onboarding pós-primeira análise APÓS o loading terminar e elementos estarem renderizados
  useEffect(() => {
    // Só tentar mostrar onboarding pós-primeira análise quando:
    // - Não estiver carregando
    // - Deve mostrar (shouldShowPostFirstAnalysisOnboarding)
    // - Não está mostrando ainda (showPostFirstAnalysisOnboarding)
    // - Não está mostrando o modal de telefone
    // - Não está mostrando o onboarding inicial
    if (!loading && shouldShowPostFirstAnalysisOnboarding && !showPostFirstAnalysisOnboarding && !showPhoneModal && !showOnboarding) {
      console.log('[DASHBOARD] ===== TENTANDO MOSTRAR ONBOARDING PÓS-PRIMEIRA ANÁLISE =====')
      console.log('[DASHBOARD] analyses.length:', analyses.length)
      
      let retryCount = 0
      const maxRetries = 10
      const delay = 300
      
      const attempt = () => {
        retryCount++
        console.log(`[DASHBOARD POST-FIRST] Tentativa ${retryCount}/${maxRetries} - Procurando elementos...`)
        
        // Verificar se os elementos alvo existem
        const evolucaoElement = document.querySelector('[data-onboarding="evolucao-comportamento"]')
        const especialistaElement = document.querySelector('[data-onboarding="falar-especialista"]')
        
        console.log(`[DASHBOARD POST-FIRST] Elemento evolucao encontrado?`, !!evolucaoElement)
        console.log(`[DASHBOARD POST-FIRST] Elemento especialista encontrado?`, !!especialistaElement)
        
        if (evolucaoElement && especialistaElement) {
          console.log('[DASHBOARD POST-FIRST] ✅ Elementos encontrados, mostrando onboarding!')
          setShowPostFirstAnalysisOnboarding(true)
        } else if (retryCount < maxRetries) {
          console.log(`[DASHBOARD POST-FIRST] ⏳ Elementos não encontrados, tentando novamente em ${delay}ms...`)
          setTimeout(attempt, delay)
        } else {
          console.error('[DASHBOARD POST-FIRST] ❌ Elementos não encontrados após todas as tentativas')
          console.error('[DASHBOARD POST-FIRST] Verificando elementos disponíveis...')
          const allElements = document.querySelectorAll('[data-onboarding]')
          console.error('[DASHBOARD POST-FIRST] Elementos encontrados:', Array.from(allElements).map(el => el.getAttribute('data-onboarding')))
        }
      }
      
      // Aguardar um pouco para garantir que o DOM está completamente renderizado
      const timer = setTimeout(attempt, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [loading, shouldShowPostFirstAnalysisOnboarding, showPostFirstAnalysisOnboarding, showPhoneModal, showOnboarding, analyses.length])

  useEffect(() => {
    async function loadData() {
      console.log('[DASHBOARD] ===== INICIANDO CARREGAMENTO =====')
      
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log('[DASHBOARD] Usuário não autenticado, redirecionando para login')
        router.push('/login')
        return
      }

      console.log('[DASHBOARD] Usuário autenticado:', user.email)
      setUser(user)

      // Verificar se acabou de voltar da tela de análise de comportamento
      const justCompletedRouteCorrection = localStorage.getItem('just_completed_route_correction') === 'true'
      if (justCompletedRouteCorrection) {
        console.log('[DASHBOARD] Usuário voltou da análise de comportamento - destacando botão especialista')
        setHighlightSpecialistButton(true)
        localStorage.removeItem('just_completed_route_correction')
        
        // Remover destaque após 10 segundos
        setTimeout(() => {
          setHighlightSpecialistButton(false)
          console.log('[DASHBOARD] Removendo destaque do botão especialista')
        }, 10000)
      }

      const res = await fetch('/api/analyses')
      if (res.ok) {
        const data = await res.json()
        console.log('[DASHBOARD] Análises carregadas:', data.length)
        setAnalyses(data)
      } else {
        console.warn('[DASHBOARD] Erro ao carregar análises:', res.status)
      }

      console.log('[DASHBOARD] Buscando dados do usuário em /api/me...')
      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        console.log('[DASHBOARD] ===== DADOS DO USUÁRIO RECEBIDOS =====')
        console.log('[DASHBOARD] meData completo:', JSON.stringify(meData, null, 2))
        
        setUserName(meData.name)
        setUserPhone(meData.phone)
        
        if (meData.routeCorrection) {
          setRouteCorrection(meData.routeCorrection)
        }
        
        if (meData.stats?.totalAnalyses !== undefined) {
          setTotalAnalyses(meData.stats.totalAnalyses)
        }
        
        // Verificar se deve mostrar onboarding
        console.log('[DASHBOARD] ===== VERIFICANDO ONBOARDING =====')
        const hasSeenOnboardingFromDB = meData.hasSeenOnboarding ?? false
        const hasSeenOnboardingFromStorage = localStorage.getItem('onboarding_completed_v1') === 'true'
        
        console.log('[DASHBOARD] hasSeenOnboarding do banco (raw):', meData.hasSeenOnboarding)
        console.log('[DASHBOARD] hasSeenOnboarding do banco (processado):', hasSeenOnboardingFromDB)
        console.log('[DASHBOARD] hasSeenOnboarding do localStorage:', hasSeenOnboardingFromStorage)
        console.log('[DASHBOARD] Tipo de hasSeenOnboardingFromDB:', typeof hasSeenOnboardingFromDB)
        
        // Se o campo do banco é false, mostrar onboarding (mesmo que localStorage diga que completou)
        // Se o campo do banco é true, não mostrar (mesmo que localStorage diga que não completou)
        // Fallback para localStorage apenas se o campo do banco não existir (não deveria acontecer mais)
        const hasSeenOnboarding = typeof hasSeenOnboardingFromDB === 'boolean'
          ? hasSeenOnboardingFromDB
          : hasSeenOnboardingFromStorage
        
        console.log('[DASHBOARD] hasSeenOnboarding final:', hasSeenOnboarding)
        
        const isFirstAccess = !hasSeenOnboarding
        console.log('[DASHBOARD] isFirstAccess:', isFirstAccess)
        setShouldShowOnboarding(isFirstAccess)
        
        if (isFirstAccess) {
          console.log('[DASHBOARD] ✅ PRIMEIRO ACESSO DETECTADO - DEVE MOSTRAR ONBOARDING')
          console.log('[DASHBOARD] Telefone do usuário:', meData.phone ? 'SIM' : 'NÃO')
          // A lógica de mostrar onboarding será tratada em um useEffect separado
          // que só executa quando loading for false
        } else {
          console.log('[DASHBOARD] ❌ Usuário já viu onboarding, não mostrar')
        }
        
        // Verificar se deve mostrar onboarding pós-primeira análise
        console.log('[DASHBOARD] ===== VERIFICANDO ONBOARDING PÓS-PRIMEIRA ANÁLISE =====')
        const hasSeenPostFirstAnalysisOnboardingFromDB = meData.hasSeenPostFirstAnalysisOnboarding ?? false
        const hasSeenPostFirstAnalysisOnboardingFromStorage = localStorage.getItem('post_first_analysis_onboarding_completed_v1') === 'true'
        
        console.log('[DASHBOARD] hasSeenPostFirstAnalysisOnboarding do banco:', hasSeenPostFirstAnalysisOnboardingFromDB)
        console.log('[DASHBOARD] hasSeenPostFirstAnalysisOnboarding do localStorage:', hasSeenPostFirstAnalysisOnboardingFromStorage)
        console.log('[DASHBOARD] totalAnalyses:', meData.stats?.totalAnalyses)
        
        const hasSeenPostFirstAnalysisOnboarding = typeof hasSeenPostFirstAnalysisOnboardingFromDB === 'boolean'
          ? hasSeenPostFirstAnalysisOnboardingFromDB
          : hasSeenPostFirstAnalysisOnboardingFromStorage
        
        // Mostrar onboarding pós-primeira análise se:
        // 1. Usuário tem exatamente 1 análise
        // 2. Ainda não viu o onboarding pós-primeira análise
        // 3. Já viu o onboarding inicial (para não conflitar)
        const shouldShowPostFirstAnalysis = meData.stats?.totalAnalyses === 1 && !hasSeenPostFirstAnalysisOnboarding && hasSeenOnboarding
        console.log('[DASHBOARD] shouldShowPostFirstAnalysis:', shouldShowPostFirstAnalysis)
        setShouldShowPostFirstAnalysisOnboarding(shouldShowPostFirstAnalysis)
        
        if (shouldShowPostFirstAnalysis) {
          console.log('[DASHBOARD] ✅ PRIMEIRA ANÁLISE COMPLETA - DEVE MOSTRAR ONBOARDING PÓS-PRIMEIRA ANÁLISE')
        } else {
          console.log('[DASHBOARD] ❌ Não deve mostrar onboarding pós-primeira análise')
        }
        
        // Mostrar modal de telefone se necessário
        if (!meData.phone) {
          console.log('[DASHBOARD] ✅ Usuário NÃO tem telefone - marcando para mostrar modal')
          setShowPhoneModal(true)
        } else {
          console.log('[DASHBOARD] ℹ️ Usuário já tem telefone cadastrado:', meData.phone)
        }
        
        if (meData.therapist) {
          setSpecialist(meData.therapist)
        }
      } else {
        console.error('[DASHBOARD] ❌ Erro ao buscar dados do usuário:', meRes.status, meRes.statusText)
      }

      console.log('[DASHBOARD] ===== VERIFICANDO FORMULÁRIOS DISPONÍVEIS =====')
      try {
        const formsRes = await fetch('/api/form-themes')
        console.log('[DASHBOARD] Resposta de /api/form-themes:', formsRes.status, formsRes.statusText)
        
        if (formsRes.ok) {
          const formsData = await formsRes.json()
          console.log('[DASHBOARD] Formulários recebidos:', formsData.length)
          console.log('[DASHBOARD] Dados dos formulários:', JSON.stringify(formsData, null, 2))
          
          const hasThemesWithQuestions = formsData.some((theme: any) => theme._count?.questions > 0)
          console.log('[DASHBOARD] Tem temas com perguntas?', hasThemesWithQuestions)
          
          // Log detalhado de cada tema
          formsData.forEach((theme: any, index: number) => {
            console.log(`[DASHBOARD] Tema ${index + 1}:`, theme.name, '- Perguntas:', theme._count?.questions || 0)
          })
          
          // IMPORTANTE: Sempre manter como true se houver pelo menos 1 tema com perguntas
          // Se não houver, só definir como false se realmente não houver nenhum formulário
          const finalValue = hasThemesWithQuestions || formsData.length > 0
          console.log('[DASHBOARD] Definindo hasFormsAvailable como:', finalValue)
          setHasFormsAvailable(finalValue)
        } else {
          // Se a requisição falhar, manter como true (otimista) para não bloquear o usuário
          console.warn('[DASHBOARD] ⚠️ Erro ao buscar formulários, assumindo disponíveis')
          console.warn('[DASHBOARD] Status:', formsRes.status)
          console.warn('[DASHBOARD] StatusText:', formsRes.statusText)
          setHasFormsAvailable(true) // Manter como true mesmo em caso de erro
        }
      } catch (error) {
        // Se der erro, manter como true (otimista) para não bloquear o usuário
        console.error('[DASHBOARD] ❌ Erro ao buscar formulários:', error)
        setHasFormsAvailable(true) // Manter como true mesmo em caso de erro
      }

      console.log('[DASHBOARD] Finalizando carregamento...')
      setLoading(false)
      console.log('[DASHBOARD] ===== CARREGAMENTO FINALIZADO =====')
    }

    loadData()
  }, [router, supabase])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleRouteCorrectionClick = async () => {
    setLoadingRouteCorrection(true)
    
    // Simular tempo de análise para gerar expectativa
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (!routeCorrection?.available) {
      setLoadingRouteCorrection(false)
      setShowMinAnalysesModal(true)
      return
    }
    
    // Marcar que está indo para route correction
    localStorage.setItem('visiting_route_correction', 'true')
    router.push('/dashboard/route-correction')
  }

  const handleDeleteAnalysis = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id))
        setDeleteConfirm(null)
      } else {
        alert('Erro ao excluir análise')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir análise')
    } finally {
      setDeleting(false)
    }
  }

  const handleOnboardingComplete = async () => {
    console.log('[ONBOARDING] ✅ Onboarding completado pelo usuário')
    
    // IMPORTANTE: Atualizar shouldShowOnboarding primeiro para evitar loop
    setShouldShowOnboarding(false)
    setShowOnboarding(false)
    
    // Salvar também no localStorage como fallback
    localStorage.setItem('onboarding_completed_v1', 'true')
    console.log('[ONBOARDING] Salvo no localStorage')
    
    // Atualizar flag no banco de dados (se o campo existir)
    try {
      console.log('[ONBOARDING] Atualizando hasSeenOnboarding no banco...')
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenOnboarding: true })
      })
      if (res.ok) {
        console.log('[ONBOARDING] ✅ hasSeenOnboarding atualizado no banco com sucesso')
      } else {
        console.error('[ONBOARDING] ❌ Erro ao atualizar no banco:', res.status, res.statusText)
      }
    } catch (error) {
      // Silenciosamente ignora erro se o campo não existe no banco ainda
      console.warn('[ONBOARDING] ⚠️ Erro ao atualizar no banco:', error)
      console.warn('[ONBOARDING] Usando localStorage (migration pendente)')
    }
  }

  const handleOnboardingSkip = async () => {
    console.log('[ONBOARDING] ⏭️ Onboarding pulado pelo usuário')
    
    // IMPORTANTE: Atualizar shouldShowOnboarding primeiro para evitar loop
    setShouldShowOnboarding(false)
    setShowOnboarding(false)
    
    // Salvar também no localStorage como fallback
    localStorage.setItem('onboarding_completed_v1', 'true')
    console.log('[ONBOARDING] Salvo no localStorage')
    
    // Atualizar flag no banco de dados (se o campo existir)
    try {
      console.log('[ONBOARDING] Atualizando hasSeenOnboarding no banco...')
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenOnboarding: true })
      })
      if (res.ok) {
        console.log('[ONBOARDING] ✅ hasSeenOnboarding atualizado no banco com sucesso')
      } else {
        console.error('[ONBOARDING] ❌ Erro ao atualizar no banco:', res.status, res.statusText)
      }
    } catch (error) {
      // Silenciosamente ignora erro se o campo não existe no banco ainda
      console.warn('[ONBOARDING] ⚠️ Erro ao atualizar no banco:', error)
      console.warn('[ONBOARDING] Usando localStorage (migration pendente)')
    }
  }

  const handlePostFirstAnalysisOnboardingComplete = async () => {
    console.log('[ONBOARDING POST-FIRST] ✅ Onboarding pós-primeira análise completado')
    
    // IMPORTANTE: Atualizar shouldShow primeiro para evitar loop
    setShouldShowPostFirstAnalysisOnboarding(false)
    setShowPostFirstAnalysisOnboarding(false)
    
    // Salvar no localStorage como fallback
    localStorage.setItem('post_first_analysis_onboarding_completed_v1', 'true')
    console.log('[ONBOARDING POST-FIRST] Salvo no localStorage')
    
    // Atualizar flag no banco de dados
    try {
      console.log('[ONBOARDING POST-FIRST] Atualizando hasSeenPostFirstAnalysisOnboarding no banco...')
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenPostFirstAnalysisOnboarding: true })
      })
      if (res.ok) {
        console.log('[ONBOARDING POST-FIRST] ✅ hasSeenPostFirstAnalysisOnboarding atualizado no banco com sucesso')
      } else {
        console.error('[ONBOARDING POST-FIRST] ❌ Erro ao atualizar no banco:', res.status, res.statusText)
        console.error('[ONBOARDING POST-FIRST] 💡 Dica: Reinicie o servidor (npm run dev) para atualizar o Prisma Client')
      }
    } catch (error) {
      console.warn('[ONBOARDING POST-FIRST] ⚠️ Erro ao atualizar no banco:', error)
      console.warn('[ONBOARDING POST-FIRST] Usando localStorage como fallback')
    }
  }

  const handlePostFirstAnalysisOnboardingSkip = async () => {
    console.log('[ONBOARDING POST-FIRST] ⏭️ Onboarding pós-primeira análise pulado')
    
    // IMPORTANTE: Atualizar shouldShow primeiro para evitar loop
    setShouldShowPostFirstAnalysisOnboarding(false)
    setShowPostFirstAnalysisOnboarding(false)
    
    // Salvar no localStorage como fallback
    localStorage.setItem('post_first_analysis_onboarding_completed_v1', 'true')
    console.log('[ONBOARDING POST-FIRST] Salvo no localStorage')
    
    // Atualizar flag no banco de dados
    try {
      console.log('[ONBOARDING POST-FIRST] Atualizando hasSeenPostFirstAnalysisOnboarding no banco...')
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenPostFirstAnalysisOnboarding: true })
      })
      if (res.ok) {
        console.log('[ONBOARDING POST-FIRST] ✅ hasSeenPostFirstAnalysisOnboarding atualizado no banco com sucesso')
      } else {
        console.error('[ONBOARDING POST-FIRST] ❌ Erro ao atualizar no banco:', res.status, res.statusText)
        console.error('[ONBOARDING POST-FIRST] 💡 Dica: Reinicie o servidor (npm run dev) para atualizar o Prisma Client')
      }
    } catch (error) {
      console.warn('[ONBOARDING POST-FIRST] ⚠️ Erro ao atualizar no banco:', error)
      console.warn('[ONBOARDING POST-FIRST] Usando localStorage como fallback')
    }
  }

  // Steps do onboarding - adapta baseado no estado (com ou sem análises)
  const onboardingSteps: OnboardingStep[] = analyses.length === 0 
    ? [
        // Empty state - apenas 2 steps
        {
          target: 'nova-analise',
          title: 'Comece por aqui',
          description: 'Crie sua primeira análise respondendo perguntas sobre seu match. Leva menos de 3 minutos e você recebe insights completos!',
          position: 'right', // Ao lado direito do botão
        },
        {
          target: 'area-analises',
          title: 'Suas análises',
          description: 'Aqui você verá todas as análises que fizer. Cada análise traz scores, alertas e dicas práticas para seus relacionamentos.',
          position: 'right', // Ao lado direito da área
        },
      ]
    : [
        // Com análises - 4 steps completos
        {
          target: 'nova-analise',
          title: 'Nova análise',
          description: 'Crie novas análises sempre que quiser entender melhor seus matches.',
          position: 'right', // Ao lado direito do botão
        },
        {
          target: 'area-analises',
          title: 'Suas análises',
          description: 'Acesse o histórico completo de todas as suas análises. Clique em qualquer card para ver os detalhes.',
          position: 'right', // Ao lado direito da área
        },
        {
          target: 'evolucao-comportamento',
          title: 'Evolução do comportamento',
          description: 'Após 3 análises, desbloqueie insights sobre seus padrões de comportamento e receba orientações personalizadas.',
          position: 'right', // Ao lado direito do botão
        },
        {
          target: 'falar-especialista',
          title: 'Fale com um especialista',
          description: 'Receba orientação personalizada sobre relacionamentos direto com nosso time de especialistas.',
          position: 'right', // Ao lado direito do botão
        },
      ]

  // Steps do onboarding pós-primeira análise (aparece quando o usuário tem exatamente 1 análise)
  const postFirstAnalysisOnboardingSteps: OnboardingStep[] = [
    {
      target: 'evolucao-comportamento',
      title: 'Analisar minha evolução',
      description: 'Após 3 análises completas, você poderá desbloquear uma análise especial sobre seus padrões de comportamento nos relacionamentos. Isso te ajudará a entender melhor suas escolhas e decisões!',
      position: 'bottom',
    },
    {
      target: 'falar-especialista',
      title: 'Falar com um especialista',
      description: 'Tem dúvidas sobre sua análise ou quer uma orientação mais personalizada? Clique aqui para falar via whatsapp com nosso time de especialistas em relacionamentos. Estamos aqui para te ajudar!',
      position: 'bottom',
    },
  ]

  // Mostrar loader de boas-vindas após login
  if (showWelcomeLoader) {
    return (
      <FloatingLoader message="Bem vindo ao seu coach de relacionamentos" />
    )
  }

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
        
        <div className="relative z-10 container mx-auto px-4 py-10 sm:py-14">
          <div className="h-14 bg-purple-100/50 rounded-xl w-72 mb-10 animate-pulse" />
          <div className="grid gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-purple-100 p-7 rounded-3xl shadow-lg animate-pulse">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-purple-100/50" />
                  <div className="flex-1 space-y-3">
                    <div className="h-7 bg-purple-100/50 rounded-lg w-44" />
                    <div className="h-5 bg-purple-50 rounded-lg w-72" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay">
      {/* Loader de tela cheia para análise de comportamento */}
      {loadingRouteCorrection && (
        <div className="fixed inset-0 z-[100]">
          <PageLoader message="Analisando sua evolução..." />
        </div>
      )}

      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Main purple glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px] animate-float" />
        {/* Secondary pink glow */}
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-float-delayed" />
        {/* Accent orange glow */}
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-orange-200/30 rounded-full blur-[80px]" />
        {/* Subtle grid pattern */}
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
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold text-purple-700">
                  Radar Match
                </span>
                <span className="text-xs text-gray-500 hidden md:block">
                  Seu coach de relacionamentos
                </span>
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10 sm:mb-14 animate-fade-in-up">
          <div>
            <p className="text-purple-500 font-semibold text-sm mb-2 tracking-wide uppercase">Dashboard</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Minhas <span className="text-gradient-primary">relações analisadas</span>
            </h1>
          </div>
          
          {/* Botões de ação - só aparecem quando há análises */}
          {analyses.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-200">
              {/* Botão de Análise de Comportamento */}
              {analyses.length >= 1 && (
                <div className="relative group">
                  {/* Multi-layer pulsing glow effect quando desbloqueado */}
                  {routeCorrection?.available && (
                    <>
                      {/* Outer glow - pulsa lentamente */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600 rounded-2xl blur-2xl opacity-60 animate-pulse-glow" />
                      {/* Middle glow - pulsa médio */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-2xl blur-xl opacity-70 animate-pulse-glow-fast" />
                      {/* Inner glow - sempre visível */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                    </>
                  )}
                  <button
                    onClick={handleRouteCorrectionClick}
                    disabled={loadingRouteCorrection}
                    data-onboarding="evolucao-comportamento"
                    className={`relative w-full sm:w-auto px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 text-sm ${
                      routeCorrection?.available
                        ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-2 border-purple-400/50 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 animate-subtle-bounce'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${routeCorrection?.available ? 'bg-white/20' : 'bg-gray-200'}`}>
                      <Compass className={`w-4 h-4 ${routeCorrection?.available ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <span>Analisar minha evolução</span>
                    {routeCorrection?.available && (
                      <>
                        <span className="bg-white/25 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full font-bold border border-white/30 animate-pulse">
                          {routeCorrection.activeAnalysesCount}
                        </span>
                        {/* Badge "NOVO!" pulsante */}
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg animate-bounce-subtle">
                          Novo!
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Botão Falar com Especialista - aparece quando tem análises */}
              {analyses.length > 0 && (
                <div className="relative group">
                  {/* Multi-layer pulsing glow effect quando destacado */}
                  {highlightSpecialistButton ? (
                    <>
                      {/* Outer glow - pulsa lentamente */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 rounded-2xl blur-2xl opacity-60 animate-pulse-glow" />
                      {/* Middle glow - pulsa médio */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-xl opacity-70 animate-pulse-glow-fast" />
                      {/* Inner glow - sempre visível */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                    </>
                  ) : (
                    /* Glow effect normal */
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                  )}
                  <button
                    onClick={() => setShowSpecialistModal(true)}
                    data-onboarding="falar-especialista"
                    className={`relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 border-2 border-emerald-400/50 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] text-sm ${
                      highlightSpecialistButton ? 'animate-subtle-bounce' : ''
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white/20">
                      <MessageCircle className={`w-4 h-4 ${highlightSpecialistButton ? 'animate-pulse' : ''}`} />
                    </div>
                    <span>Falar com Especialista</span>
                    {highlightSpecialistButton && (
                      <>
                        {/* Badge "RECOMENDADO!" pulsante */}
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg animate-bounce-subtle">
                          Recomendado!
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Botão Nova Análise */}
              {hasFormsAvailable ? (
                <div className="relative group">
                  {/* Animated glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-pulse-slow" />
                  <Link
                    href="/dashboard/new"
                    data-onboarding="nova-analise"
                    className="relative group/btn w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-7 py-4 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center gap-3 border-2 border-purple-400/50 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] text-sm overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <div className="relative flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Nova Análise</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </Link>
                </div>
              ) : (
                <div 
                  className="w-full sm:w-auto bg-gray-100 text-gray-400 px-7 py-4 rounded-2xl font-bold cursor-not-allowed inline-flex items-center justify-center gap-3 text-sm border-2 border-gray-200"
                  title="Nenhum formulário disponível no momento"
                >
                  <div className="p-1.5 rounded-lg bg-gray-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>Nova Análise</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <div className="animate-fade-in-up animation-delay-300" data-onboarding="area-analises">
            <div className="relative max-w-3xl mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-300/30 rounded-full blur-3xl" />
              
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-purple-100 shadow-xl p-8 sm:p-14 text-center overflow-hidden">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                
                {/* Icon */}
                <div className="relative inline-flex mb-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
                  <div className="relative p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border border-purple-200">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                  Hora de analisar seu <span className="text-gradient-primary">crush</span>
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  Responda algumas perguntas sobre seu match e receba uma <span className="text-purple-600 font-semibold">análise completa</span> com riscos, compatibilidade e dicas práticas.
                </p>
                
                {/* How it works - 3 steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {[
                    { 
                      icon: MessageCircle, 
                      step: "1", 
                      label: "Conte sobre o match", 
                      desc: "Perguntas rápidas sobre as conversas",
                      color: "purple" 
                    },
                    { 
                      icon: Brain, 
                      step: "2", 
                      label: "Análise inteligente", 
                      desc: "IA identifica padrões e riscos",
                      color: "pink" 
                    },
                    { 
                      icon: Target, 
                      step: "3", 
                      label: "Resultado completo", 
                      desc: "Scores, alertas e dicas práticas",
                      color: "orange" 
                    },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      className={`group p-5 rounded-2xl border transition-all hover:scale-[1.02] animate-fade-in-up ${
                        item.color === 'purple' ? 'bg-purple-50 border-purple-100 hover:bg-purple-100/70' :
                        item.color === 'pink' ? 'bg-pink-50 border-pink-100 hover:bg-pink-100/70' : 
                        'bg-orange-50 border-orange-100 hover:bg-orange-100/70'
                      }`}
                      style={{ animationDelay: `${400 + i * 100}ms` }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          item.color === 'purple' ? 'bg-purple-600 text-white' :
                          item.color === 'pink' ? 'bg-pink-600 text-white' : 'bg-orange-600 text-white'
                        }`}>
                          {item.step}
                        </div>
                      </div>
                      <item.icon className={`w-7 h-7 mx-auto mb-3 ${
                        item.color === 'purple' ? 'text-purple-600' :
                        item.color === 'pink' ? 'text-pink-600' : 'text-orange-600'
                      }`} />
                      <p className="text-gray-800 font-semibold text-sm mb-1">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
                
                {/* CTA Button - Sempre habilitado */}
                <div className="text-center">
                  <div className="relative inline-block animate-fade-in-up animation-delay-600">
                    {/* Pulsing glow effect */}
                    <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-cta-pulse blur-xl" />
                    <div className="absolute inset-0 -m-5 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-cta-pulse animation-delay-150 blur-2xl" />
                    
                    <Link
                      href="/dashboard/new"
                      data-onboarding="nova-analise"
                      className="relative group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.98]"
                      onClick={() => console.log('[DASHBOARD] Botão "Analisar Agora" clicado')}
                    >
                      <Flame className="w-6 h-6" />
                      <span>Analisar Agora</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <p className="text-gray-500 text-sm mt-4 animate-fade-in-up animation-delay-700">
                    Leva menos de 3 minutos
                  </p>
                  
                  {/* Separador */}
                  <div className="flex items-center gap-4 my-8 animate-fade-in-up animation-delay-800">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-gray-400 text-sm font-medium">ou</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  </div>
                  
                  {/* Opção Premium - Falar com Especialista */}
                  <div className="animate-fade-in-up animation-delay-900">
                    <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 max-w-md mx-auto">
                      {/* Badge Premium */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                          Atendimento Premium
                        </span>
                      </div>
                      
                      <div className="mt-2 mb-4">
                        <h3 className="text-gray-900 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                          <MessageCircle className="w-5 h-5 text-emerald-600" />
                          Prefere falar com um especialista?
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Receba orientação personalizada sobre relacionamentos direto com nosso time de especialistas.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setShowSpecialistModal(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Falar com Especialista</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Cards Grid */
          <div className="grid gap-5" data-onboarding="area-analises">
            {analyses.map((analysis, index) => {
              const isRed = analysis.hasRedFlag
              const isGreen = analysis.hasGreenFlag
              
              const cardBg = isRed 
                ? 'bg-gradient-to-r from-red-50 via-white to-white'
                : isGreen 
                ? 'bg-gradient-to-r from-emerald-50 via-white to-white'
                : 'bg-white'
              
              const borderColor = isRed 
                ? 'border-red-200 hover:border-red-300'
                : isGreen 
                ? 'border-emerald-200 hover:border-emerald-300'
                : 'border-purple-100 hover:border-purple-200'
              
              const getRiskColor = (value: number) => {
                if (value >= 70) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
                if (value >= 50) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
                if (value >= 30) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
              }
              
              return (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analysis/${analysis.id}`}
                  className={`group relative overflow-hidden ${cardBg} backdrop-blur-sm rounded-3xl border ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] animate-fade-in-up`}
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    isRed ? 'from-red-400 via-red-500 to-orange-500' : 
                    isGreen ? 'from-emerald-400 via-emerald-500 to-teal-500' : 
                    'from-purple-400 via-pink-500 to-purple-600'
                  }`} />
                  
                  <div className="relative p-5 sm:p-7">
                    <div className="flex items-center gap-5 sm:gap-7">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {getGeneroImage(analysis.genero_match) ? (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-br ${
                              isRed ? 'from-red-400 to-orange-400' : 
                              isGreen ? 'from-emerald-400 to-teal-400' : 
                              'from-purple-400 to-pink-400'
                            } rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 ${
                              isRed ? 'border-red-200' : isGreen ? 'border-emerald-200' : 'border-purple-200'
                            } bg-gradient-to-br from-purple-50 to-pink-50 p-2 group-hover:scale-105 transition-transform`}>
                              <Image
                                src={getGeneroImage(analysis.genero_match) as string}
                                alt={analysis.genero_match === 'ELE' ? 'Homem' : 'Mulher'}
                                width={80}
                                height={80}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {analysis.hasRedFlag && (
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <h3 className={`font-display text-xl sm:text-2xl font-bold truncate ${
                              isRed ? 'text-red-600' : isGreen ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {analysis.nome_match || 'Crush sem nome'}
                            </h3>
                            {analysis.hasGreenFlag && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          {/* Status badge e botão de excluir */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                              Completo
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDeleteConfirm({ id: analysis.id, name: analysis.nome_match || 'Crush sem nome' })
                              }}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Excluir análise"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {analysis.headline && (
                          <p className="text-gray-500 text-sm line-clamp-1 mb-3">
                            {analysis.headline}
                          </p>
                        )}
                        
                        {/* Signo badge */}
                        {analysis.signo_match && analysis.signo_match !== 'NAO_SEI' && (
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              ⭐ {analysis.signo_match}
                            </span>
                          </div>
                        )}
                        
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {analysis.riskScore && (
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                              getRiskColor(analysis.riskScore.value).bg
                            } ${getRiskColor(analysis.riskScore.value).text} ${getRiskColor(analysis.riskScore.value).border}`}>
                              {analysis.riskScore.label}: {analysis.riskScore.value}%
                            </span>
                          )}
                          {analysis.compatScore !== null && analysis.compatScore !== undefined && (
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                              analysis.compatScore >= 65 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : analysis.compatScore >= 45 
                                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              Compatibilidade: {analysis.compatScore}%
                            </span>
                          )}
                          
                          {/* Stage and date */}
                          <div className="flex items-center gap-2 text-gray-400 text-xs ml-auto">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200">
                              {getStageLabel(analysis.stage)}
                            </span>
                            <span>{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Modal de mínimo de análises */}
        {showMinAnalysesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-md w-full p-7 sm:p-9 animate-fade-in-up">
              <button
                onClick={() => setShowMinAnalysesModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 mb-5">
                  <Compass className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                  {routeCorrection?.neededForNext === 1 
                    ? 'Falta só mais uma análise' 
                    : `Faltam ${routeCorrection?.neededForNext || 2} análises`}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  {routeCorrection?.isFirstTime 
                    ? 'Para gerar sua primeira Análise de Comportamento, você precisa ter pelo menos 3 análises de matches diferentes.'
                    : 'Para gerar uma nova Análise de Comportamento, você precisa fazer pelo menos 2 novas análises.'
                  }
                </p>
                {routeCorrection && routeCorrection.activeAnalysesCount > 0 && (
                  <p className="text-sm text-purple-600 mb-5 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-200">
                    Você tem {routeCorrection.activeAnalysesCount} análise{routeCorrection.activeAnalysesCount > 1 ? 's' : ''} nova{routeCorrection.activeAnalysesCount > 1 ? 's' : ''}.
                  </p>
                )}
                <Link href="/dashboard/new">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-7 py-3.5 rounded-2xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-5 h-5" />
                    <span>Fazer nova análise</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal Especialista */}
        {showSpecialistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-7 sm:p-9 max-h-[90vh] overflow-y-auto animate-fade-in-up">
              <button
                onClick={() => { setShowSpecialistModal(false); setLeadSubmitted(false); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Com especialista vinculado - mostra disclaimer e WhatsApp */}
              {specialist?.whatsapp ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 mb-5">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-4">Aviso Importante</h3>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-left border border-gray-200">
                    <p className="text-gray-600 text-sm mb-3">
                      Os especialistas parceiros oferecem <strong className="text-gray-900">orientação em relacionamentos</strong> e não substituem acompanhamento médico ou psicológico.
                    </p>
                    <p className="text-gray-600 text-sm">
                      O Radar Match atua como <strong className="text-gray-900">intermediador</strong> e não se responsabiliza pelas orientações prestadas.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 font-semibold text-sm">Precisa de ajuda urgente?</span>
                    </div>
                    <p className="text-red-600 text-sm mb-3">
                      Se você está em crise emocional ou precisa de apoio imediato:
                    </p>
                    <a 
                      href="tel:188" 
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      CVV - Ligue 188
                    </a>
                    <p className="text-red-500 text-xs mt-2">
                      Centro de Valorização da Vida • 24h • Gratuito
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setShowSpecialistModal(false)}
                      className="px-5 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <a
                      href={`https://wa.me/55${specialist.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar sobre minha análise.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowSpecialistModal(false)}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              ) : leadSubmitted ? (
                /* Lead enviado com sucesso */
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Solicitação enviada!</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Um especialista entrará em contato com você em breve pelo WhatsApp ou telefone cadastrado.
                  </p>
                  <button
                    onClick={() => { setShowSpecialistModal(false); setLeadSubmitted(false); }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all"
                  >
                    Entendi
                  </button>
                </div>
              ) : (
                /* Sem especialista - gerar lead CTA */
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 mb-5">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Falar com Especialista</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Nosso time de especialistas em relacionamentos está pronto para te ajudar. Confirme seus dados e um especialista entrará em contato com você.
                  </p>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 text-left">
                    <p className="text-purple-800 text-sm">
                      <strong>Seus dados:</strong>
                    </p>
                    <p className="text-purple-700 text-sm mt-1">
                      {userName || user?.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-purple-600 text-xs mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setShowSpecialistModal(false)}
                      className="px-5 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        setSubmittingLead(true)
                        try {
                          const response = await fetch('/api/lead/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'CTA',
                              userEmail: user?.email || '',
                              userPhone: userPhone || '00000000000',
                              userName: userName || user?.user_metadata?.full_name || '',
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
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {submittingLead ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          Quero ser contatado
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 font-semibold text-xs">Precisa de ajuda urgente?</span>
                      </div>
                      <a 
                        href="tel:188" 
                        className="text-red-600 text-xs font-medium hover:underline"
                      >
                        CVV - Ligue 188 (24h • Gratuito)
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-7 animate-fade-in-up">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 border border-red-200 mb-5">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                  Excluir análise?
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Tem certeza que deseja excluir a análise de <strong className="text-gray-900">{deleteConfirm.name}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteAnalysis(deleteConfirm.id)}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de telefone */}
        <PhoneInputModal
          isOpen={showPhoneModal}
          onClose={() => {
            console.log('[DASHBOARD] Modal de telefone fechado (onClose)')
            setShowPhoneModal(false)
            // O useEffect vai detectar a mudança e tentar mostrar o onboarding
          }}
          onSave={(phone) => {
            console.log('[DASHBOARD] Telefone salvo:', phone)
            setShowPhoneModal(false)
            // O useEffect vai detectar a mudança e tentar mostrar o onboarding
          }}
          userName={userName}
        />

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour
            steps={onboardingSteps}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}

        {/* Onboarding Tour Pós-Primeira Análise */}
        {showPostFirstAnalysisOnboarding && (
          <OnboardingTour
            steps={postFirstAnalysisOnboardingSteps}
            onComplete={handlePostFirstAnalysisOnboardingComplete}
            onSkip={handlePostFirstAnalysisOnboardingSkip}
          />
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
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        /* Animações para botão "Analisar minha evolução" desbloqueado */
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.05);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow-fast {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.08);
          }
        }
        .animate-pulse-glow-fast {
          animation: pulse-glow-fast 1.5s ease-in-out infinite;
        }
        
        @keyframes subtle-bounce {
          0%, 100% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(-2px);
          }
        }
        .animate-subtle-bounce {
          animation: subtle-bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
