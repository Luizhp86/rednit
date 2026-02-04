'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2, AlertTriangle, MessageCircle, Target, Shield, Zap, ChevronRight, X, Menu, Heart } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useState, useEffect } from 'react'

// Mini preview do resultado - mostra visualmente o que o usuário vai receber
function ResultPreview() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-xl" />
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {/* Header mini */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2">
          <span className="text-white text-xs font-semibold">Exemplo de resultado</span>
        </div>
        
        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          {/* Score de interesse */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Nível de interesse</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[32%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
              </div>
              <span className="text-sm font-bold text-orange-600">32%</span>
            </div>
          </div>
          
          {/* Red flags */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Red flags detectadas</span>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-600">3 sinais</span>
            </div>
          </div>
          
          {/* Green flags */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Green flags</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">1 sinal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Menu Mobile
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
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
            <span className="font-medium">Para Especialistas</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link 
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg mt-6"
          >
            <Sparkles className="w-5 h-5" />
            Começar minha análise
          </Link>
        </div>
        
        <div className="absolute bottom-8 left-6 right-6">
          <a
            href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Rednit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-medium hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  )
}

// Componente de CTA flutuante
function FloatingCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-lg border-t border-purple-100/50 shadow-lg">
        <div className="container mx-auto px-4 py-3 pb-safe">
          <Link href="/login" className="block">
            <button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white py-4 rounded-2xl text-base font-bold transition-all inline-flex items-center justify-center gap-2.5 shadow-xl shadow-purple-500/30 active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              <span>Começar minha análise grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MobileLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-32 w-[300px] h-[300px] bg-pink-200/30 rounded-full blur-[80px]" />
      </div>

      {/* Menu Mobile */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ===== HERO SECTION - 100vh ===== */}
      <section className="relative z-10 min-h-screen flex flex-col px-5 pt-6 pb-8">
        
        {/* Header com Logo + Menu */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-sm text-gray-500">Seu coach de relacionamentos</span>
          </div>
          
          {/* Botão Menu */}
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo principal - centralizado verticalmente */}
        <div className="flex-1 flex flex-col justify-center -mt-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg w-fit mb-5">
            <Target className="h-4 w-4" />
            <span>Seu coach de relacionamentos</span>
          </div>

          {/* Headline principal */}
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Descubra se ele(a) está{' '}
            <span className="text-gradient-primary">interessado</span>
            {' '}ou só te{' '}
            <span className="text-gradient-primary">enrolando</span>
          </h1>

          {/* Subheadline */}
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            Responda sobre <strong className="text-purple-600">comportamentos</strong> — não sobre o que você acha. 
            Nossa <strong className="text-purple-600">IA junto com especialistas</strong> analisa e te ajuda a entender os sinais reais.
          </p>

          {/* Preview do resultado */}
          <div className="mb-6">
            <ResultPreview />
          </div>

          {/* CTA Principal */}
          <Link href="/login" className="block mb-4">
            <button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white py-4 rounded-2xl text-lg font-bold transition-all inline-flex items-center justify-center gap-3 shadow-xl shadow-purple-500/30 active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              <span>Começar minha análise grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          {/* Trust badges */}
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            {[
              { icon: Zap, text: "2 min" },
              { icon: Shield, text: "Grátis" },
              { icon: CheckCircle2, text: "Privado" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <badge.icon className="w-4 h-4 text-purple-500" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="flex justify-center pt-4">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="relative z-10 px-5 py-12 bg-white/60 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
          Como funciona
        </h2>

        <div className="space-y-4">
          {[
            { num: 1, title: "Responda algumas perguntas", desc: "Sobre comportamentos reais, não opiniões", color: "purple" },
            { num: 2, title: "Receba sua análise", desc: "IA identifica padrões e sinais", color: "pink" },
            { num: 3, title: "Fale com especialista", desc: "Terapeutas e coaches disponíveis", color: "orange" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4 bg-white/80 rounded-2xl p-4 shadow-sm border border-purple-50">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                step.color === 'purple' ? 'bg-purple-500' :
                step.color === 'pink' ? 'bg-pink-500' :
                'bg-orange-500'
              }`}>
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DIFERENCIAL ===== */}
      <section className="relative z-10 px-5 py-12">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
          Por que é diferente
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Coluna: O que você faz hoje */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Amigo(a)</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>• Conta sua versão</li>
              <li>• Resposta emocional</li>
              <li>• Confirma seu viés</li>
            </ul>
          </div>

          {/* Coluna: Rednit */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-700">Rednit</span>
            </div>
            <ul className="space-y-2 text-xs text-purple-700">
              <li>• Analisa FATOS</li>
              <li>• Resultado objetivo</li>
              <li>• Sem julgamento</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== O QUE VOCÊ DESCOBRE ===== */}
      <section className="relative z-10 px-5 py-12 bg-white/60 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
          O que você descobre
        </h2>

        <div className="space-y-3">
          {[
            { icon: AlertTriangle, title: "Red flags", desc: "Sinais de alerta que você pode estar ignorando", colorBg: "bg-red-50", colorBorder: "border-red-100", colorIcon: "text-red-500" },
            { icon: CheckCircle2, title: "Green flags", desc: "Evidências de interesse genuíno", colorBg: "bg-emerald-50", colorBorder: "border-emerald-100", colorIcon: "text-emerald-500" },
            { icon: Target, title: "Risco de ghosting", desc: "Previsão baseada em padrões", colorBg: "bg-orange-50", colorBorder: "border-orange-100", colorIcon: "text-orange-500" },
          ].map((item, i) => (
            <div key={i} className={`${item.colorBg} rounded-2xl p-4 border ${item.colorBorder} flex items-start gap-3`}>
              <item.icon className={`w-5 h-5 ${item.colorIcon} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative z-10 px-5 py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
        <div className="text-center text-white">
          <h2 className="font-display text-2xl font-bold mb-4">
            Pronto pra entender os sinais?
          </h2>
          <p className="text-white/90 mb-6">
            Análise objetiva em 2 minutos — 100% grátis
          </p>
          
          <Link href="/login" className="block">
            <button className="w-full bg-white text-purple-700 py-4 rounded-2xl text-lg font-bold transition-all inline-flex items-center justify-center gap-3 shadow-xl hover:bg-gray-50 active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              <span>Começar minha análise grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          
          <p className="text-white/70 mt-4 text-sm">
            ✓ 2 min • ✓ Grátis • ✓ Privado
          </p>
        </div>
      </section>

      {/* ===== FOOTER COMPACTO ===== */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-purple-100/50 px-5 py-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">Dúvidas? Fale conosco</p>
          <a
            href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Rednit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
          
          <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500">
            <Link href="/termos" className="hover:text-purple-600">Termos</Link>
            <Link href="/privacidade" className="hover:text-purple-600">Privacidade</Link>
          </div>
        </div>
      </footer>

      {/* Botão flutuante CTA */}
      <FloatingCTA />

      {/* Botão flutuante WhatsApp - Fale conosco */}
      <a
        href="https://wa.me/5511937756627?text=Olá!%20Vim%20do%20Rednit"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-full shadow-lg shadow-green-500/30 active:scale-[0.95] transition-transform flex items-center justify-center"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Safe area padding para dispositivos com notch */}
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 8px);
        }
      `}</style>
    </div>
  )
}
