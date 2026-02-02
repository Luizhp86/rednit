'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Mail, 
  Lock, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function LoginTerapeutaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true)
      setError('')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/terapeuta/auth/callback`,
        },
      })

      if (error) {
        console.error('Error:', error)
        setError('Erro ao fazer login com Google: ' + error.message)
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError('Erro ao fazer login com Google')
    } finally {
      setLoadingGoogle(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/therapist/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        return
      }
      
      // Redirecionar para dashboard
      router.push('/terapeuta/dashboard')
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-gray-900 flex flex-col">
      {/* Header */}
      <nav className="bg-gray-900/50 backdrop-blur border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="lg" variant="dark" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-purple-400">Radar Match</span>
              <span className="text-xs text-gray-500">Área do Terapeuta</span>
            </div>
          </Link>
          <Link href="/terapeuta/cadastro" className="text-purple-400 hover:text-purple-300 text-sm">
            Criar conta
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Área do Terapeuta
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Entrar</h1>
            <p className="text-gray-400">
              Acesse seu dashboard para ver seus leads
            </p>
          </div>

          {/* Form */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loadingGoogle || loading}
              className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer mb-6"
            >
              {loadingGoogle ? (
                'Carregando...'
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
                  Continuar com Google
                </>
              )}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/50 text-gray-400">ou com email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || loadingGoogle}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Card>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Ainda não tem conta?{' '}
              <Link href="/terapeuta/cadastro" className="text-purple-400 hover:text-purple-300">
                Cadastre-se aqui
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Ao continuar, você concorda com nossos{' '}
              <Link href="/termos" className="text-purple-400 hover:text-purple-300">
                Termos de Uso
              </Link>
              {' '}e{' '}
              <Link href="/privacidade" className="text-purple-400 hover:text-purple-300">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
