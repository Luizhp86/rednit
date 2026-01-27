'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { trackEvent } from '@/lib/tracking'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Shield, Sparkles, ArrowLeft, Zap, Heart } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      trackEvent('LOGIN_ATTEMPT', { provider: 'google' })
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Error:', error)
        trackEvent('LOGIN_FAILED', { provider: 'google', error: error.message })
        alert('Erro ao fazer login: ' + error.message)
      }
    } catch (error: any) {
      console.error('Error:', error)
      trackEvent('LOGIN_FAILED', { provider: 'google', error: error.message })
      alert('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay flex flex-col">
      {/* Background ambient effects */}
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

      {/* Header */}
      <header className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2.5 text-gray-600 hover:text-purple-600 transition-all hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Logo size="lg" />
                </div>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />
            
            <div className="relative bg-white/90 backdrop-blur-xl p-7 sm:p-9 rounded-[2rem] shadow-2xl border border-purple-100 overflow-hidden">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
              
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3 text-gray-900 tracking-tight">
                Entrar no{' '}
                <span className="text-gradient-primary">
                  Radar Match
                </span>
              </h1>
              <p className="text-center text-gray-600 mb-8 text-base">
                Faça login com sua conta Google para começar sua análise
              </p>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-purple-300 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Conectando...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              {/* Benefits */}
              <div className="mt-8 space-y-3">
                {[
                  { icon: Sparkles, color: "purple", text: "Análise gratuita do seu match" },
                  { icon: Zap, color: "pink", text: "Resultado em apenas 2 minutos" },
                  { icon: Shield, color: "emerald", text: "Seus dados estão protegidos" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      item.color === 'purple' ? 'bg-purple-100 border-purple-200' :
                      item.color === 'pink' ? 'bg-pink-100 border-pink-200' :
                      'bg-emerald-100 border-emerald-200'
                    }`}>
                      <item.icon className={`w-4 h-4 ${
                        item.color === 'purple' ? 'text-purple-600' :
                        item.color === 'pink' ? 'text-pink-600' :
                        'text-emerald-600'
                      }`} />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-gray-500 mt-8 leading-relaxed">
                Ao continuar, você concorda com nossos{' '}
                <span className="text-purple-600 hover:underline cursor-pointer font-medium">Termos de Uso</span>
                {' '}e{' '}
                <span className="text-purple-600 hover:underline cursor-pointer font-medium">Política de Privacidade</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  )
}
