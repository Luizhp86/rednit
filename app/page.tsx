'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, MessageCircle, Bot, Target, Brain, CheckCircle2, AlertTriangle, TrendingUp, ChevronRight, Menu, X, Heart, Flame, User } from 'lucide-react'
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
      className={`inline transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      <span className="text-gradient-primary">"</span>
      {rotatingPhrases[currentIndex]}
      <span className="text-gradient-primary">"</span>
    </span>
  )
}

// Menu Mobile
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-purple-100 p-6 shadow-2xl animate-slide-in-right">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mt-16 space-y-2">
          <Link 
            href="/terapeuta"
            onClick={onClose}
            className="flex items-center gap-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-4 px-4 rounded-xl transition-all group"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Para Profissionais</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link 
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg mt-6"
          >
            <Sparkles className="w-5 h-5" />
            Fazer Análise Grátis
          </Link>
        </div>
        
        <div className="absolute bottom-8 left-6 right-6">
          <a
            href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Radar%20Match"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-medium hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// Componente de botão flutuante (mobile)
function FloatingCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botão quando rolar mais de 300px
      setShow(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-t from-white/95 via-white/90 to-transparent backdrop-blur-lg border-t border-purple-100/50 shadow-lg">
        <div className="container mx-auto px-4 py-3 pb-safe">
          <Link href="/login" className="block">
            <button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white py-4 rounded-2xl text-base font-bold transition-all inline-flex items-center justify-center gap-2.5 shadow-xl shadow-purple-500/30 active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              <span>Fazer Análise Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
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
    <div className="relative">
      {/* Glow effect behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-[2.5rem] blur-2xl animate-float" />
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-purple-100 overflow-hidden w-full max-w-[320px] sm:max-w-sm mx-auto">
        {/* Header do "app" */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-5 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
          </div>
          <span className="text-white text-xs font-bold ml-2 tracking-wide">Radar Match</span>
        </div>
        
        {/* Conteúdo animado */}
        <div className="p-5 sm:p-6 min-h-[220px] sm:min-h-[240px] flex flex-col justify-center">
          {/* Step 0: Pergunta com cards coloridos */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <p className="text-[10px] sm:text-xs text-purple-500 font-semibold mb-2 uppercase tracking-wider">Pergunta 1 de 14</p>
              <p className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-5">Sobre quem você quer analisar?</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Card Ela - Rosa */}
                <div className="p-4 rounded-xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 transition-all cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-pink-700">Ela</span>
                </div>
                {/* Card Ele - Azul */}
                <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-700">Ele</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 1: Card selecionado */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <p className="text-[10px] sm:text-xs text-purple-500 font-semibold mb-2 uppercase tracking-wider">Pergunta 1 de 14</p>
              <p className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-5">Sobre quem você quer analisar?</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Card Ela - Selecionado */}
                <div className="p-4 rounded-xl border-2 border-pink-500 bg-pink-100 ring-2 ring-pink-300 transition-all cursor-pointer flex flex-col items-center gap-2 relative">
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-pink-700">Ela</span>
                </div>
                {/* Card Ele - Não selecionado */}
                <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 transition-all cursor-pointer flex flex-col items-center gap-2 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-500">Ele</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Resultado */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <p className="text-[10px] sm:text-xs text-purple-500 font-semibold mb-4 uppercase tracking-wider">Resultado da análise</p>
              <div className="space-y-3">
                {/* Score de Investimento */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Investimento dela</span>
                  <span className="text-lg font-bold text-orange-500">Baixo</span>
                </div>
                {/* Score de Reciprocidade */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Reciprocidade</span>
                  <span className="text-lg font-bold text-red-500">23%</span>
                </div>
                {/* Flag de Alerta */}
                <div className="flex items-start gap-3 p-3.5 bg-red-50 rounded-2xl border border-red-200">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-700">Desequilíbrio detectado</p>
                    <p className="text-xs text-red-600 mt-0.5">Você está investindo mais</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Indicadores de step */}
        <div className="px-5 sm:px-6 pb-5 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === i ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay">
      {/* Background ambient effects - igual ao dashboard */}
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

      {/* Header - igual ao dashboard */}
      <header className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Logo size="lg" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold text-purple-700 hidden md:block">
                  Radar Match
                </span>
                <span className="text-xs md:text-xs text-gray-500">
                  Seu coach de relacionamentos
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link 
                href="/terapeuta" 
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1"
              >
                Para Profissionais
                <ChevronRight className="w-4 h-4" />
              </Link>
              
              <Link href="/login">
                <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold transition-all inline-flex items-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]">
                  <Sparkles className="w-5 h-5" />
                  <span>Fazer Análise Grátis</span>
                </button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
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
      <section className="relative z-10 pt-10 sm:pt-14 lg:pt-20 pb-16 sm:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Lado esquerdo - Texto */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/25 mb-6 animate-fade-in-up">
                  <Target className="h-4 w-4" />
                  <span>Seu coach de relacionamentos</span>
                </div>

                {/* Frase rotativa */}
                <div className="min-h-[56px] sm:min-h-[72px] mb-4 sm:mb-6 flex items-center justify-center lg:justify-start animate-fade-in-up animation-delay-100">
                  <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 italic">
                    <RotatingPhrase />
                  </h2>
                </div>

                {/* Headline */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-5 sm:mb-6 leading-tight tracking-tight animate-fade-in-up animation-delay-200">
                  <span className="text-gradient-primary">
                    Sem viés. Sem julgamento.
                  </span>
                  <br />
                  <span className="text-gray-900">Te ajudo a entender os sinais.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed animate-fade-in-up animation-delay-300 max-w-xl mx-auto lg:mx-0">
                  Responda sobre <strong className="text-purple-600 font-semibold">comportamentos</strong> — não sobre o que você acha.
                  E descubra o que os sinais realmente dizem.
                </p>

                {/* CTA com efeito de atenção */}
                <div className="flex flex-col items-center lg:items-start gap-5 animate-fade-in-up animation-delay-400">
                  {/* Container do botão com efeitos */}
                  <div className="relative inline-block">
                    {/* Pulsing glow effect */}
                    <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 animate-cta-pulse blur-xl" />
                    <div className="absolute inset-0 -m-5 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-cta-pulse animation-delay-150 blur-2xl" />
                    
                    <Link href="/login" className="relative block">
                      <button className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all inline-flex items-center justify-center gap-3 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.98]">
                        <Flame className="w-6 h-6" />
                        <span>Fazer análise grátis</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  </div>
                  
                  {/* Trust badges */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-500">
                    {["100% Grátis", "2 minutos", "Sem julgamento"].map((badge, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lado direito - Demo animado (apenas desktop) */}
              <div className="hidden lg:flex justify-center lg:justify-end order-1 lg:order-2 animate-fade-in-up animation-delay-300">
                <AnimatedDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como usar */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14 sm:mb-18 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-purple-200">
                <Sparkles className="h-4 w-4" />
                Sua jornada começa aqui
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                Como usar seu <span className="text-gradient-primary">coach</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                É simples: responda sobre comportamentos, receba sua análise e, se quiser ir além, 
                converse com um especialista real.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {/* Passo 1-3 */}
              {[
                { num: 1, title: "Faça sua análise", desc: "Responda algumas perguntas objetivas sobre os comportamentos do seu match. Leva apenas 2 minutos.", color: "purple" },
                { num: 2, title: "Receba o resultado", desc: "Veja scores de interesse, red flags, green flags e a probabilidade de ghosting.", color: "pink" },
                { num: 3, title: "Acompanhe a evolução", desc: "Salve múltiplos matches e veja se os sinais melhoram ou pioram com o tempo.", color: "orange" },
              ].map((step, i) => (
                <div key={i} className="relative group animate-fade-in-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-lg border border-purple-100 h-full hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:scale-[1.02]">
                    <div className={`bg-gradient-to-br ${
                      step.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      step.color === 'pink' ? 'from-pink-500 to-pink-600' :
                      'from-orange-500 to-orange-600'
                    } text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl mb-5 shadow-lg`}>
                      {step.num}
                    </div>
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  {/* Connector (desktop only) */}
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-purple-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Passo 4 - Destaque */}
              <div className="relative sm:col-span-2 lg:col-span-1 animate-fade-in-up animation-delay-500">
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl opacity-75 blur-sm animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200 h-full">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    NOVO
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl mb-5 shadow-lg shadow-purple-500/30">
                    4
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Fale com um especialista</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Conecte-se com terapeutas e especialistas para uma orientação personalizada.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-purple-600 font-semibold text-sm">
                    <Target className="w-4 h-4" />
                    <span>Seu próximo passo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA para especialistas */}
            <div className="mt-14 sm:mt-16 animate-fade-in-up animation-delay-600">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2rem] blur-2xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 sm:p-10 lg:p-12 shadow-xl border border-purple-100">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30" />
                        <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-5 rounded-2xl border border-purple-200">
                          <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        Às vezes, você precisa de mais do que uma análise
                      </h3>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                        Nossa plataforma conecta você a <strong className="text-purple-600">terapeutas e especialistas</strong> que 
                        podem ajudar a interpretar seus resultados e te guiar para decisões mais saudáveis.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href="/login">
                        <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all inline-flex items-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]">
                          Começar agora
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: O problema de pedir opinião */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 sm:mb-18 animate-fade-in-up">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                O problema de pedir <span className="text-gradient-primary">opinião</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed">
                Você conta sua versão. E recebe de volta o que você mesmo alimentou.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Amigo */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 animate-fade-in-up animation-delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-2xl border border-blue-200">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Amigo(a)</h3>
                </div>
                <ul className="space-y-4 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Você conta <strong className="text-gray-900">sua versão</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Quer te agradar ou proteger demais</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Resposta baseada em emoção</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-gray-500 italic text-sm">"Acho que ele gosta de você, amiga!"</p>
                </div>
              </div>

              {/* ChatGPT */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl border border-emerald-200">
                    <Bot className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900">ChatGPT</h3>
                </div>
                <ul className="space-y-4 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Você descreve <strong className="text-gray-900">do seu jeito</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Reflete seu próprio viés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span>Não questiona sua narrativa</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-gray-500 italic text-sm">"Parece que ele está interessado em você..."</p>
                </div>
              </div>

              {/* Radar Match */}
              <div className="relative animate-fade-in-up animation-delay-400">
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl opacity-60 blur-sm"></div>
                <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl p-6 sm:p-8 border border-purple-200 h-full">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl">
                    DIFERENTE
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-3 rounded-2xl border border-purple-200">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-gray-900">Radar Match</h3>
                  </div>
                  <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span>Você responde sobre <strong className="text-purple-600">FATOS</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span>Analisa comportamentos objetivos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span>Resultado sem viés emocional</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-4 bg-white rounded-2xl border border-purple-200 shadow-sm">
                    <p className="text-purple-700 font-bold text-sm">"Risco de enrolação: 68% — baseado em 4 sinais"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Fatos não opiniões */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 sm:mb-18 animate-fade-in-up">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                Fatos, não <span className="text-gradient-primary">opiniões</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed">
                O formulário força objetividade. Você não conta sua história — você responde sobre comportamentos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {[
                { num: 1, color: "purple", title: "Responda sobre comportamentos", desc: '"Quem inicia as conversas?" não é opinião — é fato. "Cancelou e remarcou?" não é interpretação — é fato.' },
                { num: 2, color: "pink", title: "Receba análise objetiva", desc: "Scores baseados em padrões de relacionamentos saudáveis, não no que você quer ouvir." },
                { num: 3, color: "orange", title: "Tome decisões melhores", desc: "Saiba se vale continuar investindo ou se é hora de seguir em frente." },
              ].map((step, i) => (
                <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <div className={`bg-gradient-to-br ${
                    step.color === 'purple' ? 'from-purple-100 to-purple-200 border-purple-200' :
                    step.color === 'pink' ? 'from-pink-100 to-pink-200 border-pink-200' :
                    'from-orange-100 to-orange-200 border-orange-200'
                  } w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border shadow-lg`}>
                    <span className={`text-3xl font-bold ${
                      step.color === 'purple' ? 'text-purple-600' :
                      step.color === 'pink' ? 'text-pink-600' :
                      'text-orange-600'
                    }`}>{step.num}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção: O que você descobre */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16 tracking-tight animate-fade-in-up">
              O que você <span className="text-gradient-primary">descobre</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { icon: AlertTriangle, colorBg: "bg-red-50", colorBorder: "border-red-200", colorIcon: "text-red-600", colorIconBg: "bg-red-100", title: "Sinais de alerta", desc: "Red flags que você pode estar ignorando — identificados automaticamente." },
                { icon: CheckCircle2, colorBg: "bg-emerald-50", colorBorder: "border-emerald-200", colorIcon: "text-emerald-600", colorIconBg: "bg-emerald-100", title: "Sinais positivos", desc: "Green flags que talvez você não tenha notado — evidências de interesse genuíno." },
                { icon: TrendingUp, colorBg: "bg-orange-50", colorBorder: "border-orange-200", colorIcon: "text-orange-600", colorIconBg: "bg-orange-100", title: "Risco de ghosting", desc: "Previsão baseada em padrões — saiba a probabilidade antes de se apegar demais." },
              ].map((item, i) => (
                <div key={i} className={`${item.colorBg} rounded-3xl p-6 sm:p-7 border ${item.colorBorder} hover:shadow-xl transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <div className={`${item.colorIconBg} p-3 rounded-2xl w-fit mb-5 border ${item.colorBorder}`}>
                    <item.icon className={`h-6 w-6 ${item.colorIcon}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Credibilidade */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative p-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border border-purple-200">
                <Brain className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Seu coach com base em <span className="text-gradient-primary">ciência</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-10 leading-relaxed">
              Um coach de relacionamentos que usa padrões de terapeutas de casal para te ajudar a enxergar com mais clareza.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
              {["Teoria do Apego (Bowlby)", "Pesquisas de Gottman", "Modelo de Investimento (Rusbult)"].map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg border border-purple-100 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600" />
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center text-white animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Tenha um coach de relacionamentos no bolso
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              Análise objetiva do seu match em 2 minutos — 100% grátis, sem julgamento.
            </p>
            <div className="relative inline-block">
              {/* Ondas de pulso - brancas */}
              <div className="absolute inset-0 -m-2 rounded-2xl bg-white opacity-20 animate-cta-pulse" />
              <div className="absolute inset-0 -m-4 rounded-2xl bg-white opacity-10 animate-cta-pulse animation-delay-200" />
              
              <Link href="/login" className="relative block">
                <button className="group w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 px-10 py-5 rounded-2xl text-lg sm:text-xl font-bold transition-all inline-flex items-center justify-center gap-3 shadow-2xl hover:shadow-white/30 hover:scale-[1.02] active:scale-[0.98]">
                  <Flame className="w-6 h-6" />
                  <span>Fazer minha análise grátis</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
            <p className="text-white/70 mt-8 text-sm sm:text-base">
              100% Grátis • 2 minutos • Sem julgamento
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-purple-100/50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Contato */}
            <div className="text-center mb-10">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-5">Dúvidas, sugestões ou reclamações? Fale com o desenvolvedor via WhatsApp</h3>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            {/* Informações */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5 sm:gap-8 pt-8 border-t border-gray-200 text-sm text-gray-600">
              {[
                { icon: Shield, text: "Privacidade garantida" },
                { icon: Zap, text: "Resultado em 2 min" },
                { icon: Sparkles, text: "Conforme LGPD" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200">
                    <item.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Botão flutuante mobile */}
      <FloatingCTA />

      {/* Custom Styles - utilizando animações já definidas no globals.css + adicionais */}
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
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}
