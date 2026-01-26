'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Users, 
  TrendingUp, 
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
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { DemoScheduler } from '@/components/demo-scheduler'

// Profissionais que podem se cadastrar
const profissionais = [
  { nome: "Terapeutas", cor: "text-emerald-600" },
  { nome: "Coaches", cor: "text-teal-600" },
  { nome: "Psicólogos", cor: "text-cyan-600" },
  { nome: "Tarólogos", cor: "text-purple-600" },
  { nome: "Astrólogos", cor: "text-indigo-600" },
  { nome: "Consteladores", cor: "text-pink-600" },
  { nome: "Terapeutas Florais", cor: "text-rose-600" },
  { nome: "Mentores", cor: "text-amber-600" },
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
      }, 300)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <span 
      className={`inline-block transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${profissionais[currentIndex].cor} font-bold`}
    >
      {profissionais[currentIndex].nome}
    </span>
  )
}

export default function TerapeutaLandingPage() {
  const [showDemoScheduler, setShowDemoScheduler] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-emerald-700">
                Radar Match
              </span>
              <span className="text-xs text-gray-500 hidden md:block">
                Para Profissionais
              </span>
            </div>
          </Link>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowDemoScheduler(true)}
              variant="outline" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50 hidden sm:flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Agendar Demo
            </Button>
            <Link href="/terapeuta/login">
              <Button variant="ghost" className="text-emerald-700 hover:text-emerald-800">
                Entrar
              </Button>
            </Link>
            <Link href="/terapeuta/cadastro">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge rotativo com profissionais */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-full text-lg font-medium shadow-lg border border-gray-200">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Ideal para</span>
              <RotatingProfessional />
            </div>
          </div>

          {/* Indicadores dos profissionais */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {profissionais.map((prof, index) => (
              <span 
                key={index}
                className={`text-xs px-3 py-1 rounded-full bg-white/60 border border-gray-200 ${prof.cor}`}
              >
                {prof.nome}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Receba leads qualificados de{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              pessoas buscando ajuda
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Conectamos você com usuários que acabaram de fazer uma análise de relacionamento 
            e estão prontos para receber orientação profissional.
          </p>

          {/* CTA */}
          <div className="relative flex flex-col items-center">
            {/* Glow pulsante por trás do botão */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-50 blur-3xl animate-pulse pointer-events-none"></div>
            
            <Link href="/terapeuta/cadastro">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 text-white px-14 py-8 text-2xl md:text-3xl font-bold rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-4 border-white/30 z-10"
              >
                {/* Efeito shimmer */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                <span className="relative flex items-center gap-3">
                  <Zap className="h-7 w-7" />
                  <span>Começar agora</span>
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </Link>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-gray-600 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cadastro gratuito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Aprovação em 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Destacada - Agendar Demonstração */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left text-white">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Demonstração Gratuita
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Quer ver como funciona na prática?
              </h2>
              <p className="text-white/90">
                Agende uma demonstração gratuita de 15 minutos e veja como o Radar Match pode ajudar seu negócio.
              </p>
            </div>
            <Button
              onClick={() => setShowDemoScheduler(true)}
              size="lg"
              className="group relative overflow-hidden bg-white text-purple-700 hover:bg-gray-50 px-10 py-7 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 border-4 border-white/50 whitespace-nowrap"
            >
              {/* Efeito shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
              {/* Brilho pulsante na borda */}
              <span className="absolute inset-0 rounded-2xl border-2 border-purple-300 animate-pulse"></span>
              <span className="relative flex items-center gap-3">
                <Calendar className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Agendar Demonstração</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Como Funciona */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4" />
                Simples e eficiente
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Como funciona
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Leads qualificados chegam até você automaticamente. Sem prospecção, sem cold calling.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Passo 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl shadow-emerald-100/50 border-2 border-gray-200 h-full hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      1
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">Usuário faz análise</h3>
                  <p className="text-gray-600">
                    O usuário responde nosso formulário sobre o comportamento do match e recebe uma análise detalhada.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-emerald-600 font-medium">14 perguntas objetivas</span>
                  </div>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-emerald-300 z-10">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              {/* Passo 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl shadow-teal-100/50 border-2 border-gray-200 h-full hover:shadow-2xl hover:border-teal-300 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      2
                    </div>
                    <div className="bg-teal-100 p-3 rounded-xl group-hover:bg-teal-200 transition-colors">
                      <Users className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">Lead é distribuído</h3>
                  <p className="text-gray-600">
                    Quando o usuário demonstra interesse em ajuda profissional, distribuímos o lead para você.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-teal-600 font-medium">Sistema de rodízio justo</span>
                  </div>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-teal-300 z-10">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              {/* Passo 3 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl shadow-emerald-200/50 border-2 border-emerald-300 h-full hover:shadow-2xl transition-all duration-300 group">
                  {/* Badge de destaque */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    RESULTADO
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      3
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
                      <Phone className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">Você entra em contato</h3>
                  <p className="text-gray-600">
                    Receba os dados do lead por email e WhatsApp. Entre em contato e converta em cliente.
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <span className="text-sm text-emerald-700 font-medium">Notificação em tempo real</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-emerald-600 mb-1">2min</div>
                <div className="text-sm text-gray-600">Tempo médio de análise</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-teal-600 mb-1">24h</div>
                <div className="text-sm text-gray-600">Para aprovação</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-cyan-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">Leads qualificados</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-emerald-600 mb-1">∞</div>
                <div className="text-sm text-gray-600">Potencial de conversão</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Leads */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              3 níveis de leads
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Quanto mais quente o lead, maior a chance de conversão
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Lead Frio */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Lead Básico</h3>
                    <span className="text-xs text-blue-600 font-medium">Cadastrou telefone</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Usuário se cadastrou na plataforma e deixou o telefone. Demonstrou interesse inicial.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                  <span>Frio</span>
                </div>
              </div>

              {/* Lead Morno */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Lead de Análise</h3>
                    <span className="text-xs text-amber-600 font-medium">Completou análise</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Usuário completou uma análise de match. Você recebe os dados da análise (red flags, scores).
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                  <span>Morno</span>
                </div>
              </div>

              {/* Lead Quente */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border-2 border-orange-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  PREMIUM
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Lead Premium</h3>
                    <span className="text-xs text-orange-600 font-medium">Quer falar com especialista</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Usuário clicou em "Falar com especialista". Altíssima intenção. Abre WhatsApp direto.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  </div>
                  <span>Quente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planos - Seção Principal */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-24 overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho da seção */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold mb-6 border border-white/30">
                <Star className="h-5 w-5 text-yellow-300" />
                <span>ESCOLHA SEU PLANO</span>
                <Star className="h-5 w-5 text-yellow-300" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Invista no seu crescimento
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Quanto maior o plano, mais tipos de leads qualificados você recebe. 
                <strong className="text-white"> Comece hoje e cancele quando quiser.</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Plano Basic */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 hover:border-emerald-300 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <Mail className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900">Basic</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-900">R$ 79</span>
                  <span className="text-gray-500 text-lg">/mês</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Para começar a receber leads</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                    <span>Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                    <span>Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Notificação por email</span>
                  </li>
                </ul>
                
                <Link href="/terapeuta/cadastro">
                  <Button variant="outline" className="group/btn relative overflow-hidden w-full py-7 text-lg font-bold border-3 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 hover:scale-105">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></span>
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-emerald-50 to-teal-50 transition-opacity duration-300"></span>
                    <span className="relative flex items-center justify-center gap-2 group-hover/btn:text-emerald-700">
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      Começar agora
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Plano Intermediate - DESTAQUE */}
              <div className="relative">
                {/* Glow animado */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-3xl opacity-75 blur-sm animate-pulse"></div>
                
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-emerald-500 h-full">
                  {/* Badge animado */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg animate-bounce">
                    MAIS POPULAR
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-2xl text-gray-900">Intermediate</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">R$ 149</span>
                    <span className="text-gray-500 text-lg">/mês</span>
                  </div>
                  <p className="text-emerald-600 text-sm font-medium mb-6">Melhor custo-benefício</p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Leads básicos (cadastro)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Leads de análise</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      <span>Leads premium (CTA)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Notificação por email</span>
                    </li>
                  </ul>
                  
                  <Link href="/terapeuta/cadastro">
                    <Button className="group/btn relative overflow-hidden w-full py-7 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 border-2 border-white/30 transition-all duration-300 hover:scale-105">
                      {/* Brilho pulsante */}
                      <span className="absolute inset-0 rounded-lg border-2 border-white/40 animate-pulse"></span>
                      {/* Shimmer */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        <Zap className="w-6 h-6 group-hover/btn:animate-bounce" />
                        Começar agora
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Plano Pro */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  COMPLETO
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-xl">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900">Pro</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-900">R$ 249</span>
                  <span className="text-gray-500 text-lg">/mês</span>
                </div>
                <p className="text-purple-600 text-sm font-medium mb-6">Todos os tipos de leads</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700 font-bold">Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">WhatsApp direto do usuário</span>
                  </li>
                </ul>
                
                <Link href="/terapeuta/cadastro">
                  <Button className="group/btn relative overflow-hidden w-full py-7 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 border-2 border-white/30 transition-all duration-300 hover:scale-105">
                    {/* Shimmer */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                      Começar agora
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Garantia */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl border border-white/30">
                <Shield className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-bold">Satisfação garantida</p>
                  <p className="text-sm text-white/80">Cancele a qualquer momento, sem multas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Por que o Radar Match?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-emerald-100 p-3 rounded-full w-fit mb-4">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Leads pré-qualificados</h3>
                <p className="text-gray-600 text-sm">
                  Os usuários já demonstraram interesse ao fazer análises e buscar ajuda. 
                  Não é cold calling.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-teal-100 p-3 rounded-full w-fit mb-4">
                  <Heart className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Contexto completo</h3>
                <p className="text-gray-600 text-sm">
                  Receba dados da análise do usuário (red flags, padrões) para personalizar 
                  sua abordagem.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-cyan-100 p-3 rounded-full w-fit mb-4">
                  <Zap className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Distribuição justa</h3>
                <p className="text-gray-600 text-sm">
                  Sistema de rodízio garante distribuição equilibrada de leads entre 
                  todos os profissionais.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-purple-100 p-3 rounded-full w-fit mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Sem compromisso</h3>
                <p className="text-gray-600 text-sm">
                  Cancele quando quiser. Sem multas, sem burocracia. 
                  Você paga apenas pelo que usa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quem pode se cadastrar */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Quem pode se cadastrar?
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-medium">
                Terapeutas
              </span>
              <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-medium">
                Coaches
              </span>
              <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full font-medium">
                Psicólogos
              </span>
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                Tarólogos
              </span>
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                Astrólogos
              </span>
              <span className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-medium">
                Consteladores
              </span>
              <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-medium">
                Terapeutas Florais
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium">
                E mais...
              </span>
            </div>

            <p className="text-gray-600 mb-8">
              Aceitamos profissionais de diversas áreas que trabalham com 
              orientação em relacionamentos. Após o cadastro, nossa equipe 
              analisa seu perfil em até 24h.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Comece a receber leads hoje
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Cadastre-se gratuitamente e comece a receber leads qualificados 
              de pessoas buscando ajuda com relacionamentos.
            </p>
            <Link href="/terapeuta/cadastro">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-10 py-7 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                Criar minha conta grátis
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-white/70 mt-6 text-sm">
              Aprovação em até 24h • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/40 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dúvidas?</h3>
              <a
                href="https://wa.me/5511937756627?text=Olá!%20Sou%20terapeuta%20e%20quero%20saber%20mais%20sobre%20o%20Radar%20Match"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            <div className="text-center border-t border-gray-200 pt-6">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <Link href="/" className="hover:text-emerald-600 transition">
                  ← Voltar para usuários
                </Link>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Dados protegidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Aprovação em 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento de Demonstração */}
      <DemoScheduler 
        isOpen={showDemoScheduler} 
        onClose={() => setShowDemoScheduler(false)} 
      />
    </div>
  )
}
