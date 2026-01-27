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
  ArrowLeft
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

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await fetch('/api/form-themes')
        if (response.ok) {
          const data = await response.json()
          // Filtrar apenas temas que têm perguntas
          const themesWithQuestions = data.filter((theme: FormTheme) => (theme._count?.questions || 0) > 0)
          setThemes(themesWithQuestions)
        }
      } catch (error) {
        console.error('Erro ao carregar temas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadThemes()
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha um tema
          </h1>
          <p className="text-xl text-gray-300">
            Selecione o tipo de análise que melhor se encaixa na sua situação
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientClass} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
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
      </div>
    </div>
  )
}
