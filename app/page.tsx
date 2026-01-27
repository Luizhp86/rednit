'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, MessageCircle, Bot, Target, Brain, CheckCircle2, AlertTriangle, TrendingUp, ChevronRight, Menu, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { useState, useEffect } from 'react'

// Frases rotativas que capturam a atenção (público feminino)
const rotatingPhrases = [
  "Ele está interessado ou só te enrolando?",
  "Por que ele demora tanto pra responder?",
  "É red flag ou você tá exagerando?",
  "Será que vale a pena insistir?",
  "Ele some e volta... isso é normal?",
  "Ele disse que precisa de tempo. E agora?",
  "Vocês conversam todo dia, mas ele nunca marca nada?",
  "Ele visualiza e não responde. O que fazer?",
]

// Componente de frase rotativa
function RotatingPhrase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingPhrases.length)
        setIsVisible(true)
      }, 200)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span 
      className={`inline-block transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      {rotatingPhrases[currentIndex]}
    </span>
  )
}

// Logo Animado com efeito zero gravity
function AnimatedLogo() {
  return (
    <div className="relative animate-zero-gravity">
      {/* Glow suave que acompanha */}
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-lg animate-zero-gravity-glow" />
      
      {/* Logo flutuando */}
      <div className="relative">
        <Logo size="lg" />
      </div>
    </div>
  )
}

// Menu Mobile
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div 
        className="absolute inset-0 bg-purple-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 h-full w-[280px] bg-white border-l border-purple-100 p-6 shadow-2xl animate-slide-in-right">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-purple-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <nav className="mt-12 flex flex-col gap-4">
          <Link 
            href="/terapeuta"
            onClick={onClose}
            className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-colors py-3 border-b border-gray-100"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Para Profissionais</span>
          </Link>
          
          <Link 
            href="/login"
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Fazer Análise Grátis
          </Link>
        </nav>
        
        <div className="absolute bottom-8 left-6 right-6">
          <a
            href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Radar%20Match"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// Componente de Demo Animado
function AnimatedDemo() {
  const [step, setStep] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-200/50 border border-purple-100 overflow-hidden w-full max-w-[320px] sm:max-w-sm mx-auto">
      {/* Header do "app" */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
        </div>
        <span className="text-white text-xs font-semibold ml-2 tracking-wide">Radar Match</span>
      </div>
      
      {/* Conteúdo animado */}
      <div className="p-4 sm:p-5 min-h-[200px] sm:min-h-[220px] flex flex-col justify-center">
        {/* Step 0: Pergunta */}
        {step === 0 && (
          <div className="animate-fade-in">
            <p className="text-[10px] sm:text-xs text-purple-400 font-medium mb-2 uppercase tracking-wider">Pergunta 5 de 14</p>
            <p className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Quem inicia as conversas?</p>
            <div className="space-y-2">
              {["Você sempre", "Equilibrado", "Match sempre"].map((opt, i) => (
                <div key={i} className="p-2.5 sm:p-3 rounded-xl border-2 border-gray-200 text-xs sm:text-sm text-gray-600 flex items-center gap-2 hover:border-purple-300 transition-colors">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 1: Selecionando resposta */}
        {step === 1 && (
          <div className="animate-fade-in">
            <p className="text-[10px] sm:text-xs text-purple-400 font-medium mb-2 uppercase tracking-wider">Pergunta 5 de 14</p>
            <p className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Quem inicia as conversas?</p>
            <div className="space-y-2">
              <div className="p-2.5 sm:p-3 rounded-xl border-2 border-purple-500 bg-purple-50 text-xs sm:text-sm text-purple-700 font-medium flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                Você sempre
              </div>
              {["Equilibrado", "Match sempre"].map((opt, i) => (
                <div key={i} className="p-2.5 sm:p-3 rounded-xl border-2 border-gray-200 text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Resultado */}
        {step === 2 && (
          <div className="animate-fade-in">
            <p className="text-[10px] sm:text-xs text-purple-400 font-medium mb-3 uppercase tracking-wider">Resultado da análise</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Risco de enrolação</span>
                <span className="text-base sm:text-lg font-bold text-orange-500">68%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-1000" style={{width: '68%'}}></div>
              </div>
              <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-700">Desequilíbrio de investimento</p>
                  <p className="text-[10px] sm:text-xs text-red-600">Você está investindo mais</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-purple-50 rounded-xl border border-purple-200">
                <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-purple-700">Hipótese: Explorando opções</p>
                  <p className="text-[10px] sm:text-xs text-purple-600">Confiança média</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Indicadores de step */}
      <div className="px-4 sm:px-5 pb-4 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step === i ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/80 to-orange-50/60 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-orange-200/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-40 bg-white/70 backdrop-blur-xl border-b border-purple-100/50 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Animado */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <AnimatedLogo />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-purple-700 group-hover:text-purple-600 transition-colors">
                  Radar Match
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Coach de Relacionamentos
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-3">
              <Link 
                href="/terapeuta" 
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1 px-4 py-2"
              >
                Para Profissionais
                <ChevronRight className="w-4 h-4" />
              </Link>
              
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-200/50 border-0">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fazer Análise Grátis
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Hero Section */}
      <section className="relative z-10 pt-8 sm:pt-12 lg:pt-20 pb-12 sm:pb-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Lado esquerdo - Texto */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-purple-300/30 mb-6 animate-fade-in">
                  <Target className="h-4 w-4" />
                  <span>Seu coach de relacionamentos</span>
                </div>

                {/* Frase rotativa */}
                <div className="min-h-[56px] sm:min-h-[72px] mb-4 sm:mb-6 flex items-center justify-center lg:justify-start animate-fade-in-up">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 italic">
                    <span className="text-purple-500">"</span>
                    <RotatingPhrase />
                    <span className="text-purple-500">"</span>
                  </h2>
                </div>

                {/* Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight animate-fade-in-up animation-delay-100">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Sem viés. Sem julgamento.
                  </span>
                  <br />
                  <span className="text-gray-900">Só a verdade.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed animate-fade-in-up animation-delay-200 max-w-xl mx-auto lg:mx-0">
                  Responda sobre <strong className="text-purple-700">comportamentos</strong> — não sobre o que você acha.
                  E descubra o que os sinais realmente dizem.
                </p>

                {/* CTA com efeito de atenção */}
                <div className="flex flex-col items-center lg:items-start gap-4 animate-fade-in-up animation-delay-300">
                  {/* Container do botão com efeitos de direcionamento */}
                  <div className="relative w-full sm:w-auto">
                    {/* Ondas de pulso que expandem do botão - 4 camadas */}
                    <div className="absolute inset-0 -m-2 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-cta-pulse" />
                    <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-25 animate-cta-pulse animation-delay-150" />
                    <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-r from-purple-300 to-pink-300 opacity-20 animate-cta-pulse animation-delay-300" />
                    <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-r from-purple-200 to-pink-200 opacity-15 animate-cta-pulse animation-delay-450" />
                    
                    {/* Indicadores visuais apontando para o botão */}
                    <div className="hidden sm:block absolute -left-8 top-1/2 -translate-y-1/2 animate-bounce-right">
                      <div className="w-6 h-6 border-t-2 border-r-2 border-purple-400 rotate-45 opacity-60" />
                    </div>
                    <div className="hidden sm:block absolute -right-8 top-1/2 -translate-y-1/2 animate-bounce-left">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-pink-400 -rotate-45 opacity-60" />
                    </div>
                    
                    <Link href="/login" className="relative block">
                      <Button
                        size="lg"
                        className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl shadow-purple-300/50 hover:shadow-purple-400/60 transition-all duration-500 border-2 border-white/20 animate-cta-glow"
                      >
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-sparkle" />
                        <span>Fazer análise grátis</span>
                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Trust badges */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-500">
                    {["2 minutos", "Sem prints", "Sem julgamento"].map((badge, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lado direito - Demo animado */}
              <div className="flex justify-center lg:justify-end order-1 lg:order-2 animate-fade-in-up animation-delay-200">
                <AnimatedDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como usar */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Sua jornada começa aqui
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Como usar seu coach
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                É simples: responda sobre comportamentos, receba sua análise e, se quiser ir além, 
                converse com um especialista real.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Passo 1-3 */}
              {[
                { num: 1, title: "Faça sua análise", desc: "Responda 14 perguntas objetivas sobre os comportamentos do seu match. Leva apenas 2 minutos." },
                { num: 2, title: "Receba o resultado", desc: "Veja scores de interesse, red flags, green flags e a probabilidade de ghosting." },
                { num: 3, title: "Acompanhe a evolução", desc: "Salve múltiplos matches e veja se os sinais melhoram ou pioram com o tempo." },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-purple-100/50 border border-purple-100 h-full hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-200 transition-all duration-300">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg mb-4 shadow-lg shadow-purple-300/30">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                  {/* Connector (desktop only) */}
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-purple-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}

              {/* Passo 4 - Destaque */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-75 blur-sm animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 sm:p-6 border-2 border-purple-300 h-full">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    NOVO
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg mb-4 shadow-lg shadow-purple-300/30">
                    4
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Fale com um especialista</h3>
                  <p className="text-gray-600 text-sm">
                    Conecte-se com terapeutas e especialistas para uma orientação personalizada.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium text-xs sm:text-sm">
                    <Target className="w-4 h-4" />
                    <span>Seu próximo passo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA para especialistas */}
            <div className="mt-10 sm:mt-12 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-purple-200/30">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg">
                    <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                    Às vezes, você precisa de mais do que uma análise
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Nossa plataforma conecta você a <strong>terapeutas e especialistas</strong> que 
                    podem ajudar a interpretar seus resultados e te guiar para decisões mais saudáveis.
                  </p>
                </div>
                <div className="flex-shrink-0 relative">
                  {/* Ondas de pulso */}
                  <div className="absolute inset-0 -m-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-25 animate-cta-pulse" />
                  <div className="absolute inset-0 -m-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-15 animate-cta-pulse animation-delay-200" />
                  
                  <Link href="/login" className="relative block">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg whitespace-nowrap">
                      Começar agora
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: O problema de pedir opinião */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                O problema de pedir opinião
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Você conta sua versão. E recebe de volta o que você mesmo alimentou.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Amigo */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="bg-blue-100 p-2.5 sm:p-3 rounded-xl">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">Amigo(a)</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Você conta <strong>sua versão</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Quer te agradar ou proteger demais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Resposta baseada em emoção</span>
                  </li>
                </ul>
                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 italic text-xs sm:text-sm">"Acho que ele gosta de você, amiga!"</p>
                </div>
              </div>

              {/* ChatGPT */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="bg-green-100 p-2.5 sm:p-3 rounded-xl">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">ChatGPT</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Você descreve <strong>do seu jeito</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Reflete seu próprio viés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>Não questiona sua narrativa</span>
                  </li>
                </ul>
                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 italic text-xs sm:text-sm">"Parece que ele está interessado em você..."</p>
                </div>
              </div>

              {/* Radar Match */}
              <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl sm:rounded-tr-3xl">
                  DIFERENTE
                </div>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="bg-purple-100 p-2.5 sm:p-3 rounded-xl">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">Radar Match</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Você responde sobre <strong>FATOS</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Analisa comportamentos objetivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Resultado sem viés emocional</span>
                  </li>
                </ul>
                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-white rounded-xl border border-purple-200">
                  <p className="text-purple-700 font-semibold text-xs sm:text-sm">"Risco de enrolação: 68% — baseado em 4 sinais"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Fatos não opiniões */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Fatos, não opiniões
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                O formulário força objetividade. Você não conta sua história — você responde sobre comportamentos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { num: 1, color: "purple", title: "Responda sobre comportamentos", desc: '"Quem inicia as conversas?" não é opinião — é fato. "Cancelou e remarcou?" não é interpretação — é fato.' },
                { num: 2, color: "pink", title: "Receba análise objetiva", desc: "Scores baseados em padrões de relacionamentos saudáveis, não no que você quer ouvir." },
                { num: 3, color: "purple", title: "Tome decisões melhores", desc: "Saiba se vale continuar investindo ou se é hora de seguir em frente." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className={`bg-${step.color}-100 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6`}>
                    <span className={`text-xl sm:text-2xl font-bold text-${step.color}-600`}>{step.num}</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção: O que você descobre */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-10 sm:mb-12">
              O que você descobre
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: AlertTriangle, color: "red", title: "Sinais de alerta", desc: "Red flags que você pode estar ignorando — identificados automaticamente." },
                { icon: CheckCircle2, color: "green", title: "Sinais positivos", desc: "Green flags que talvez você não tenha notado — evidências de interesse genuíno." },
                { icon: TrendingUp, color: "orange", title: "Risco de ghosting", desc: "Previsão baseada em padrões — saiba a probabilidade antes de se apegar demais." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className={`bg-${item.color}-100 p-2.5 sm:p-3 rounded-xl w-fit mb-4`}>
                    <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Credibilidade */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-purple-100 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-6">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Seu coach com base em ciência
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8">
              Um coach de relacionamentos que usa os mesmos padrões que terapeutas de casal — aplicados ao seu match, sem viés.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
              {["Teoria do Apego (Bowlby)", "Pesquisas de Gottman", "Modelo de Investimento (Rusbult)"].map((item, i) => (
                <div key={i} className="bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border border-purple-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Tenha um coach de relacionamentos no bolso
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10">
              Análise objetiva do seu match em 2 minutos — sem viés, sem julgamento, só a verdade.
            </p>
            <div className="relative inline-block">
              {/* Ondas de pulso - brancas para contraste com fundo roxo */}
              <div className="absolute inset-0 -m-2 rounded-2xl bg-white opacity-20 animate-cta-pulse" />
              <div className="absolute inset-0 -m-4 rounded-2xl bg-white opacity-10 animate-cta-pulse animation-delay-200" />
              
              <Link href="/login" className="relative block">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/30 transition-all"
                >
                  Fazer minha análise grátis
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-white/70 mt-6 text-xs sm:text-sm">
              2 minutos • Sem prints • Sem julgamento
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-purple-100 py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Contato */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Dúvidas? Fale com o desenvolvedor</h3>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            {/* Informações */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-6 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
              {[
                { icon: Shield, text: "Privacidade garantida" },
                { icon: Zap, text: "Resultado em 2 min" },
                { icon: Sparkles, text: "Conforme LGPD" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-purple-600" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        
        .animation-delay-450 {
          animation-delay: 0.45s;
        }
        
        /* Animações do Logo - Zero Gravity */
        @keyframes zero-gravity {
          0% { 
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          20% { 
            transform: translateY(-3px) translateX(1px) rotate(0.5deg);
          }
          40% { 
            transform: translateY(-1px) translateX(2px) rotate(-0.5deg);
          }
          60% { 
            transform: translateY(-4px) translateX(-1px) rotate(0.3deg);
          }
          80% { 
            transform: translateY(-2px) translateX(-2px) rotate(-0.3deg);
          }
          100% { 
            transform: translateY(0) translateX(0) rotate(0deg);
          }
        }
        
        @keyframes zero-gravity-glow {
          0%, 100% { 
            opacity: 0.1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.2;
            transform: scale(1.1);
          }
        }
        
        .animate-zero-gravity {
          animation: zero-gravity 6s ease-in-out infinite;
        }
        
        .animate-zero-gravity-glow {
          animation: zero-gravity-glow 4s ease-in-out infinite;
        }
        
        /* Animações do CTA - Direcionamento de atenção */
        @keyframes cta-pulse {
          0% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.08);
            opacity: 0;
          }
          100% { 
            transform: scale(1.15);
            opacity: 0;
          }
        }
        
        @keyframes cta-glow {
          0%, 100% { 
            box-shadow: 0 20px 60px -10px rgba(168, 85, 247, 0.4);
          }
          50% { 
            box-shadow: 0 25px 70px -10px rgba(236, 72, 153, 0.5);
          }
        }
        
        @keyframes bounce-right {
          0%, 100% { 
            transform: translateY(-50%) translateX(0);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-50%) translateX(4px);
            opacity: 0.8;
          }
        }
        
        @keyframes bounce-left {
          0%, 100% { 
            transform: translateY(-50%) translateX(0);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-50%) translateX(-4px);
            opacity: 0.8;
          }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            transform: scale(1.1) rotate(5deg);
          }
        }
        
        .animate-cta-pulse {
          animation: cta-pulse 2s ease-out infinite;
        }
        
        .animate-cta-glow {
          animation: cta-glow 3s ease-in-out infinite;
        }
        
        .animate-bounce-right {
          animation: bounce-right 1.5s ease-in-out infinite;
        }
        
        .animate-bounce-left {
          animation: bounce-left 1.5s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
