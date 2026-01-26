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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

const therapistTypes = [
  { value: 'TAROLOGO', label: 'Tarólogo(a)' },
  { value: 'COACH', label: 'Coach' },
  { value: 'HOLISTICO', label: 'Terapeuta Holístico(a)' },
  { value: 'ASTROLOGO', label: 'Astrólogo(a)' },
  { value: 'TERAPEUTA_FLORAL', label: 'Terapeuta Floral' },
  { value: 'CONSTELADOR', label: 'Constelador(a) Familiar' },
  { value: 'PSICOLOGO', label: 'Psicólogo(a) - CRP obrigatório' },
  { value: 'OUTRO', label: 'Outro' },
]

export default function CadastroTerapeutaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    type: '',
    bio: '',
    instagram: '',
    website: '',
    crp: '',
  })

  const handleGoogleSignup = async () => {
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (!formData.type) {
      setError('Selecione o tipo de terapeuta')
      return
    }
    
    if (formData.type === 'PSICOLOGO' && !formData.crp) {
      setError('CRP é obrigatório para psicólogos')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/therapist/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          whatsapp: formData.whatsapp,
          type: formData.type,
          bio: formData.bio || undefined,
          instagram: formData.instagram || undefined,
          website: formData.website || undefined,
          crp: formData.crp || undefined,
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar')
        return
      }
      
      setSuccess(true)
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-700 p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro Realizado!</h1>
          <p className="text-gray-400 mb-6">
            Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador 
            para começar a receber leads.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Você receberá um email quando seu cadastro for aprovado.
          </p>
          <Link href="/terapeuta/login">
            <Button className="bg-purple-600 hover:bg-purple-700 w-full">
              Ir para Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-gray-900">
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
          <Link href="/terapeuta/login" className="text-purple-400 hover:text-purple-300 text-sm">
            Já tenho cadastro
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Receba leads qualificados
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Terapeuta</h1>
            <p className="text-gray-400">
              Preencha seus dados para começar a receber leads de pessoas interessadas em ajuda profissional
            </p>
          </div>

          {/* Form */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            {/* Google Signup Button */}
            <div className="mb-6">
              <button
                onClick={handleGoogleSignup}
                disabled={loadingGoogle || loading}
                className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
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
                    Cadastrar com Google (mais rápido)
                  </>
                )}
              </button>
              <p className="text-center text-gray-500 text-xs mt-2">
                Cadastre-se em segundos com sua conta Google
              </p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/50 text-gray-400">ou com email e senha</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Dados Básicos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Nome completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type" className="text-gray-300">Tipo de terapeuta *</Label>
                    <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-white">
                        {therapistTypes.map(type => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white cursor-pointer"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === 'PSICOLOGO' && (
                  <div>
                    <Label htmlFor="crp" className="text-gray-300">CRP *</Label>
                    <Input
                      id="crp"
                      value={formData.crp}
                      onChange={(e) => handleChange('crp', e.target.value)}
                      placeholder="00/00000"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-500" />
                  Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp * (onde receberá leads)</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="11999999999"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  Senha de Acesso
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Perfil (opcional)</h3>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-300">Bio / Descrição</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você e seu trabalho..."
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="@seuinstagram"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website" className="text-gray-300">Site</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://seusite.com"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
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
                    Cadastrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Cadastrar
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Card>

          {/* Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Após o cadastro, seu perfil será analisado pela nossa equipe.</p>
            <p>Você receberá um email quando for aprovado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
