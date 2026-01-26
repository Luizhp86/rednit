'use client'

import { useState, useRef, useCallback } from 'react'
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
import { 
  Heart, Zap, Clock, MessageCircle, Calendar, 
  AlertTriangle, CheckCircle2, XCircle, 
  TrendingUp, TrendingDown, Minus,
  Sparkles, ArrowRight, ArrowLeft, User
} from 'lucide-react'

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
  nome_match?: string
}

type Question = {
  id: keyof FormData
  label: string
  type: 'card-select' | 'number' | 'textarea' | 'avatar-select'
  required?: boolean
  options?: { value: string; label: string; hint?: string; icon?: any; color?: string }[]
  placeholder?: string
  rows?: number
  autoAdvance?: boolean
}

const QUESTIONS: Question[] = [
  {
    id: 'genero_match',
    label: 'Este match é ele ou ela?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'ELE', label: 'Ele', hint: 'Match masculino', icon: User, color: 'blue' },
      { value: 'ELA', label: 'Ela', hint: 'Match feminino', icon: User, color: 'pink' },
    ],
  },
  {
    id: 'objetivo_usuario',
    label: 'Qual seu objetivo com este match?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'CASUAL', label: 'Casual', hint: 'Algo leve e descompromissado', icon: Sparkles, color: 'purple' },
      { value: 'CONHECER', label: 'Conhecer melhor', hint: 'Ver no que dá', icon: Heart, color: 'pink' },
      { value: 'NAMORO', label: 'Namoro sério', hint: 'Busco algo duradouro', icon: Heart, color: 'red' },
    ],
  },
  {
    id: 'ritmo_usuario',
    label: 'Qual ritmo você prefere?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'RAPIDO', label: 'Rápido', hint: 'Quero avançar logo', icon: Zap, color: 'yellow' },
      { value: 'MEDIO', label: 'Médio', hint: 'Sem pressa, sem pausa', icon: Clock, color: 'blue' },
      { value: 'LENTO', label: 'Lento', hint: 'Vou com calma', icon: Minus, color: 'gray' },
    ],
  },
  {
    id: 'estagio',
    label: 'Em que estágio está?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'FIRST_CHAT', label: 'Primeira conversa', hint: 'Acabamos de começar', icon: MessageCircle, color: 'blue' },
      { value: 'TALKING', label: 'Conversando regularmente', hint: 'Já temos uma rotina', icon: MessageCircle, color: 'green' },
      { value: 'POST_DATE', label: 'Após primeiro encontro', hint: 'Já nos encontramos', icon: Calendar, color: 'purple' },
    ],
  },
  {
    id: 'iniciativa',
    label: 'Quem inicia as conversas?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'VOCE', label: 'Você sempre inicia', hint: 'Você toma a iniciativa', icon: TrendingUp, color: 'orange' },
      { value: 'MATCH', label: 'Match sempre inicia', hint: 'Eles tomam a iniciativa', icon: TrendingDown, color: 'blue' },
      { value: 'MEIO_A_MEIO', label: 'Equilibrado', hint: 'Ambos iniciam', icon: Minus, color: 'green' },
    ],
  },
  {
    id: 'frequencia_contato',
    label: 'Frequência de contato?',
    type: 'card-select',
    required: true,
    autoAdvance: true,
    options: [
      { value: 'DIARIA', label: 'Diária', hint: 'Falamos todo dia', icon: CheckCircle2, color: 'green' },
      { value: 'ALTERNADA', label: 'Alternada', hint: 'Alguns dias sim, outros não', icon: Clock, color: 'yellow' },
      { value: 'SOME', label: 'Raramente', hint: 'Pouco contato', icon: XCircle, color: 'red' },
    ],
  },
  {
    id: 'tempo_resposta',
    label: 'Tempo médio de resposta?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'MINUTOS', label: 'Minutos', hint: 'Responde rápido', icon: Zap, color: 'green' },
      { value: 'HORAS', label: 'Horas', hint: 'Responde no mesmo dia', icon: Clock, color: 'yellow' },
      { value: 'DIAS', label: 'Dias', hint: 'Demora para responder', icon: XCircle, color: 'red' },
    ],
  },
  {
    id: 'curiosidade_por_voce',
    label: 'Curiosidade por você?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'ALTA', label: 'Alta', hint: 'Faz perguntas, demonstra interesse', icon: TrendingUp, color: 'green' },
      { value: 'MEDIA', label: 'Média', hint: 'Interesse moderado', icon: Minus, color: 'yellow' },
      { value: 'BAIXA', label: 'Baixa', hint: 'Pouco interesse demonstrado', icon: TrendingDown, color: 'red' },
    ],
  },
  {
    id: 'respeito_limites',
    label: 'Respeita seus limites?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'RESPEITA', label: 'Respeita', hint: 'Totalmente respeitoso', icon: CheckCircle2, color: 'green' },
      { value: 'NEGOCIA', label: 'Negocia', hint: 'Tenta negociar limites', icon: Clock, color: 'yellow' },
      { value: 'INSISTE', label: 'Insiste', hint: 'Insiste mesmo após você dizer não', icon: AlertTriangle, color: 'orange' },
      { value: 'DEBOCHA', label: 'Debocha', hint: 'Zomba dos seus limites', icon: XCircle, color: 'red' },
    ],
  },
  {
    id: 'fala_futuro',
    label: 'Fala sobre futuro?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'NAO', label: 'Não fala', hint: 'Evita falar do futuro', icon: XCircle, color: 'gray' },
      { value: 'FALA', label: 'Fala mas não faz', hint: 'Promete mas não cumpre', icon: AlertTriangle, color: 'yellow' },
      { value: 'FALA_E_FAZ', label: 'Fala e faz', hint: 'Fala e cumpre', icon: CheckCircle2, color: 'green' },
    ],
  },
  {
    id: 'encontro_marcado',
    label: 'Já marcaram encontro?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'SIM', label: 'Sim', hint: 'Já nos encontramos', icon: CheckCircle2, color: 'green' },
      { value: 'NAO', label: 'Não', hint: 'Ainda não', icon: XCircle, color: 'gray' },
    ],
  },
  {
    id: 'cancelou_encontro',
    label: 'Já cancelou encontro?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'NAO', label: 'Não', hint: 'Nunca cancelou', icon: CheckCircle2, color: 'green' },
      { value: 'SIM', label: 'Sim', hint: 'Já cancelou pelo menos uma vez', icon: XCircle, color: 'red' },
    ],
  },
  {
    id: 'remarcou_com_data',
    label: 'Remarcou com data definida?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'NAO_SE_APLICA', label: 'Não se aplica', hint: 'Não houve cancelamento', icon: Minus, color: 'gray' },
      { value: 'SIM', label: 'Sim', hint: 'Remarcou com data', icon: CheckCircle2, color: 'green' },
      { value: 'NAO', label: 'Não', hint: 'Não remarcou', icon: XCircle, color: 'red' },
    ],
  },
  {
    id: 'disponivel_so_madrugada',
    label: 'Disponível só de madrugada?',
    type: 'card-select',
    autoAdvance: true,
    options: [
      { value: 'NAO', label: 'Não', hint: 'Disponível em horários normais', icon: CheckCircle2, color: 'green' },
      { value: 'SIM', label: 'Sim', hint: 'Só aparece de madrugada', icon: AlertTriangle, color: 'orange' },
    ],
  },
{
    id: 'nome_match',
    label: 'Como você chama este match?',
    type: 'avatar-select',
    placeholder: 'EX: JOAO, MARIA, O CRUSH DO TINDER...',
  },
]

const colorClasses: { [key: string]: string } = {
  purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900',
  pink: 'border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-900',
  red: 'border-red-300 bg-red-50 hover:bg-red-100 text-red-900',
  yellow: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
  blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900',
  green: 'border-green-300 bg-green-50 hover:bg-green-100 text-green-900',
  orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900',
  gray: 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900',
}

const selectedColorClasses: { [key: string]: string } = {
  purple: 'border-purple-500 bg-purple-100 ring-4 ring-purple-200',
  pink: 'border-pink-500 bg-pink-100 ring-4 ring-pink-200',
  red: 'border-red-500 bg-red-100 ring-4 ring-red-200',
  yellow: 'border-yellow-500 bg-yellow-100 ring-4 ring-yellow-200',
  blue: 'border-blue-500 bg-blue-100 ring-4 ring-blue-200',
  green: 'border-green-500 bg-green-100 ring-4 ring-green-200',
  orange: 'border-orange-500 bg-orange-100 ring-4 ring-orange-200',
  gray: 'border-gray-500 bg-gray-100 ring-4 ring-gray-200',
}

export default function NewAnalysisPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Todos os sinais de alerta serão analisados automaticamente
  const ALL_ALERT_SIGNS = [
    'LOVE_BOMBING',
    'CIUME_CEDO',
    'VITIMISMO',
    'HOSTILIDADE',
    'CONTRADICOES',
    'SUMICO_POS_INTIMIDADE',
    'TRIANGULACAO',
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
    sinais_alerta: ALL_ALERT_SIGNS, // Todos os sinais são analisados por padrão
    inegociaveis: [],
    nome_match: '',
  })

  // Filtrar perguntas visíveis baseado em condições
  const getVisibleQuestions = () => {
    return QUESTIONS.filter((question) => {
      // Se for a pergunta "remarcou_com_data", só mostrar se cancelou_encontro for SIM
      if (question.id === 'remarcou_com_data') {
        return formData.cancelou_encontro === 'SIM'
      }
      return true
    })
  }

  const visibleQuestions = getVisibleQuestions()
  
  // Garantir que o índice atual está dentro dos limites das perguntas visíveis
  const safeIndex = Math.min(currentQuestionIndex, visibleQuestions.length - 1)
  const currentQuestion = visibleQuestions[safeIndex] || visibleQuestions[0]
  const progress = ((safeIndex + 1) / visibleQuestions.length) * 100
  const isLastQuestion = safeIndex === visibleQuestions.length - 1
  const isFirstQuestion = safeIndex === 0

  const canProceed = () => {
    if (!currentQuestion.required) return true
    const value = formData[currentQuestion.id]
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
        setCurrentQuestionIndex(nextIndex)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    if (!isFirstQuestion) {
      const prevIndex = safeIndex - 1
      if (prevIndex >= 0) {
        setCurrentQuestionIndex(prevIndex)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleSkip = () => {
    if (!isLastQuestion) {
      const nextIndex = safeIndex + 1
      if (nextIndex < visibleQuestions.length) {
        setCurrentQuestionIndex(nextIndex)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const updateField = useCallback((field: keyof FormData, value: any) => {
    // Bloquear se já está em transição
    if (isTransitioning) return
    
    // Cancelar timeout pendente
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    
    // Atualizar o estado primeiro
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      
      // Se cancelou_encontro mudou para NAO, limpar remarcou_com_data
      if (field === 'cancelou_encontro' && value === 'NAO') {
        newData.remarcou_com_data = ''
      }
      
      return newData
    })
    
    // Auto-advance se configurado (após atualizar o estado)
    const question = visibleQuestions[safeIndex]
    if (question?.autoAdvance && safeIndex < visibleQuestions.length - 1 && value) {
      // Bloquear novas interações durante a transição
      setIsTransitioning(true)
      
      transitionTimeoutRef.current = setTimeout(() => {
        // Recalcular perguntas visíveis após atualizar o estado
        const updatedFormData = { ...formData, [field]: value }
        if (field === 'cancelou_encontro' && value === 'NAO') {
          updatedFormData.remarcou_com_data = ''
        }
        
        const updatedVisibleQuestions = QUESTIONS.filter((q) => {
          if (q.id === 'remarcou_com_data') {
            return updatedFormData.cancelou_encontro === 'SIM'
          }
          return true
        })
        
        setCurrentQuestionIndex((idx) => {
          // Encontrar a posição da pergunta atual na nova lista de perguntas visíveis
          const currentQuestionId = visibleQuestions[idx]?.id
          const newIndex = updatedVisibleQuestions.findIndex(q => q.id === currentQuestionId)
          const adjustedIdx = newIndex >= 0 ? newIndex : idx
          
          if (adjustedIdx < updatedVisibleQuestions.length - 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return adjustedIdx + 1
          }
          return adjustedIdx
        })
        
        // Desbloquear após a transição
        setTimeout(() => {
          setIsTransitioning(false)
        }, 350) // Tempo da animação
      }, 400)
    }
  }, [isTransitioning, formData, visibleQuestions, safeIndex])


  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Validar campos obrigatórios antes de enviar
      const requiredFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData] || formData[field as keyof FormData] === '')
      
      if (missingFields.length > 0) {
        alert(`Por favor, preencha todos os campos obrigatórios. Campos faltando: ${missingFields.join(', ')}`)
        setLoading(false)
        return
      }
      
      // Garantir que os valores são strings, não arrays
      const dataToSend: any = {
        genero_match: String(formData.genero_match),
        objetivo_usuario: String(formData.objetivo_usuario),
        ritmo_usuario: String(formData.ritmo_usuario),
        estagio: String(formData.estagio),
        iniciativa: String(formData.iniciativa),
        frequencia_contato: String(formData.frequencia_contato),
        sinais_alerta: Array.isArray(formData.sinais_alerta) ? formData.sinais_alerta : [],
        inegociaveis: Array.isArray(formData.inegociaveis) ? formData.inegociaveis : [],
      }
      
      // Adicionar campos opcionais apenas se preenchidos
      if (formData.cancelou_encontro) {
        dataToSend.cancelou_encontro = formData.cancelou_encontro
      }
      
      // Log para debug
      console.log('[FORM] Dados sendo enviados:', JSON.stringify(dataToSend, null, 2))

      if (formData.tempo_resposta) {
        dataToSend.tempo_resposta = formData.tempo_resposta
      }
      if (formData.encontro_marcado) {
        dataToSend.encontro_marcado = formData.encontro_marcado
      }
      // Se cancelou_encontro for NAO, definir remarcou_com_data como NAO_SE_APLICA
      if (formData.cancelou_encontro === 'NAO') {
        dataToSend.remarcou_com_data = 'NAO_SE_APLICA'
      } else if (formData.remarcou_com_data) {
        dataToSend.remarcou_com_data = formData.remarcou_com_data
      }
      if (formData.curiosidade_por_voce) {
        dataToSend.curiosidade_por_voce = formData.curiosidade_por_voce
      }
      if (formData.respeito_limites) {
        dataToSend.respeito_limites = formData.respeito_limites
      }
      if (formData.disponivel_so_madrugada) {
        dataToSend.disponivel_so_madrugada = formData.disponivel_so_madrugada
      }
      if (formData.fala_futuro) {
        dataToSend.fala_futuro = formData.fala_futuro
      }
      if (formData.nome_match && formData.nome_match.trim()) {
        dataToSend.nome_match = formData.nome_match.trim()
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
        console.error('Erro do servidor:', error)
        trackEvent('ANALYSIS_FAILED', { error: error.error })
        alert(error.error || 'Erro ao processar análise')
        return
      }

      const data = await response.json()
      trackEvent('ANALYSIS_CREATED', { analysisId: data.id })
      router.push(`/dashboard/analysis/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      trackEvent('ANALYSIS_FAILED', { error: 'unknown' })
      alert('Erro ao processar análise')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = () => {
    const value = formData[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'card-select':
        const optionsCount = currentQuestion.options?.length || 0
        const isOddCount = optionsCount % 2 !== 0 && optionsCount > 2
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => {
              const Icon = option.icon || Heart
              const isSelected = value === option.value
              const color = option.color || 'purple'
              // Se for o último item e houver número ímpar de opções, centralizar
              const isLastOddItem = isOddCount && index === optionsCount - 1
              
              return (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full ${isLastOddItem ? 'md:col-span-2 md:flex md:justify-center' : ''}`}
                >
                  <Card
                    className={`
                      p-6 transition-all duration-200 border-2 rounded-3xl
                      ${isLastOddItem ? 'md:w-full md:max-w-sm' : 'w-full'}
                      ${isSelected 
                        ? selectedColorClasses[color] 
                        : colorClasses[color]
                      }
                      ${isTransitioning ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                    `}
                    onClick={() => !isTransitioning && updateField(currentQuestion.id, option.value)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Icon className={`h-8 w-8 ${isSelected ? 'scale-110' : ''} transition-transform`} />
                      <div>
                        <div className="font-bold text-lg mb-1">{option.label}</div>
                        {option.hint && (
                          <div className="text-sm opacity-75">{option.hint}</div>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2"
                        >
                          <CheckCircle2 className="h-6 w-6" />
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
          <div className="flex flex-col items-center space-y-6">
            <Input
              value={(formData.nome_match as string) || ''}
              onChange={(e) => updateField('nome_match', e.target.value.toUpperCase())}
              placeholder={currentQuestion.placeholder}
              className="h-20 text-base rounded-2xl text-center text-3xl font-semibold uppercase tracking-widest"
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
                  width={150}
                  height={150}
                  className="drop-shadow-lg"
                />
              </motion.div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Logo size="lg" />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-3xl shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600" />
              <div className="p-8 md:p-12 space-y-6">
                {/* Question Label */}
                <div>
                  <Label className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 block">
                    {currentQuestion.label}
                    {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {!currentQuestion.required && (
                    <p className="text-sm text-gray-500 mt-1">Esta pergunta é opcional</p>
                  )}
                </div>

                {/* Question Input */}
                <div className="min-h-[300px] flex items-start pt-4">
                  <div className="w-full">
                    {renderQuestion()}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex gap-3">
                    {!isFirstQuestion && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-2xl px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                    )}
                    {!currentQuestion.required && !isLastQuestion && !currentQuestion.autoAdvance && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        className="rounded-2xl"
                      >
                        Pular
                      </Button>
                    )}
                  </div>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || (currentQuestion.required && !canProceed())}
                      className="rounded-2xl px-8 bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Analisando...' : 'Ver Análise'}
                    </Button>
                  ) : (
                    !currentQuestion.autoAdvance && (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={currentQuestion.required && !canProceed()}
                        className="rounded-2xl px-8 bg-purple-600 hover:bg-purple-700"
                      >
                        Próxima
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )
                  )}
                </div>

                {/* Privacy Note (first question) */}
                {isFirstQuestion && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 mt-4"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-sm text-blue-800">
                        <strong>🔒 Privacidade garantida:</strong> Sem prints. Só sinais objetivos. Você pode apagar tudo a qualquer momento.
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                      <p className="text-sm text-purple-800 mb-2">
                        <strong>🔍 Análise automática de sinais:</strong>
                      </p>
                      <p className="text-xs text-purple-700">
                        Nossa IA analisa automaticamente todos os sinais de alerta: love bombing, ciúme prematuro, vitimismo, hostilidade, contradições, sumiço pós-intimidade e triangulação. Você não precisa selecionar nada - tudo é analisado automaticamente!
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

