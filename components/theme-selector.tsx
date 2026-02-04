'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  RefreshCw,
  ChevronRight,
  Star,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Shield,
  Phone,
  X,
  Home
} from 'lucide-react'
import { FloatingLoader } from '@/components/floating-loader'

type FormTheme = {
  id: string
  name: string
  displayName: string
  description: string | null
  icon: string | null
  color: string
  active: boolean
  order: number
  seasonal: boolean
  startDate: string | null
  endDate: string | null
  _count?: {
    questions: number
  }
}

type ThemeSelectorProps = {
  onSelectTheme: (themeId: string) => void
}

const iconMap: Record<string, any> = {
  Heart,
  Sparkles,
  Calendar,
  Star,
}

const colorMap: Record<string, string> = {
  purple: 'from-purple-600 to-purple-800',
  pink: 'from-pink-600 to-pink-800',
  blue: 'from-blue-600 to-blue-800',
  red: 'from-red-600 to-red-800',
  green: 'from-green-600 to-green-800',
  yellow: 'from-yellow-600 to-yellow-800',
  orange: 'from-orange-600 to-orange-800',
}

export function ThemeSelector({ onSelectTheme }: ThemeSelectorProps) {
  const router = useRouter()
  const [themes, setThemes] = useState<FormTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [therapist, setTherapist] = useState<{
    id: string
    name: string
    whatsapp: string | null
    photoUrl: string | null
  } | null>(null)
  const [showTherapistDisclaimer, setShowTherapistDisclaimer] = useState(false)

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('/api/form-themes')
        if (response.ok) {
          const data = await response.json()
          // Filtrar apenas temas que têm perguntas
          const themesWithQuestions = data.filter((theme: FormTheme) => (theme._count?.questions || 0) > 0)
          
          // Ordenar: sazonais primeiro, depois por ordem
          const sortedThemes = themesWithQuestions.sort((a: FormTheme, b: FormTheme) => {
            // Se um é sazonal e outro não, o sazonal vem primeiro
            if (a.seasonal && !b.seasonal) return -1
            if (!a.seasonal && b.seasonal) return 1
            // Se ambos são sazonais ou ambos não são, ordenar por order
            return a.order - b.order
          })
          
          setThemes(sortedThemes)
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadTherapist = async () => {
      try {
        const meRes = await fetch('/api/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.therapist) {
            setTherapist(meData.therapist)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar terapeuta:', error)
      }
    }

    loadThemes()
    loadTherapist()
  }, [])

  // Auto-selecionar quando há apenas 1 tema (após carregar)
  useEffect(() => {
    if (!loading && themes.length === 1) {
      onSelectTheme(themes[0].id)
    }
  }, [loading, themes, onSelectTheme])

  if (loading) {
    return <FloatingLoader />
  }

  // Se não há temas com perguntas, mostrar mensagem de erro
  if (themes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-900/30 mb-6">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Nenhum formulário disponível
            </h2>
            <p className="text-gray-400 mb-6">
              No momento não há formulários de análise configurados. Por favor, entre em contato com o suporte ou tente novamente mais tarde.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Se só há um tema, mostrar loading enquanto redireciona
  if (themes.length === 1) {
    return <FloatingLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col overflow-hidden">
      {/* Cabeçalho Fixo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-lg border-b border-purple-500/20 shadow-lg shadow-purple-500/10 px-4 py-6 sm:py-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Botão Voltar ao Dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Escolha um tema
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Selecione o tipo de análise que melhor se encaixa na sua situação
            </p>
          </div>
        </div>
      </motion.div>

      {/* Área Scrollável com Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-10 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20 scroll-smooth">
        <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {themes.map((theme, index) => {
            const Icon = theme.icon && iconMap[theme.icon] ? iconMap[theme.icon] : Heart
            const gradientClass = colorMap[theme.color] || colorMap.purple

            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => onSelectTheme(theme.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientClass} group-hover:scale-110 transition-transform relative ${
                        theme.seasonal ? 'animate-pulse-strong' : ''
                      }`}>
                        {/* Glow effect para temas sazonais */}
                        {theme.seasonal && (
                          <>
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur-md opacity-75 animate-pulse-glow-intense" />
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg blur-sm opacity-60 animate-pulse-glow-intense animation-delay-300" />
                          </>
                        )}
                        <Icon className={`w-6 h-6 text-white relative z-10 ${theme.seasonal ? 'drop-shadow-glow' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            {theme.displayName}
                          </h3>
                          {theme.seasonal && (
                            <Badge className="bg-yellow-900/30 text-yellow-400">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Especial
                            </Badge>
                          )}
                        </div>
                        {theme.description && (
                          <p className="text-gray-400">
                            {theme.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <span className="text-sm text-gray-500">
                        {theme._count?.questions || 0} perguntas
                      </span>
                      <Button
                        className={`bg-gradient-to-r ${gradientClass} hover:opacity-90`}
                      >
                        Começar
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Opção Premium - Falar com Especialista */}
        {therapist?.whatsapp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: themes.length * 0.1 + 0.2 }}
            className="mt-8"
          >
            <div className="text-center mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="text-gray-400 text-sm font-medium">ou</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
            </div>

            <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-2 border-emerald-500/50 overflow-visible max-w-2xl mx-auto">
              {/* Badge Premium */}
              <div className="relative pt-4">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide inline-block">
                    Atendimento Premium
                  </span>
                </div>
              </div>

              <div className="p-8 pt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                  <MessageCircle className="w-8 h-8 text-emerald-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Prefere falar com um especialista?
                </h3>
                <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                  Receba orientação personalizada sobre relacionamentos direto com nosso time de especialistas.
                </p>
                
                <Button
                  onClick={() => setShowTherapistDisclaimer(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/25"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Modal Disclaimer Terapeuta */}
        {showTherapistDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowTherapistDisclaimer(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-900/50 border border-purple-500/50 mb-5">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Aviso Importante</h3>
                
                <div className="bg-gray-700/50 rounded-2xl p-4 mb-4 text-left border border-gray-600">
                  <p className="text-gray-300 text-sm mb-3">
                    Os especialistas parceiros oferecem <strong className="text-white">orientação em relacionamentos</strong> e não substituem acompanhamento médico ou psicológico.
                  </p>
                  <p className="text-gray-300 text-sm">
                    O Radar Match atua como <strong className="text-white">intermediador</strong> e não se responsabiliza pelas orientações prestadas.
                  </p>
                </div>
                
                <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-semibold text-sm">Precisa de ajuda urgente?</span>
                  </div>
                  <p className="text-red-200 text-sm mb-3">
                    Se você está em crise emocional ou precisa de apoio imediato:
                  </p>
                  <a 
                    href="tel:188" 
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    CVV - Ligue 188
                  </a>
                  <p className="text-red-300 text-xs mt-2">
                    Centro de Valorização da Vida • 24h • Gratuito
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowTherapistDisclaimer(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <a
                    href={`https://wa.me/55${therapist?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowTherapistDisclaimer(false)}
                  >
                    <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Entendi, continuar
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </div>

      {/* Estilos customizados para animações */}
      <style jsx global>{`
        @keyframes pulse-strong {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.08);
          }
        }
        .animate-pulse-strong {
          animation: pulse-strong 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow-intense {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.15);
          }
        }
        .animate-pulse-glow-intense {
          animation: pulse-glow-intense 1.8s ease-in-out infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
        }
      `}</style>
    </div>
  )
}
