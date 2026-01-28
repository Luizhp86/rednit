'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trackEvent } from '@/lib/tracking'
import { ThemeSelector } from '@/components/theme-selector'
import { FloatingLoader } from '@/components/floating-loader'
import { QuestionTransitionLoader } from '@/components/question-transition-loader'
import { PageLoader } from '@/components/page-loader'
import { 
  Heart, Zap, Clock, MessageCircle, Calendar, 
  AlertTriangle, CheckCircle2, XCircle, 
  TrendingUp, TrendingDown, Minus,
  Sparkles, ArrowRight, ArrowLeft, User, Shield,
  Users, Target, Timer, Phone, Star, ThumbsUp, ThumbsDown,
  Eye, EyeOff, Ban, Check, X, HelpCircle, CircleDot
} from 'lucide-react'

// Mapa de ícones disponíveis para uso dinâmico
const iconMap: Record<string, any> = {
  Heart, Zap, Clock, MessageCircle, Calendar,
  AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Minus,
  Sparkles, ArrowRight, ArrowLeft, User, Shield,
  Users, Target, Timer, Phone, Star, ThumbsUp, ThumbsDown,
  Eye, EyeOff, Ban, Check, X, HelpCircle, CircleDot
}

type FormData = {
  genero_match: 'ELE' | 'ELA' | ''
  objetivo_usuario: 'CASUAL' | 'CONHECER' | 'NAMORO' | ''
  ritmo_usuario: 'RAPIDO' | 'MEDIO' | 'LENTO' | ''
  estagio: 'FIRST_CHAT' | 'TALKING' | 'POST_DATE' | ''
  iniciativa: 'VOCE' | 'MATCH' | 'MEIO_A_MEIO' | ''
  frequencia_contato: 'DIARIA' | 'ALTERNADA' | 'SOME' | ''
  tempo_resposta: 'MINUTOS' | 'HORAS' | 'DIAS' | ''
  encontro_marcado: 'SIM' | 'NAO' | ''
  cancelou_encontro: 'SIM' | 'NAO' | ''
  remarcou_com_data: 'SIM' | 'NAO' | 'NAO_SE_APLICA' | ''
  curiosidade_por_voce: 'ALTA' | 'MEDIA' | 'BAIXA' | ''
  respeito_limites: 'RESPEITA' | 'NEGOCIA' | 'INSISTE' | 'DEBOCHA' | ''
  disponivel_so_madrugada: 'SIM' | 'NAO' | ''
  fala_futuro: 'NAO' | 'FALA' | 'FALA_E_FAZ' | ''
  sinais_alerta: string[]
  inegociaveis: string[]
  nome_match: string
}

type Question = {
  id: string
  label: string
  type: 'card-select' | 'number' | 'textarea' | 'avatar-select'
  required?: boolean
  options?: { value: string; label: string; hint?: string; icon?: any; color?: string }[]
  placeholder?: string
  rows?: number
  autoAdvance?: boolean
}

const colorClasses: { [key: string]: string } = {
  purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900',
  pink: 'border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-900',
  red: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-900',
  yellow: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
  blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900',
  green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-900',
  orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-900',
  gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900',
}

const selectedColorClasses: { [key: string]: string } = {
  purple: 'border-purple-500 bg-purple-100 ring-2 ring-purple-300',
  pink: 'border-pink-500 bg-pink-100 ring-2 ring-pink-300',
  red: 'border-red-500 bg-red-100 ring-2 ring-red-300',
  yellow: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-300',
  blue: 'border-blue-500 bg-blue-100 ring-2 ring-blue-300',
  green: 'border-green-500 bg-green-100 ring-2 ring-green-300',
  orange: 'border-orange-500 bg-orange-100 ring-2 ring-orange-300',
  gray: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300',
}

export default function NewAnalysisPage() {
  const router = useRouter()
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questionsLoaded, setQuestionsLoaded] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTransitionLoader, setShowTransitionLoader] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitModalLeadSubmitted, setLimitModalLeadSubmitted] = useState(false)
  const [limitModalSubmitting, setLimitModalSubmitting] = useState(false)
  const [userData, setUserData] = useState<{
    name: string | null
    email: string
    phone: string | null
    specialist: { whatsapp: string | null } | null
  } | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const ALL_ALERT_SIGNS = [
    'LOVE_BOMBING', 'CIUME_CEDO', 'VITIMISMO', 'HOSTILIDADE',
    'CONTRADICOES', 'SUMICO_POS_INTIMIDADE', 'TRIANGULACAO',
  ]

  const [formData, setFormData] = useState<FormData>({
    genero_match: '',
    objetivo_usuario: '',
    ritmo_usuario: '',
    estagio: '',
    iniciativa: '',
    frequencia_contato: '',
    tempo_resposta: '',
    encontro_marcado: '',
    cancelou_encontro: '',
    remarcou_com_data: '',
    curiosidade_por_voce: '',
    respeito_limites: '',
    disponivel_so_madrugada: '',
    fala_futuro: '',
    sinais_alerta: ALL_ALERT_SIGNS,
    inegociaveis: [],
    nome_match: '',
  })

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch('/api/me')
        if (res.ok) {
          const data = await res.json()
          setUserData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            specialist: data.therapist || null,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
      }
    }
    loadUserData()
  }, [])

  // Carregar perguntas quando tema é selecionado
  useEffect(() => {
    if (!selectedThemeId) {
      return
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true)
      try {
        const response = await fetch(`/api/form-themes/${selectedThemeId}/questions`)
        if (response.ok) {
          const data = await response.json()
          
          // Mapear perguntas do banco para o formato do formulário
          const mapped: Question[] = data.questions.map((q: any) => ({
            id: q.key,
            label: q.label,
            type: q.type.toLowerCase().replace('_', '-') as any,
            required: q.required,
            autoAdvance: q.autoAdvance,
            placeholder: q.placeholder || undefined,
            rows: q.rows || undefined,
            options: q.options?.map((opt: any) => ({
              value: opt.value,
              label: opt.label,
              hint: opt.hint || undefined,
              icon: opt.icon ? iconMap[opt.icon] : undefined,
              color: opt.color || undefined
            }))
          }))
          
          setDynamicQuestions(mapped)
          
          // Inicializar formData com campos vazios
          const initialData: any = {
            sinais_alerta: ALL_ALERT_SIGNS,
            inegociaveis: [],
            nome_match: ''
          }
          mapped.forEach((q) => {
            initialData[q.id] = Array.isArray(formData[q.id as keyof FormData]) ? [] : ''
          })
          setFormData(initialData)
        }
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error)
      } finally {
        setLoadingQuestions(false)
        setQuestionsLoaded(true)
      }
    }

    loadQuestions()
  }, [selectedThemeId])

  // Usar apenas perguntas dinâmicas do banco de dados
  const questionsToUse = dynamicQuestions

  const getVisibleQuestions = () => {
    return questionsToUse.filter((question) => {
      if (question.id === 'remarcou_com_data') {
        return formData.cancelou_encontro === 'SIM'
      }
      return true
    })
  }

  const visibleQuestions = getVisibleQuestions()
  const safeIndex = Math.min(currentQuestionIndex, visibleQuestions.length - 1)
  const currentQuestion = visibleQuestions[safeIndex] || visibleQuestions[0]
  const progress = ((safeIndex + 1) / visibleQuestions.length) * 100
  const isLastQuestion = safeIndex === visibleQuestions.length - 1
  const isFirstQuestion = safeIndex === 0

  const canProceed = () => {
    if (!currentQuestion.required) return true
    const value = (formData as Record<string, unknown>)[currentQuestion.id]
    if (currentQuestion.type === 'number') {
      return typeof value === 'number' && value >= 0
    }
    if (Array.isArray(value)) return value.length > 0
    return value !== '' && value !== undefined && value !== null
  }

  const handleNext = () => {
    if (canProceed() && !isLastQuestion) {
      const nextIndex = safeIndex + 1
      if (nextIndex < visibleQuestions.length) {
        setShowTransitionLoader(true)
        setTimeout(() => {
          setCurrentQuestionIndex(nextIndex)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(() => setShowTransitionLoader(false), 300)
        }, 400)
      }
    }
  }

  const handleBack = () => {
    if (!isFirstQuestion) {
      const prevIndex = safeIndex - 1
      if (prevIndex >= 0) {
        setShowTransitionLoader(true)
        setTimeout(() => {
          setCurrentQuestionIndex(prevIndex)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(() => setShowTransitionLoader(false), 300)
        }, 400)
      }
    }
  }

  const handleSkip = () => {
    if (!isLastQuestion) {
      const nextIndex = safeIndex + 1
      if (nextIndex < visibleQuestions.length) {
        setShowTransitionLoader(true)
        setTimeout(() => {
          setCurrentQuestionIndex(nextIndex)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(() => setShowTransitionLoader(false), 300)
        }, 400)
      }
    }
  }

  const updateField = useCallback((field: string, value: any) => {
    if (isTransitioning) return
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      if (field === 'cancelou_encontro' && value === 'NAO') {
        newData.remarcou_com_data = ''
      }
      return newData
    })
    
    const question = visibleQuestions[safeIndex]
    if (question?.autoAdvance && safeIndex < visibleQuestions.length - 1 && value) {
      setIsTransitioning(true)
      setShowTransitionLoader(true)
      
      transitionTimeoutRef.current = setTimeout(() => {
        const updatedFormData = { ...formData, [field]: value }
        if (field === 'cancelou_encontro' && value === 'NAO') {
          updatedFormData.remarcou_com_data = ''
        }
        
        const updatedVisibleQuestions = questionsToUse.filter((q) => {
          if (q.id === 'remarcou_com_data') {
            return updatedFormData.cancelou_encontro === 'SIM'
          }
          return true
        })
        
        setCurrentQuestionIndex((idx) => {
          const currentQuestionId = visibleQuestions[idx]?.id
          const newIndex = updatedVisibleQuestions.findIndex(q => q.id === currentQuestionId)
          const adjustedIdx = newIndex >= 0 ? newIndex : idx
          
          if (adjustedIdx < updatedVisibleQuestions.length - 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return adjustedIdx + 1
          }
          return adjustedIdx
        })
        
        setTimeout(() => {
          setIsTransitioning(false)
          setShowTransitionLoader(false)
        }, 350)
      }, 600)
    }
  }, [isTransitioning, formData, visibleQuestions, safeIndex])

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Verificar campos obrigatórios dinamicamente
      const requiredQuestions = questionsToUse.filter(q => q.required)
      const missingFields = requiredQuestions.filter(q => {
        const value = formData[q.id as keyof FormData]
        if (Array.isArray(value)) return value.length === 0
        return !value || value === ''
      })
      
      if (missingFields.length > 0) {
        alert(`Por favor, preencha os campos obrigatórios.`)
        setLoading(false)
        return
      }
      
      // Construir payload dinamicamente a partir das perguntas
      const dataToSend: any = {
        sinais_alerta: Array.isArray(formData.sinais_alerta) ? formData.sinais_alerta : [],
        inegociaveis: Array.isArray(formData.inegociaveis) ? formData.inegociaveis : [],
      }
      
      // Adicionar todos os campos respondidos
      questionsToUse.forEach(q => {
        const value = formData[q.id as keyof FormData]
        if (value !== undefined && value !== null && value !== '') {
          if (q.id === 'nome_match' && typeof value === 'string') {
            dataToSend.nome_match = value.trim()
          } else {
            dataToSend[q.id] = value
          }
        }
      })
      
      // Tratamento especial para remarcou_com_data
      if (formData.cancelou_encontro === 'NAO' && !dataToSend.remarcou_com_data) {
        dataToSend.remarcou_com_data = 'NAO_SE_APLICA'
      }

      // Adicionar themeId
      if (selectedThemeId) {
        dataToSend.themeId = selectedThemeId
      }

      trackEvent('ANALYSIS_STARTED', {
        stage: dataToSend.estagio,
        objective: dataToSend.objetivo_usuario,
      })

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        trackEvent('ANALYSIS_FAILED', { error: error.error })
        const errorMessage = error.error || 'Erro ao processar análise'
        
        // Se for erro de limite de análises, mostrar modal bonito
        if (errorMessage.includes('limite') || errorMessage.includes('Volte amanhã')) {
          setLoading(false)
          setShowLimitModal(true)
          return
        }
        
        alert(errorMessage)
        setLoading(false)
        return
      }

      const data = await response.json()
      trackEvent('ANALYSIS_CREATED', { analysisId: data.id })
      router.push(`/dashboard/analysis/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      trackEvent('ANALYSIS_FAILED', { error: 'unknown' })
      alert('Erro ao processar análise')
      setLoading(false)
    }
  }

  const renderQuestion = () => {
    const value = (formData as Record<string, unknown>)[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'card-select':
        const optionsCount = currentQuestion.options?.length || 0
        
        return (
          <div className={`grid gap-3 ${optionsCount <= 2 ? 'grid-cols-2' : optionsCount <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {currentQuestion.options?.map((option, index) => {
              const Icon = option.icon || Heart
              const isSelected = value === option.value
              const color = option.color || 'purple'
              
              return (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`
                      p-4 sm:p-5 transition-all duration-200 border-2 rounded-2xl cursor-pointer
                      ${isSelected ? selectedColorClasses[color] : colorClasses[color]}
                      ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}
                      active:scale-[0.98]
                    `}
                    onClick={() => !isTransitioning && updateField(currentQuestion.id, option.value)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isSelected ? 'scale-110' : ''} transition-transform`} />
                      <div>
                        <div className="font-bold text-sm sm:text-base">{option.label}</div>
                        {option.hint && (
                          <div className="text-xs opacity-75 mt-0.5 hidden sm:block">{option.hint}</div>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            min="0"
            value={typeof value === 'number' ? value : 0}
            onChange={(e) => updateField(currentQuestion.id, parseInt(e.target.value) || 0)}
            placeholder={currentQuestion.placeholder}
            className="h-14 text-base rounded-2xl text-center text-2xl font-bold"
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateField(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={currentQuestion.rows || 4}
            className="text-base rounded-2xl resize-none"
          />
        )

      case 'avatar-select':
        const avatarImage = formData.genero_match === 'ELE' 
          ? '/images/homem.svg' 
          : '/images/mulher.svg'
        const avatarAlt = formData.genero_match === 'ELE' 
          ? 'Avatar masculino' 
          : 'Avatar feminino'
        
        return (
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <Input
              value={(formData.nome_match as string) || ''}
              onChange={(e) => updateField('nome_match', e.target.value.toUpperCase())}
              placeholder={currentQuestion.placeholder}
              className="h-14 sm:h-16 text-base rounded-2xl text-center text-xl sm:text-2xl font-semibold uppercase tracking-wider"
            />
            {formData.genero_match && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <Image
                  src={avatarImage}
                  alt={avatarAlt}
                  width={120}
                  height={120}
                  className="drop-shadow-lg w-24 h-24 sm:w-32 sm:h-32"
                />
              </motion.div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Se ainda não selecionou tema, mostrar seletor
  if (selectedThemeId === null) {
    return <ThemeSelector onSelectTheme={setSelectedThemeId} />
  }

  // Se está carregando perguntas OU ainda não carregou, mostrar loading
  if (loadingQuestions || !questionsLoaded) {
    return <FloatingLoader />
  }

  // Se já carregou mas não há perguntas disponíveis, mostrar erro
  if (questionsLoaded && questionsToUse.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Formulário não disponível
          </h2>
          <p className="text-gray-600 mb-6">
            O formulário selecionado não possui perguntas configuradas. Por favor, volte e tente novamente.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Se está enviando o formulário, mostrar loader
  if (loading) {
    return <PageLoader message="Analisando sua relação..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Loader de transição temático */}
      <QuestionTransitionLoader 
        isVisible={showTransitionLoader}
        currentQuestion={safeIndex + 1}
        totalQuestions={visibleQuestions.length}
      />

      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-purple-100/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-purple-700">
                Radar Match
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Nova Análise
              </span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-500">
              Pergunta {safeIndex + 1} de {visibleQuestions.length}
            </span>
            <span className="text-xs sm:text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3 rounded-full" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-2xl sm:rounded-3xl shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
              <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                {/* Question Label */}
                <div>
                  <Label className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 block">
                    {currentQuestion.label}
                    {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {!currentQuestion.required && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Pergunta opcional</p>
                  )}
                </div>

                {/* Question Input */}
                <div className="min-h-[200px] sm:min-h-[280px] flex items-start pt-2">
                  <div className="w-full">
                    {renderQuestion()}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="flex gap-2 sm:gap-3">
                    {!isFirstQuestion && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-sm"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                    )}
                    {!currentQuestion.required && !isLastQuestion && !currentQuestion.autoAdvance && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        className="rounded-xl text-sm"
                      >
                        Pular
                      </Button>
                    )}
                  </div>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || (currentQuestion.required && !canProceed())}
                      className="rounded-xl px-5 sm:px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base font-semibold"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analisando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Ver Análise
                        </span>
                      )}
                    </Button>
                  ) : (
                    !currentQuestion.autoAdvance && (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={currentQuestion.required && !canProceed()}
                        className="rounded-xl px-5 sm:px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base font-semibold"
                      >
                        Próxima
                        <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
                      </Button>
                    )
                  )}
                </div>

                {/* Privacy Note (first question) */}
                {isFirstQuestion && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2 sm:space-y-3 mt-2 sm:mt-4"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-800 flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Privacidade:</strong> Sem prints. Só sinais objetivos. Você pode apagar tudo.</span>
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-purple-800 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>IA:</strong> Analisamos automaticamente todos os sinais de alerta.</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de Limite de Análises */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-md w-full p-7 sm:p-9 text-center overflow-hidden"
          >
            {/* Decorative gradient top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            
            {limitModalLeadSubmitted ? (
              /* Lead enviado com sucesso */
              <>
                <div className="relative inline-block mb-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-30 animate-pulse" />
                  <div className="relative text-6xl">💚</div>
                </div>
                
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Perfeito!
                </h3>
                
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  Um especialista entrará em contato com você em breve pelo WhatsApp ou telefone cadastrado.
                </p>
                
                <button
                  onClick={() => {
                    setShowLimitModal(false)
                    setLimitModalLeadSubmitted(false)
                    router.push('/dashboard')
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  Ver minhas análises
                </button>
              </>
            ) : (
              /* Modal padrão */
              <>
                {/* Emoji/Icon */}
                <div className="relative inline-block mb-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
                  <div className="relative text-6xl">😢</div>
                </div>
                
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Ohh não!
                </h3>
                
                <p className="text-gray-600 text-base sm:text-lg mb-2 leading-relaxed">
                  Você atingiu seu limite de análises por hoje.
                </p>
                
                <p className="text-gray-500 text-sm mb-6">
                  Sabemos que você está ansioso(a) para entender melhor suas relações, mas precisamos de um tempinho para processar tudo. 
                  <span className="text-purple-600 font-medium"> Volte amanhã</span> e continue sua jornada!
                </p>
                
                {/* Destaque para especialista */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 mb-5 border border-emerald-200">
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
                      onClick={() => setShowLimitModal(false)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar no WhatsApp
                    </a>
                  ) : (
                    /* Sem especialista - Gerar lead */
                    <button
                      onClick={async () => {
                        setLimitModalSubmitting(true)
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
                            setLimitModalLeadSubmitted(true)
                          }
                        } catch (error) {
                          console.error('Erro ao gerar lead:', error)
                        } finally {
                          setLimitModalSubmitting(false)
                        }
                      }}
                      disabled={limitModalSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {limitModalSubmitting ? (
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
                
                {/* Opção secundária */}
                <button
                  onClick={() => {
                    setShowLimitModal(false)
                    router.push('/dashboard')
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para minhas análises
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
