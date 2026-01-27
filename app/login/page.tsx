'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { trackEvent } from '@/lib/tracking'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Shield, Sparkles, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-20 w-[300px] h-[300px] bg-pink-200/30 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="lg" />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-purple-700">
                  Radar Match
                </span>
                <span className="text-xs text-gray-500">
                  Coach de Relacionamentos
                </span>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 relative overflow-hidden">
            {/* Gradiente decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
              Entrar no{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Radar Match
              </span>
            </h1>
            <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Faça login com sua conta Google para começar sua análise
            </p>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
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
                  <span className="text-sm sm:text-base">Continuar com Google</span>
                </>
              )}
            </button>

            {/* Benefits */}
            <div className="mt-6 sm:mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span>Análise gratuita do seu match</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-pink-600" />
                </div>
                <span>Seus dados estão protegidos</span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-6 sm:mt-8 leading-relaxed">
              Ao continuar, você concorda com nossos{' '}
              <span className="text-purple-600 hover:underline cursor-pointer">Termos de Uso</span>
              {' '}e{' '}
              <span className="text-purple-600 hover:underline cursor-pointer">Política de Privacidade</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
