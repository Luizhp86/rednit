'use client'

import { useState, useEffect } from 'react'
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
  Phone, 
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

export default function CompletarCadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    whatsapp: '',
    type: '',
    bio: '',
    instagram: '',
    website: '',
    crp: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/terapeuta/login')
        return
      }
      
      setUserEmail(user.email || '')
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '')
      setChecking(false)
    } catch (e) {
      router.push('/terapeuta/login')
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
    if (!formData.type) {
      setError('Selecione o tipo de terapeuta')
      return
    }
    
    if (formData.type === 'PSICOLOGO' && !formData.crp) {
      setError('CRP é obrigatório para psicólogos')
      return
    }
    
    if (!formData.whatsapp) {
      setError('WhatsApp é obrigatório')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/therapist/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
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
        setError(data.error || 'Erro ao completar cadastro')
        return
      }
      
      setSuccess(true)
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-700 p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro Completo!</h1>
          <p className="text-gray-400 mb-6">
            Seu cadastro foi completado com sucesso. Aguarde a aprovação do administrador 
            para começar a receber leads.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Você receberá um email quando seu cadastro for aprovado.
          </p>
          <Link href="/terapeuta/dashboard">
            <Button className="bg-purple-600 hover:bg-purple-700 w-full">
              Ir para Dashboard
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
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Complete seu cadastro
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Olá, {userName || 'Terapeuta'}!</h1>
            <p className="text-gray-400">
              Complete seus dados para começar a receber leads qualificados
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Logado como: {userEmail}
            </p>
          </div>

          {/* Form */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Profissionais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Dados Profissionais
                </h3>
                
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
                  <Phone className="w-5 h-5 text-purple-500" />
                  Contato
                </h3>
                
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
                    Completando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Completar Cadastro
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
