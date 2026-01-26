'use client'

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
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function TerapeutaLandingPage() {
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            <span>Para Terapeutas, Coaches e Especialistas</span>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/terapeuta/cadastro">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-7 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                Começar agora
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 mt-4 text-sm">
            Cadastro gratuito • Aprovação em até 24h
          </p>
        </div>
      </div>

      {/* Como Funciona */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Leads qualificados chegam até você automaticamente
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-emerald-600">1</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Usuário faz análise</h3>
                <p className="text-gray-600">
                  O usuário responde nosso formulário sobre o comportamento do match e recebe uma análise detalhada.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-teal-600">2</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Lead é distribuído</h3>
                <p className="text-gray-600">
                  Quando o usuário demonstra interesse em ajuda profissional, distribuímos o lead para você.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-cyan-600">3</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Você entra em contato</h3>
                <p className="text-gray-600">
                  Receba os dados do lead por email e WhatsApp. Entre em contato e converta em cliente.
                </p>
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

      {/* Planos */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Escolha seu plano
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Quanto maior o plano, mais tipos de leads você recebe
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Plano Basic */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Basic</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 79</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Notificação por email</span>
                  </li>
                </ul>
                <Link href="/terapeuta/cadastro">
                  <Button variant="outline" className="w-full">
                    Começar
                  </Button>
                </Link>
              </div>

              {/* Plano Intermediate */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-emerald-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  POPULAR
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Intermediate</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 149</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Notificação por email</span>
                  </li>
                </ul>
                <Link href="/terapeuta/cadastro">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Começar
                  </Button>
                </Link>
              </div>

              {/* Plano Pro */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-300">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 249</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span>Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span>Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span>WhatsApp direto do usuário</span>
                  </li>
                </ul>
                <Link href="/terapeuta/cadastro">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Começar
                  </Button>
                </Link>
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
    </div>
  )
}
