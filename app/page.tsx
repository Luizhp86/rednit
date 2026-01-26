import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 animate-heartbeat">
      {/* Header com Logo */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Logo size="lg" />
          <span className="text-sm md:text-base text-gray-600 italic">
            o seu coach do tinder
          </span>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Análise inteligente em 30 segundos</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Descubra o que seu match{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              realmente quer
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Red flags, green flags e insights baseados em evidências.
            <br />
            <span className="text-gray-500">Sem prints. Só sinais objetivos.</span>
          </p>

          {/* CTA Principal - Destacado */}
          <div className="mb-16 relative">
            <div className="flex flex-col items-center gap-6">
              {/* Efeito de brilho animado ao redor do botão */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-30 blur-3xl animate-pulse pointer-events-none"></div>
              
              <Button
                asChild
                size="lg"
                className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-12 py-8 text-2xl md:text-3xl font-bold rounded-3xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 border-4 border-white/30 z-10"
              >
                <Link href="/login" className="flex items-center gap-3">
                  <span>Começar análise grátis</span>
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-600 mt-2 z-10">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                  <span>Sem cadastro complicado</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                  <span>Resultado em 30 segundos</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                  <span>100% gratuito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features em destaque - versão minimalista */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Red Flags</h3>
              <p className="text-sm text-gray-600">
                Sinais de alerta identificados automaticamente
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Green Flags</h3>
              <p className="text-sm text-gray-600">
                Sinais positivos e comportamentos saudáveis
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Insights IA</h3>
              <p className="text-sm text-gray-600">
                Análise inteligente com hipóteses probabilísticas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de confiança - minimalista */}
      <div className="bg-white/40 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Privacidade garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Resultado em 30s</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Conforme LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
