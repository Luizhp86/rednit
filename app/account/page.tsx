'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { 
  User, 
  Mail, 
  BarChart3, 
  Trash2, 
  AlertTriangle, 
  ArrowLeft,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react'

type UserData = {
  id: string
  email: string
  name: string
  phone?: string
  instagram?: string
  facebook?: string
  stats: {
    totalAnalyses: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      if (res.ok) {
        router.push('/')
      } else {
        alert('Erro ao excluir conta')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir conta')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAnalyses = async () => {
    if (!confirm('Tem certeza que deseja excluir todas as suas análises? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/analyses', { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        alert(data.message || 'Análises excluídas com sucesso')
        const userRes = await fetch('/api/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        router.push('/dashboard')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir análises')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir análises')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px] animate-pulse" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-spin">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-orange-200/30 rounded-full blur-[80px]" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <nav className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Logo size="lg" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-semibold text-purple-700">
                  Radar Match
                </span>
                <span className="text-xs text-gray-500 hidden md:block">
                  Seu coach de relacionamentos
                </span>
              </div>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex gap-6 items-center">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-purple-100 p-6 shadow-2xl animate-slide-in-right">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mt-16 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-4 px-4 rounded-xl transition-all group"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 py-4 px-4 rounded-xl transition-all w-full group"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3 transition-all animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up animation-delay-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Minha <span className="text-gradient-primary">Conta</span>
              </h1>
              <p className="text-gray-600 mt-1">Gerencie suas informações e privacidade</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="relative mb-6 animate-fade-in-up animation-delay-200">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-[2rem] blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xl">
            <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl border border-purple-200">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              Informações Pessoais
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nome</p>
                  <p className="text-gray-900 font-medium">{user.name || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="relative mb-6 animate-fade-in-up animation-delay-300">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-[2rem] blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-xl">
            <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-200">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              Estatísticas
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-1">{user.stats.totalAnalyses}</div>
                <p className="text-sm text-gray-600 font-medium">Análises realizadas</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-1">∞</div>
                <p className="text-sm text-gray-600 font-medium">Análises disponíveis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Card */}
        <div className="relative animate-fade-in-up animation-delay-400">
          <div className="absolute -inset-2 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-[2rem] blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-red-100 shadow-xl">
            <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl border border-red-200">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              Privacidade e Dados
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Gerencie seus dados pessoais. Ações abaixo são irreversíveis.
            </p>
            
            <div className="space-y-4">
              {/* Delete Analyses */}
              <div className="p-5 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-yellow-100 rounded-xl">
                    <Trash2 className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Excluir Análises</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Remove todas as suas análises do sistema. Seu perfil será mantido.
                    </p>
                    <button
                      onClick={handleDeleteAnalyses}
                      disabled={deleting}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-yellow-600/20 hover:shadow-yellow-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Todas as Análises
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Delete Account */}
              <div className="p-5 bg-red-50 rounded-2xl border-2 border-red-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Excluir Conta</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Remove permanentemente sua conta e todos os dados associados.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {deleting ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
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
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        
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
        
        .font-display {
          font-family: var(--font-playfair), Georgia, serif;
        }
      `}</style>
    </div>
  )
}
