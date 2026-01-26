'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, MessageCircle, Bot, Target, Brain, CheckCircle2, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { useState, useEffect } from 'react'

// Componente de Demo Animado
function AnimatedDemo() {
  const [step, setStep] = useState(0)
  
  // Ciclo: 0=pergunta, 1=resposta, 2=resultado, depois repete
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-sm mx-auto">
      {/* Header do "app" */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
        </div>
        <span className="text-white text-xs font-medium ml-2">Radar Match</span>
      </div>
      
      {/* Conteúdo animado */}
      <div className="p-5 min-h-[180px] flex flex-col justify-center">
        {/* Step 0: Pergunta */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <p className="text-xs text-gray-500 mb-2">Pergunta 5 de 14</p>
            <p className="font-semibold text-gray-900 mb-4">Quem inicia as conversas?</p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                Você sempre
              </div>
              <div className="p-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                Equilibrado
              </div>
              <div className="p-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                Match sempre
              </div>
            </div>
          </div>
        )}
        
        {/* Step 1: Selecionando resposta */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <p className="text-xs text-gray-500 mb-2">Pergunta 5 de 14</p>
            <p className="font-semibold text-gray-900 mb-4">Quem inicia as conversas?</p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border-2 border-purple-500 bg-purple-50 text-sm text-purple-700 font-medium flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                Você sempre
              </div>
              <div className="p-3 rounded-xl border-2 border-gray-200 text-sm text-gray-400 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                Equilibrado
              </div>
              <div className="p-3 rounded-xl border-2 border-gray-200 text-sm text-gray-400 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                Match sempre
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Resultado */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <p className="text-xs text-gray-500 mb-2">Resultado da análise</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Risco de enrolação</span>
                <span className="text-lg font-bold text-orange-600">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Desequilíbrio de investimento</p>
                  <p className="text-xs text-red-600">Você está investindo mais</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-purple-700">Hipótese: Explorando opções</p>
                  <p className="text-xs text-purple-600">Confiança média</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Indicadores de step */}
      <div className="px-5 pb-4 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === i ? 'w-6 bg-purple-600' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header com Logo */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-purple-700">
                Coach de Relacionamentos
              </span>
              <span className="text-xs text-gray-500 hidden md:block">
                Análise objetiva do seu match
              </span>
            </div>
          </div>
          <Link 
            href="/terapeuta" 
            className="text-sm font-medium text-purple-600 hover:text-purple-800 transition flex items-center gap-1"
          >
            Para Profissionais
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Lado esquerdo - Texto */}
            <div className="text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                <span>Coach de relacionamentos</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                Seu amigo e o ChatGPT vão{' '}
                <span className="text-gray-500">concordar com você.</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nós vamos te mostrar a verdade.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Responda sobre <strong>comportamentos</strong> — não sobre o que você acha.
                <br />
                E descubra o que os sinais realmente dizem.
              </p>

              {/* CTA Principal */}
              <div className="relative mb-6">
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="absolute top-1/2 left-1/2 md:left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-40 blur-3xl animate-pulse pointer-events-none"></div>
                  
                  <Button
                    asChild
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-14 py-8 text-2xl md:text-3xl font-bold rounded-3xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 border-4 border-white/30 z-10"
                  >
                    <Link href="/login" className="flex items-center gap-3 relative">
                      {/* Efeito shimmer */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></span>
                      <Sparkles className="h-7 w-7" />
                      <span>Fazer análise grátis</span>
                      <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </Button>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-600 z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>2 minutos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Sem prints</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Sem julgamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado direito - Demo animado */}
            <div className="flex justify-center md:justify-end">
              <AnimatedDemo />
            </div>
          </div>
        </div>
      </div>

      {/* Seção: O problema de pedir opinião */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              O problema de pedir opinião
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Você conta sua versão. E recebe de volta o que você mesmo alimentou.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Amigo */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">Amigo(a)</h3>
                </div>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Você conta <strong>sua versão</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Quer te agradar ou proteger demais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Resposta baseada em emoção</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-gray-500 italic text-sm">"Acho que ele gosta de você, amiga!"</p>
                </div>
              </div>

              {/* ChatGPT */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">ChatGPT</h3>
                </div>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Você descreve <strong>do seu jeito</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Reflete seu próprio viés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Não questiona sua narrativa</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-gray-500 italic text-sm">"Parece que ele está interessado em você..."</p>
                </div>
              </div>

              {/* Radar Match */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-lg border-2 border-purple-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  DIFERENTE
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">Radar Match</h3>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Você responde sobre <strong>FATOS</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Analisa comportamentos objetivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Resultado sem viés emocional</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-white rounded-2xl border border-purple-200">
                  <p className="text-purple-700 font-semibold text-sm">"Risco de enrolação: 68% — baseado em 4 sinais"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Como funciona */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Fatos, não opiniões
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              O formulário força objetividade. Você não conta sua história — você responde sobre comportamentos.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Responda sobre comportamentos</h3>
                <p className="text-gray-600">
                  "Quem inicia as conversas?" não é opinião — é fato.
                  <br />
                  "Cancelou e remarcou?" não é interpretação — é fato.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-pink-600">2</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Receba análise objetiva</h3>
                <p className="text-gray-600">
                  Scores baseados em padrões de relacionamentos saudáveis, não no que você quer ouvir.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Tome decisões melhores</h3>
                <p className="text-gray-600">
                  Saiba se vale continuar investindo ou se é hora de seguir em frente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: O que você descobre */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              O que você descobre
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-red-100 p-3 rounded-full w-fit mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Sinais de alerta</h3>
                <p className="text-gray-600 text-sm">
                  Red flags que você pode estar ignorando — identificados automaticamente pelo padrão de comportamento.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Sinais positivos</h3>
                <p className="text-gray-600 text-sm">
                  Green flags que talvez você não tenha notado — evidências de interesse genuíno.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-orange-100 p-3 rounded-full w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Risco de ghosting</h3>
                <p className="text-gray-600 text-sm">
                  Previsão baseada em padrões — saiba a probabilidade antes de se apegar demais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Credibilidade */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-6">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seu coach com base em ciência
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Um coach de relacionamentos que usa os mesmos padrões que terapeutas de casal — aplicados ao seu match, sem viés.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                Teoria do Apego (Bowlby)
              </div>
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                Pesquisas de Gottman
              </div>
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                Modelo de Investimento (Rusbult)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tenha um coach de relacionamentos no bolso
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Análise objetiva do seu match em 2 minutos — sem viés, sem julgamento, só a verdade.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-purple-700 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href="/login" className="flex items-center gap-3">
                <span>Fazer minha análise grátis</span>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </Button>
            <p className="text-white/70 mt-6 text-sm">
              2 minutos • Sem prints • Sem julgamento
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/40 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Contato */}
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dúvidas? Fale com o desenvolvedor</h3>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            {/* Informações */}
            <div className="text-center border-t border-gray-200 pt-6">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>Privacidade garantida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>Resultado em 2 min</span>
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
    </div>
  )
}
