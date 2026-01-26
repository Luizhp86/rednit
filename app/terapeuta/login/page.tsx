'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
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
            <Logo size="lg" />
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
                disabled={loading}
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
          </div>
        </div>
      </div>
    </div>
  )
}
