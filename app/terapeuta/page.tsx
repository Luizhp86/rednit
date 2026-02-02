'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Users, 
  Mail, 
  MessageCircle, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Star,
  Phone,
  BarChart3,
  Target,
  Heart,
  Calendar,
  Play,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { DemoScheduler } from '@/components/demo-scheduler'

// Profissionais que podem se cadastrar
const profissionais = [
  { nome: "Terapeutas", cor: "text-emerald-400" },
  { nome: "Coaches", cor: "text-amber-400" },
  { nome: "Psicólogos", cor: "text-sky-400" },
  { nome: "Tarólogos", cor: "text-violet-400" },
  { nome: "Astrólogos", cor: "text-rose-400" },
  { nome: "Consteladores", cor: "text-teal-400" },
  { nome: "Terapeutas Florais", cor: "text-pink-400" },
  { nome: "Mentores", cor: "text-orange-400" },
]

// Componente de profissional rotativo
function RotatingProfessional() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % profissionais.length)
        setIsVisible(true)
      }, 200)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span 
      className={`inline-block transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${profissionais[currentIndex].cor} font-semibold`}
    >
      {profissionais[currentIndex].nome}
    </span>
  )
}

// Menu Mobile
function MobileMenu({ isOpen, onClose, onOpenDemo }: { isOpen: boolean; onClose: () => void; onOpenDemo: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-[280px] bg-slate-900 border-l border-slate-800 p-6 animate-slide-in-right">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <nav className="mt-12 flex flex-col gap-4">
          <button
            onClick={() => { onOpenDemo(); onClose(); }}
            className="flex items-center gap-3 text-slate-300 hover:text-emerald-400 transition-colors py-3 border-b border-slate-800"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Agendar Demo</span>
          </button>
          
          <Link 
            href="/terapeuta/login"
            onClick={onClose}
            className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors py-3 border-b border-slate-800"
          >
            <span className="font-medium">Entrar</span>
          </Link>
          
          <Link 
            href="/terapeuta/cadastro"
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Cadastrar Grátis
          </Link>
        </nav>
        
        <div className="absolute bottom-8 left-6 right-6">
          <a
            href="https://wa.me/5511937756627?text=Olá!%20Sou%20terapeuta%20e%20quero%20saber%20mais%20sobre%20o%20Radar%20Match"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-500 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default function TerapeutaLandingPage() {
  const [showDemoScheduler, setShowDemoScheduler] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Header */}
      <header className="relative z-40 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo com efeito zero gravity */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative animate-zero-gravity">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-lg animate-zero-gravity-glow" />
                <div className="relative">
                  <Logo size="lg" variant="dark" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Radar Match
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 tracking-wider uppercase">
                  Para Profissionais
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              <button 
                onClick={() => setShowDemoScheduler(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Ver Demo</span>
              </button>
              
              <Link href="/terapeuta/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                  Entrar
                </Button>
              </Link>
              
              <div className="relative">
                {/* 2 camadas de ondas */}
                <div className="absolute inset-0 -m-1 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25 animate-cta-pulse" />
                <div className="absolute inset-0 -m-2 rounded-md bg-gradient-to-r from-emerald-400 to-teal-400 opacity-15 animate-cta-pulse animation-delay-200" />
                
                <Link href="/terapeuta/cadastro" className="relative block">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/20">
                    Cadastrar Grátis
                  </Button>
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
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
        onOpenDemo={() => setShowDemoScheduler(true)}
      />

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm text-slate-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base border border-slate-700/50">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Ideal para</span>
                <RotatingProfessional />
              </div>
            </div>

            {/* Você coach, terapeuta... */}
            <p className="text-base sm:text-lg text-slate-400 text-center mb-4 animate-fade-in-up">
              Você <span className="text-emerald-400 font-medium">coach</span>, <span className="text-amber-400 font-medium">terapeuta</span>, <span className="text-sky-400 font-medium">psicólogo</span>, <span className="text-violet-400 font-medium">mentor</span>...
            </p>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight mb-6 sm:mb-8 animate-fade-in-up">
              <span className="text-white">Receba contatos de pessoas</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                que pediram ajuda profissional
              </span>
              <br />
              <span className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">sobre relacionamentos</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 text-center mb-8 sm:mb-10 max-w-2xl mx-auto px-4 animate-fade-in-up animation-delay-100">
              Conectamos você com pessoas que acabaram de fazer uma análise de relacionamento 
              e autorizaram que você entre em contato.
            </p>

            {/* CTA Principal com 4 camadas de ondas */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-200">
              <div className="relative w-full sm:w-auto">
                {/* 4 camadas de ondas de pulso */}
                <div className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 animate-cta-pulse" />
                <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-25 animate-cta-pulse animation-delay-150" />
                <div className="absolute inset-0 -m-6 rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-300 opacity-20 animate-cta-pulse animation-delay-300" />
                <div className="absolute inset-0 -m-8 rounded-2xl bg-gradient-to-r from-emerald-200 to-teal-200 opacity-15 animate-cta-pulse animation-delay-450" />
                
                <Link href="/terapeuta/cadastro" className="relative block w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500 border border-emerald-400/20"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>Começar agora</span>
                      <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Cadastro gratuito</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Aprovação em 24h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              {/* Explicação rápida - O que é lead */}
              <div className="mt-8 max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base text-slate-300 mb-1">
                      <strong className="text-white">Lead = contato autorizado.</strong> Você recebe nome, WhatsApp e contexto (análise que a pessoa fez).
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">
                      É como receber uma indicação quente: a pessoa já sabe que você vai entrar em contato.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profissionais Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-10 sm:mt-12 px-4 animate-fade-in-up animation-delay-300">
              {profissionais.map((prof, index) => (
                <span 
                  key={index}
                  className={`text-xs px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 ${prof.cor}`}
                >
                  {prof.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Banner */}
      <section className="relative z-10 py-8 sm:py-10 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-violet-600/20 border-y border-violet-500/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Play className="w-4 h-4 text-violet-400" />
                <span className="text-xs sm:text-sm font-medium text-violet-400 uppercase tracking-wider">
                  Demonstração Gratuita
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Quer ver como funciona na prática?
              </h3>
            </div>
            <Button
              onClick={() => setShowDemoScheduler(true)}
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-6 sm:px-8 py-5 sm:py-6 text-base font-bold rounded-xl shadow-xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* O que são Leads - Em português claro */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-cyan-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
                Entenda em 1 minuto
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                O que são leads? (em português claro)
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                Sem jargões de marketing. Veja exatamente o que você recebe e como funciona.
              </p>
            </div>

            {/* Cards Explicativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
              {/* O que É */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">O que É</h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                  Lead é uma <strong className="text-white">pessoa que pediu ajuda e autorizou que você entre em contato</strong>. Simples assim.
                </p>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs sm:text-sm text-slate-400 mb-2">
                    <strong className="text-emerald-400">Você recebe:</strong>
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Nome e WhatsApp da pessoa
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Resumo da situação (análise que fez)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Nível de interesse (básico/análise/premium)
                    </li>
                  </ul>
                </div>
              </div>

              {/* O que NÃO É */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">O que NÃO É</h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                  Não é "lista fria", não é spam. A pessoa <strong className="text-white">sabe que você vai ligar/chamar</strong>.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-400">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Não é ligação/mensagem fria para desconhecidos</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-400">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Não é garantia de cliente (é oportunidade qualificada)</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-400">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Não é banco de dados — cada lead é distribuído 1x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consentimento e Privacidade */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-blue-500/30">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base sm:text-lg mb-2">
                    Consentimento e privacidade
                  </h4>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Todos os usuários <strong className="text-white">forneceram o contato voluntariamente e autorizaram</strong> 
                    que especialistas entrem em contato. Seguimos a LGPD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
                Processo simples
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Como funciona
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Contatos qualificados chegam automaticamente. Sem prospecção, sem ligações frias para desconhecidos.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-emerald-500/30">
                      1
                    </div>
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    Usuário faz análise
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    O usuário responde nosso formulário sobre o comportamento do match e recebe uma análise detalhada.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                      14 perguntas objetivas
                    </span>
                  </div>
                </div>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 hover:border-teal-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-teal-500/30">
                      2
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    Você recebe o contato
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Quando a pessoa demonstra interesse, você recebe <strong className="text-white">nome, WhatsApp e contexto</strong> por email e notificação.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-xs sm:text-sm text-teal-400 font-medium">
                      Distribuição justa e equilibrada
                    </span>
                  </div>
                </div>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-teal-500 to-transparent" />
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 h-full">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full">
                    RESULTADO
                  </div>
                  <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-emerald-500/30">
                      3
                    </div>
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                    Você entra em contato
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Chame no WhatsApp e ofereça uma conversa inicial. Atendimento 100% online, de onde você estiver.
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/30">
                    <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                      Notificação em tempo real
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16">
              {[
                { value: "2min", label: "Tempo médio de análise", color: "emerald" },
                { value: "24h", label: "Para aprovação", color: "teal" },
                { value: "100%", label: "Contatos com consentimento", color: "cyan" },
                { value: "∞", label: "Potencial de conversão", color: "violet" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-800 text-center"
                >
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-${stat.color}-400 mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Leads */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
                Níveis de qualificação
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                3 tipos de contatos
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Quanto maior a intenção da pessoa, maior a chance de conversão
              </p>
            </div>

            {/* Lead Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Contato Básico */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">Contato Básico</h3>
                    <span className="text-xs text-sky-400 font-medium">Se cadastrou na plataforma</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Pessoa se cadastrou e deixou o telefone. Demonstrou interesse inicial em autoconhecimento.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-xs text-slate-500">Interesse inicial</span>
                </div>
              </div>

              {/* Contato de Análise */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border-2 border-amber-500/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">Contato de Análise</h3>
                    <span className="text-xs text-amber-400 font-medium">Completou análise de relacionamento</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Completou análise completa. Você recebe o contexto (padrões identificados, situação) para personalizar abordagem.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-xs text-slate-500">Engajado</span>
                </div>
              </div>

              {/* Contato Premium */}
              <div className="relative bg-gradient-to-br from-orange-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border-2 border-orange-500/50">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full">
                  PREMIUM
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">Contato Premium</h3>
                    <span className="text-xs text-orange-400 font-medium">Pediu para falar com especialista</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Clicou em "Falar com especialista" após a análise. Altíssima intenção de buscar orientação. Notificação imediata.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <span className="text-xs text-slate-500">Alta intenção</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como transformar leads em clientes - Playbook WhatsApp */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-green-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
                Mão na massa
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Como transformar leads em clientes
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                Roteiro prático de WhatsApp + dicas de conversão. Atendimento 100% online.
              </p>
            </div>

            {/* Regra de Velocidade */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-green-500/50 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl flex-shrink-0">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Regra #1: Responder rápido aumenta conversão
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Leads atendidos nas <strong className="text-green-400">primeiras 2 horas</strong> têm 
                    até 3x mais chance de conversão. Configure notificações no WhatsApp e email.
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagens Prontas */}
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                3 mensagens prontas (copie e personalize)
              </h3>
              
              <div className="space-y-6">
                {/* Mensagem 1 - Primeiro Contato */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      1
                    </div>
                    <h4 className="font-bold text-white text-base sm:text-lg">
                      Primeiro contato (imediato)
                    </h4>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                      {`Olá, [NOME]! Tudo bem? 😊

Meu nome é [SEU NOME], sou [sua profissão] especializado(a) em relacionamentos.

Vi que você fez uma análise no Radar Match e pode estar buscando orientação. Estou aqui para ajudar!

Que tal conversarmos 10 minutos por chamada? Sem compromisso, só para eu entender sua situação e ver como posso te apoiar.

Qual horário funciona melhor pra você hoje ou amanhã?`}
                    </p>
                  </div>
                </div>

                {/* Mensagem 2 - Follow-up 24h */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      2
                    </div>
                    <h4 className="font-bold text-white text-base sm:text-lg">
                      Follow-up 24h (se não respondeu)
                    </h4>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                      {`Oi, [NOME]!

Imagino que você deve estar ocupado(a). Mas queria deixar mais uma mensagem porque vi na sua análise que [mencione algo específico - ex: "você identificou alguns sinais que te deixaram confusa"].

Já passei por muitos casos parecidos e sei que pode ajudar bastante conversar sobre isso.

Se quiser, me chama aqui no WhatsApp. Estou por aqui! 💬`}
                    </p>
                  </div>
                </div>

                {/* Mensagem 3 - Follow-up 72h */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                      3
                    </div>
                    <h4 className="font-bold text-white text-base sm:text-lg">
                      Follow-up 72h (fechamento leve)
                    </h4>
                  </div>
                  <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-4">
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                      {`[NOME], tudo bem?

Essa é minha última mensagem por aqui para não te incomodar! 😊

Se em algum momento você quiser conversar sobre relacionamentos ou tiver dúvidas, é só me chamar. Vou deixar meu contato salvo aqui.

Desejo tudo de bom pra você! 🌟`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist de Conversão */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Checklist antes de entrar em contato
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Revise o contexto do lead</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Leia a análise que a pessoa fez</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Tenha horários disponíveis</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Ofereça 2-3 opções concretas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Link de agendamento pronto</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Calendly, Google Calendar ou similar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Proposta clara</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Chamada de 10min ou sessão inicial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
                <Star className="w-4 h-4" />
                ESCOLHA SEU PLANO
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4">
                Invista no seu crescimento
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Quanto maior o plano, mais tipos de contatos qualificados você recebe.
                <strong className="text-white"> Comece hoje e cancele quando quiser.</strong>
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Basic */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 hover:border-slate-700 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">Basic</h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">R$ 79</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">Para começar a receber contatos</p>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm sm:text-base">Contatos básicos (cadastros)</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                    <span className="text-slate-500 text-sm sm:text-base">Contatos de análise</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                    <span className="text-slate-500 text-sm sm:text-base">Contatos premium (alta intenção)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm sm:text-base">Notificação por email</span>
                  </li>
                </ul>
                
                <Link href="/terapeuta/cadastro" className="block">
                  <Button variant="outline" className="w-full py-5 sm:py-6 text-base font-semibold border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600">
                    Começar agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Intermediate - DESTAQUE */}
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-2xl sm:rounded-3xl blur-sm opacity-75" />
                
                <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 h-full">
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    MAIS POPULAR
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-xl sm:text-2xl text-white">Intermediate</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">R$ 149</span>
                      <span className="text-slate-500">/mês</span>
                    </div>
                    <p className="text-emerald-400 text-sm font-medium mt-1">Melhor custo-benefício</p>
                  </div>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 text-sm sm:text-base">Contatos básicos (cadastros)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-white font-medium text-sm sm:text-base">Contatos de análise</span>
                    </li>
                    <li className="flex items-center gap-3 opacity-40">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                      <span className="text-slate-500 text-sm sm:text-base">Contatos premium (alta intenção)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 text-sm sm:text-base">Notificação por email</span>
                    </li>
                  </ul>
                  
                  <Link href="/terapeuta/cadastro" className="block">
                    <Button className="w-full py-5 sm:py-6 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/30">
                      <Zap className="w-5 h-5 mr-2" />
                      Começar agora
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-violet-500/30 hover:border-violet-500/50 transition-all relative">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full">
                  COMPLETO
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">Pro</h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">R$ 249</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <p className="text-violet-400 text-sm font-medium mt-1">Todos os tipos de contatos</p>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm sm:text-base">Contatos básicos (cadastros)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm sm:text-base">Contatos de análise</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-white font-bold text-sm sm:text-base">Contatos premium (alta intenção)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm sm:text-base">WhatsApp direto do usuário</span>
                  </li>
                </ul>
                
                <Link href="/terapeuta/cadastro" className="block">
                  <Button className="w-full py-5 sm:py-6 text-base font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 shadow-lg shadow-violet-500/30">
                    <Star className="w-5 h-5 mr-2" />
                    Começar agora
                  </Button>
                </Link>
              </div>
            </div>

            {/* Garantia */}
            <div className="mt-10 sm:mt-12 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm border border-slate-800 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                <div className="text-left">
                  <p className="font-bold text-white text-sm sm:text-base">Satisfação garantida</p>
                  <p className="text-xs sm:text-sm text-slate-500">Cancele a qualquer momento, sem multas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-10 sm:mb-12">
              Por que o Radar Match?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: Target, color: "emerald", title: "Contatos pré-qualificados", desc: "Pessoas que já demonstraram interesse em ajuda profissional. Não são ligações frias para desconhecidos." },
                { icon: Heart, color: "rose", title: "Contexto completo", desc: "Você recebe os dados da análise (padrões identificados, situação) para personalizar sua abordagem." },
                { icon: Zap, color: "amber", title: "Distribuição justa", desc: "Sistema automático garante que todos os profissionais ativos recebam oportunidades de forma equilibrada." },
                { icon: Shield, color: "violet", title: "Sem compromisso", desc: "Cancele quando quiser. Sem multas, sem burocracia. Você paga apenas enquanto estiver ativo." },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center mb-4`}>
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-400`} />
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quem pode se cadastrar */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">
              Quem pode se cadastrar?
            </h2>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { nome: "Terapeutas", cor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                { nome: "Coaches", cor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                { nome: "Psicólogos", cor: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
                { nome: "Tarólogos", cor: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
                { nome: "Astrólogos", cor: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
                { nome: "Consteladores", cor: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
                { nome: "Terapeutas Florais", cor: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
                { nome: "E mais...", cor: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
              ].map((prof, i) => (
                <span key={i} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${prof.cor}`}>
                  {prof.nome}
                </span>
              ))}
            </div>

            <p className="text-slate-400 text-sm sm:text-base mb-8">
              Aceitamos profissionais de diversas áreas que trabalham com 
              orientação em relacionamentos. Nossa equipe analisa seu perfil em até 24h.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ - Perguntas Frequentes */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-violet-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
                Dúvidas comuns
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Perguntas frequentes
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Respostas diretas para as principais dúvidas dos profissionais
              </p>
            </div>

            {/* FAQ Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* FAQ 1 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Os leads são exclusivos?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sim, cada lead é distribuído para <strong className="text-white">apenas 1 profissional</strong>. 
                  Você não compete com outros pelo mesmo contato.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Como funciona o rodízio?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sistema automático distribui leads de forma <strong className="text-white">equilibrada e justa</strong> entre 
                  profissionais ativos do mesmo plano. Quanto mais atendimentos você fizer, mais leads recebe.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  O atendimento é online?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sim! Todo o atendimento é <strong className="text-white">100% online via WhatsApp ou videochamada</strong>. 
                  Atenda de qualquer lugar, sem limitação geográfica.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  O que eu recebo quando chega um lead?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  <strong className="text-white">Nome, WhatsApp, email</strong> e resumo da situação (análise que a pessoa fez). 
                  Notificação via email + WhatsApp em tempo real.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Isso garante clientes?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Não garantimos conversão, mas fornecemos <strong className="text-white">oportunidades qualificadas</strong>. 
                  A conversão depende da sua abordagem, experiência e fit com a pessoa.
                </p>
              </div>

              {/* FAQ 6 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Posso cancelar quando quiser?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sim! <strong className="text-white">Sem multas, sem burocracia</strong>. Cancele ou pause a qualquer momento 
                  pela plataforma. Você paga apenas enquanto estiver ativo.
                </p>
              </div>

              {/* FAQ 7 */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Quantos leads vou receber por mês?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Varia conforme o <strong className="text-white">volume de usuários e seu plano</strong>. 
                  Em média, profissionais ativos recebem de 5 a 15 leads/mês, mas pode variar.
                </p>
              </div>

              {/* FAQ 8 - Psicólogos */}
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-800">
                <h3 className="font-bold text-white text-base sm:text-lg mb-3">
                  Sou psicólogo(a), posso usar?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Sim! Mas lembre-se de <strong className="text-white">seguir as normas do CRP</strong> sobre divulgação 
                  e publicidade. O Radar Match não substitui suas obrigações éticas e profissionais.
                </p>
              </div>
            </div>

            {/* CTA do FAQ */}
            <div className="mt-10 sm:mt-12 text-center">
              <p className="text-slate-400 text-sm sm:text-base mb-4">
                Ainda tem dúvidas?
              </p>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Tenho%20dúvidas%20sobre%20o%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Comece a receber contatos hoje
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10">
              Cadastre-se gratuitamente e comece a receber contatos qualificados 
              de pessoas buscando orientação em relacionamentos.
            </p>
            
            <div className="relative inline-block">
              {/* 2 camadas de ondas */}
              <div className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25 animate-cta-pulse" />
              <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-15 animate-cta-pulse animation-delay-200" />
              
              <Link href="/terapeuta/cadastro" className="relative block">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/30"
                >
                  Criar minha conta grátis
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>
            </div>
            
            <p className="text-slate-500 mt-6 text-xs sm:text-sm">
              Aprovação em até 24h • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Dúvidas?</h3>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Sou%20terapeuta%20e%20quero%20saber%20mais%20sobre%20o%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 bg-green-600 hover:bg-green-500 text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-6 border-t border-slate-800 text-xs sm:text-sm text-slate-500">
              <Link href="/" className="hover:text-emerald-400 transition-colors">
                ← Voltar para usuários
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Dados protegidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Aprovação em 24h</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Agendamento */}
      <DemoScheduler 
        isOpen={showDemoScheduler} 
        onClose={() => setShowDemoScheduler(false)} 
      />

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
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
        
        /* Animações de pulso para CTAs */
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
        
        .animate-cta-pulse {
          animation: cta-pulse 2s ease-out infinite;
        }
        
        /* Animações do Logo - Zero Gravity */
        @keyframes zero-gravity {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          20% { transform: translateY(-2px) translateX(0.5px) rotate(0.3deg); }
          40% { transform: translateY(-0.5px) translateX(1px) rotate(-0.3deg); }
          60% { transform: translateY(-2.5px) translateX(-0.5px) rotate(0.2deg); }
          80% { transform: translateY(-1px) translateX(-1px) rotate(-0.2deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        
        @keyframes zero-gravity-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
        
        .animate-zero-gravity {
          animation: zero-gravity 6s ease-in-out infinite;
        }
        
        .animate-zero-gravity-glow {
          animation: zero-gravity-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
