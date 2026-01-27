'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Filter,
  RefreshCw,
  LogOut,
  User,
  Zap,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Crown,
  Settings,
  Save,
  X,
  Edit,
  Star,
  BarChart3,
  ArrowRight
} from 'lucide-react'

type Therapist = {
  id: string
  email: string
  name: string
  type: string
  plan: string
  status: string
  active: boolean
  subscriptionStatus: string
  leadsReceived: number
  leadsThisMonth: number
  leadsSignup: number
  leadsAnalysis: number
  leadsCta: number
  whatsapp?: string
  bio?: string
  instagram?: string
  website?: string
  crp?: string
  photoUrl?: string
}

const therapistTypeLabels: Record<string, string> = {
  TAROLOGO: 'Tarólogo(a)',
  COACH: 'Coach',
  HOLISTICO: 'Terapeuta Holístico(a)',
  ASTROLOGO: 'Astrólogo(a)',
  TERAPEUTA_FLORAL: 'Terapeuta Floral',
  CONSTELADOR: 'Constelador(a) Familiar',
  PSICOLOGO: 'Psicólogo(a)',
  OUTRO: 'Outro',
}

type Lead = {
  id: string
  type: 'SIGNUP' | 'ANALYSIS' | 'CTA'
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOST'
  userName: string | null
  userEmail: string
  userPhone: string
  matchName: string | null
  analysisData: any
  emailSentAt: string | null
  whatsappOpenedAt: string | null
  createdAt: string
  contactedAt: string | null
  convertedAt: string | null
}

const statusColors = {
  NEW: 'bg-blue-600',
  CONTACTED: 'bg-yellow-600',
  CONVERTED: 'bg-green-600',
  LOST: 'bg-gray-600',
}

const statusLabels = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
}

const planLabels = {
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermediário',
  PRO: 'Pro',
}

const planColors = {
  BASIC: 'bg-gray-600',
  INTERMEDIATE: 'bg-orange-600',
  PRO: 'bg-purple-600',
}

export default function DashboardTerapeutaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<any>(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  
  // Filtros
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Modal de detalhes
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // Modal de configurações
  const [showSettings, setShowSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    whatsapp: '',
    type: '',
    bio: '',
    instagram: '',
    website: '',
    crp: '',
  })
  
  // Modal de planos
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null)

  useEffect(() => {
    loadTherapist()
  }, [])

  useEffect(() => {
    if (therapist) {
      loadLeads()
    }
  }, [therapist, filterType, filterStatus])

  const loadTherapist = async () => {
    try {
      const res = await fetch('/api/therapist/me')
      if (!res.ok) {
        router.push('/terapeuta/login')
        return
      }
      const data = await res.json()
      setTherapist(data.therapist)
    } catch (error) {
      router.push('/terapeuta/login')
    } finally {
      setLoading(false)
    }
  }

  const loadLeads = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      
      const res = await fetch(`/api/therapist/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads)
        setStats(data.stats)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    }
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch('/api/therapist/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      })
      
      if (res.ok) {
        loadLeads(pagination.page)
        setSelectedLead(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/therapist/logout', { method: 'POST' })
    router.push('/terapeuta/login')
  }

  const openSettings = () => {
    if (therapist) {
      setSettingsForm({
        name: therapist.name || '',
        whatsapp: therapist.whatsapp || '',
        type: therapist.type || '',
        bio: therapist.bio || '',
        instagram: therapist.instagram || '',
        website: therapist.website || '',
        crp: therapist.crp || '',
      })
      setShowSettings(true)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/therapist/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      })
      
      if (res.ok) {
        const data = await res.json()
        setTherapist(data.therapist)
        setShowSettings(false)
        alert('Perfil atualizado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSelectPlan = async (plan: string) => {
    setSelectingPlan(plan)
    try {
      // Chamar API de checkout para criar sessão de pagamento
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          therapistId: therapist?.id 
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          alert('Erro ao criar sessão de pagamento')
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao processar plano')
      }
    } catch (error) {
      console.error('Erro ao selecionar plano:', error)
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setSelectingPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!therapist) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="lg" variant="dark" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-purple-400">Radar Match</span>
                <span className="text-xs text-gray-500">Área do Terapeuta</span>
              </div>
            </Link>
            <Badge className={`${planColors[therapist.plan as keyof typeof planColors]} text-white`}>
              <Crown className="w-3 h-3 mr-1" />
              {planLabels[therapist.plan as keyof typeof planLabels]}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-white">{therapist.name}</p>
              <p className="text-xs text-gray-400">{therapist.email}</p>
            </div>
            <a
              href="https://wa.me/5511937756627?text=Olá!%20Preciso%20de%20suporte%20no%20Radar%20Match%20(área%20do%20terapeuta)"
              target="_blank"
              rel="noopener noreferrer"
              title="Suporte via WhatsApp"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
            <Button
              onClick={openSettings}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Banner de Plano - Quando não tem plano ativo */}
        {(!therapist.plan || therapist.subscriptionStatus !== 'active') && (
          <div className="relative mb-8">
            {/* Glow de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            
            <Card className="relative bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-2 border-purple-500/50 p-8">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Escolha seu plano para começar
                  </h2>
                  <p className="text-purple-200 mb-4">
                    Você está logado, mas precisa de um plano ativo para receber leads qualificados. 
                    Escolha o plano ideal para o seu negócio e comece a receber clientes hoje!
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-purple-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Leads qualificados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Notificações em tempo real</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Cancele quando quiser</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button 
                    onClick={() => setShowPlansModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Ver Planos
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Alerta de conta pendente/inativa */}
        {therapist.status === 'PENDING' && (
          <Card className="bg-yellow-900/20 border-yellow-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-yellow-200 font-semibold">Conta em análise</p>
                <p className="text-yellow-300 text-sm">
                  Sua conta está sendo analisada pela nossa equipe. Você será notificado por email quando for aprovada.
                </p>
              </div>
            </div>
          </Card>
        )}

        {therapist.status === 'REJECTED' && (
          <Card className="bg-red-900/20 border-red-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-red-200 font-semibold">Conta não aprovada</p>
                <p className="text-red-300 text-sm">
                  Infelizmente sua conta não foi aprovada. Entre em contato com o suporte para mais informações.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Conteúdo principal - com overlay de bloqueio se não tiver plano */}
        <div className={`relative ${(!therapist.plan || therapist.subscriptionStatus !== 'active') ? 'pointer-events-none' : ''}`}>
          {/* Overlay de bloqueio */}
          {(!therapist.plan || therapist.subscriptionStatus !== 'active') && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-semibold text-white mb-2">Funcionalidade bloqueada</p>
                <p className="text-gray-400 mb-4">Escolha um plano para desbloquear</p>
                <Link href="/terapeuta" className="pointer-events-auto">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </div>
          )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Leads</p>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Este Mês</p>
                <p className="text-2xl font-bold text-white">{stats?.thisMonth || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-600/20 rounded-lg">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Leads CTA (Quentes)</p>
                <p className="text-2xl font-bold text-white">{therapist.leadsCta}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Leads Análise</p>
                <p className="text-2xl font-bold text-white">{therapist.leadsAnalysis}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Leads Cadastro</p>
                <p className="text-2xl font-bold text-white">{therapist.leadsSignup}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filtros:</span>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="SIGNUP">Cadastro</SelectItem>
              <SelectItem value="ANALYSIS">Análise</SelectItem>
              <SelectItem value="CTA">CTA (Quente)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="NEW">Novos</SelectItem>
              <SelectItem value="CONTACTED">Contatados</SelectItem>
              <SelectItem value="CONVERTED">Convertidos</SelectItem>
              <SelectItem value="LOST">Perdidos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => loadLeads(1)}
            variant="outline"
            size="sm"
            className="border-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Leads Table */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-4">Data</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Lead</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Match</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum lead encontrado</p>
                      {!therapist.active && (
                        <p className="text-sm mt-2">Ative sua assinatura para começar a receber leads</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-white">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          lead.type === 'CTA' ? 'bg-green-600' : 
                          lead.type === 'ANALYSIS' ? 'bg-yellow-600' : 
                          'bg-blue-600'
                        }>
                          {lead.type === 'CTA' ? 'Quente' : lead.type === 'ANALYSIS' ? 'Análise' : 'Cadastro'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{lead.userName || 'Sem nome'}</p>
                        <p className="text-gray-400 text-sm">{lead.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <a 
                          href={`https://wa.me/55${lead.userPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-400 hover:text-green-300"
                        >
                          <Phone className="w-4 h-4" />
                          {lead.userPhone}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{lead.matchName || '-'}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[lead.status]}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setSelectedLead(lead)}
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Mostrando {leads.length} de {pagination.total} leads
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => loadLeads(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 text-gray-400">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  onClick={() => loadLeads(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Detalhes do Lead</h2>
                <Badge className={
                  selectedLead.type === 'CTA' ? 'bg-green-600 mt-2' : 
                  selectedLead.type === 'ANALYSIS' ? 'bg-yellow-600 mt-2' : 
                  'bg-blue-600 mt-2'
                }>
                  {selectedLead.type === 'CTA' ? 'Lead Quente' : selectedLead.type === 'ANALYSIS' ? 'Lead Análise' : 'Lead Cadastro'}
                </Badge>
              </div>
              <Button
                onClick={() => setSelectedLead(null)}
                variant="ghost"
                size="sm"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Dados do Lead */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Nome</p>
                  <p className="text-white font-medium">{selectedLead.userName || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{selectedLead.userEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Telefone</p>
                  <a 
                    href={`https://wa.me/55${selectedLead.userPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedLead.userPhone}
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Match Analisado</p>
                  <p className="text-white">{selectedLead.matchName || 'Não informado'}</p>
                </div>
              </div>

              {/* Dados da Análise (apenas CTA) */}
              {(selectedLead.type === 'CTA' || selectedLead.type === 'ANALYSIS') && selectedLead.analysisData && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Análise Realizada</h3>
                  
                  {/* Red Flags */}
                  {selectedLead.analysisData.redFlags?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-red-400 text-sm font-medium mb-2">Red Flags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.analysisData.redFlags.map((flag: any, i: number) => (
                          <Badge key={i} className="bg-red-600/20 text-red-300">
                            {flag.title || flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hipótese */}
                  {selectedLead.analysisData.hypothesis && (
                    <div className="mb-4">
                      <p className="text-purple-400 text-sm font-medium mb-2">Hipótese Principal</p>
                      <p className="text-white">{selectedLead.analysisData.hypothesis}</p>
                    </div>
                  )}

                  {/* Scores */}
                  {selectedLead.analysisData.scores && (
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-2">Scores</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(selectedLead.analysisData.scores).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-400">{key}:</span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Actions */}
              <div>
                <p className="text-gray-400 text-sm mb-3">Atualizar Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => updateLeadStatus(selectedLead.id, 'CONTACTED')}
                    disabled={selectedLead.status === 'CONTACTED'}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Marcar Contatado
                  </Button>
                  <Button
                    onClick={() => updateLeadStatus(selectedLead.id, 'CONVERTED')}
                    disabled={selectedLead.status === 'CONVERTED'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar Convertido
                  </Button>
                  <Button
                    onClick={() => updateLeadStatus(selectedLead.id, 'LOST')}
                    disabled={selectedLead.status === 'LOST'}
                    variant="outline"
                    className="border-gray-600 text-gray-400"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Marcar Perdido
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && therapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Configurações do Perfil
                </h2>
                <p className="text-gray-400 text-sm mt-1">Edite seus dados cadastrais</p>
              </div>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nome</Label>
                    <Input
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      value={therapist.email}
                      disabled
                      className="bg-gray-700/50 border-gray-600 text-gray-400 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">WhatsApp</Label>
                    <Input
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({...settingsForm, whatsapp: e.target.value})}
                      placeholder="11999999999"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Tipo de Profissional</Label>
                    <select
                      value={settingsForm.type}
                      onChange={(e) => setSettingsForm({...settingsForm, type: e.target.value})}
                      className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="TAROLOGO">Tarólogo(a)</option>
                      <option value="COACH">Coach</option>
                      <option value="HOLISTICO">Terapeuta Holístico(a)</option>
                      <option value="ASTROLOGO">Astrólogo(a)</option>
                      <option value="TERAPEUTA_FLORAL">Terapeuta Floral</option>
                      <option value="CONSTELADOR">Constelador(a) Familiar</option>
                      <option value="PSICOLOGO">Psicólogo(a)</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                </div>
                
                {settingsForm.type === 'PSICOLOGO' && (
                  <div>
                    <Label className="text-gray-300">CRP</Label>
                    <Input
                      value={settingsForm.crp}
                      onChange={(e) => setSettingsForm({...settingsForm, crp: e.target.value})}
                      placeholder="00/00000"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Perfil</h3>
                
                <div>
                  <Label className="text-gray-300">Bio / Descrição</Label>
                  <Textarea
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({...settingsForm, bio: e.target.value})}
                    placeholder="Conte um pouco sobre você e seu trabalho..."
                    className="bg-gray-700 border-gray-600 text-white mt-1 min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Instagram</Label>
                    <Input
                      value={settingsForm.instagram}
                      onChange={(e) => setSettingsForm({...settingsForm, instagram: e.target.value})}
                      placeholder="@seuinstagram"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Website</Label>
                    <Input
                      value={settingsForm.website}
                      onChange={(e) => setSettingsForm({...settingsForm, website: e.target.value})}
                      placeholder="https://seusite.com"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Plano Atual */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Seu Plano
                </h3>
                
                <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${planColors[therapist.plan as keyof typeof planColors]} text-white`}>
                        {planLabels[therapist.plan as keyof typeof planLabels] || therapist.plan}
                      </Badge>
                      <Badge className={therapist.subscriptionStatus === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                        {therapist.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {therapist.plan === 'BASIC' && 'Receba leads de cadastro (frios)'}
                      {therapist.plan === 'INTERMEDIATE' && 'Receba leads de cadastro + análise'}
                      {therapist.plan === 'PRO' && 'Receba todos os tipos de leads + WhatsApp direto'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setShowSettings(false)
                      setShowPlansModal(true)
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Alterar Plano
                  </Button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Botão Flutuante de Suporte via WhatsApp */}
      <a
        href="https://wa.me/5511937756627?text=Olá!%20Preciso%20de%20suporte%20no%20Radar%20Match%20(área%20do%20terapeuta)"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 group"
      >
        <div className="relative">
          {/* Glow pulsante */}
          <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 animate-pulse"></div>
          
          <div className="relative flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-4 rounded-full shadow-2xl shadow-green-500/40 transition-all duration-300 group-hover:scale-105">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium hidden sm:inline">Suporte</span>
          </div>
        </div>
      </a>

      {/* Plans Modal */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
          <div className="w-full max-w-5xl my-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowPlansModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </Button>
              <div className="inline-flex items-center gap-2 bg-purple-600/30 text-purple-300 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-purple-500/50">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>ESCOLHA SEU PLANO</span>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Invista no seu crescimento
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Quanto maior o plano, mais tipos de leads qualificados você recebe.
                <strong className="text-white"> Cancele quando quiser.</strong>
              </p>
              {therapist && (
                <p className="text-purple-400 mt-2">
                  Plano atual: <Badge className={`${planColors[therapist.plan as keyof typeof planColors]} text-white ml-2`}>
                    {planLabels[therapist.plan as keyof typeof planLabels]}
                  </Badge>
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Plano Basic */}
              <Card className={`bg-gray-800 border-2 p-6 transition-all duration-300 hover:scale-105 ${therapist?.plan === 'BASIC' ? 'border-green-500' : 'border-gray-600 hover:border-gray-500'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-700 p-2 rounded-xl">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-2xl text-white">Basic</h3>
                  {therapist?.plan === 'BASIC' && (
                    <Badge className="bg-green-600 text-white">Atual</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">R$ 79</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">Para começar a receber leads</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Notificação por email</span>
                  </li>
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan('BASIC')}
                  disabled={selectingPlan !== null || therapist?.plan === 'BASIC'}
                  variant="outline"
                  className="group/btn relative overflow-hidden w-full py-6 text-lg font-bold border-2 border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                >
                  {/* Efeito shimmer em movimento contínuo */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-shimmer"></span>
                  {selectingPlan === 'BASIC' ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : therapist?.plan === 'BASIC' ? (
                    'Plano Atual'
                  ) : (
                    <span className="relative flex items-center justify-center">
                      Escolher Basic
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </Card>

              {/* Plano Intermediate - DESTAQUE */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-75 blur-sm animate-pulse"></div>
                
                <Card className={`relative bg-gray-800 border-4 p-6 h-full transition-all duration-300 ${therapist?.plan === 'INTERMEDIATE' ? 'border-green-500' : 'border-purple-500'}`}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                    MAIS POPULAR
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="bg-purple-900 p-2 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-2xl text-white">Intermediate</h3>
                    {therapist?.plan === 'INTERMEDIATE' && (
                      <Badge className="bg-green-600 text-white">Atual</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">R$ 149</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-purple-400 text-sm font-medium mb-6">Melhor custo-benefício</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">Leads básicos (cadastro)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-white font-medium">Leads de análise</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-500">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Leads premium (CTA)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">Notificação por email</span>
                    </li>
                  </ul>
                  
                  <div className="relative">
                    {/* Glow pulsante por trás do botão */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg opacity-60 blur-md animate-pulse"></div>
                    
                    <Button
                      onClick={() => handleSelectPlan('INTERMEDIATE')}
                      disabled={selectingPlan !== null || therapist?.plan === 'INTERMEDIATE'}
                      className="group/btn relative overflow-hidden w-full py-6 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 border-2 border-white/20 transition-all duration-300 hover:scale-105"
                    >
                      {/* Borda brilhante */}
                      <span className="absolute inset-0 rounded-lg border-2 border-white/30 animate-pulse"></span>
                      {/* Efeito shimmer em movimento contínuo */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></span>
                      {selectingPlan === 'INTERMEDIATE' ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : therapist?.plan === 'INTERMEDIATE' ? (
                        'Plano Atual'
                      ) : (
                        <span className="relative flex items-center justify-center">
                          <Zap className="w-6 h-6 mr-2 animate-pulse" />
                          Escolher Intermediate
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Plano Pro */}
              <Card className={`bg-gradient-to-br from-gray-800 to-purple-900/30 border-2 p-6 transition-all duration-300 hover:scale-105 ${therapist?.plan === 'PRO' ? 'border-green-500' : 'border-purple-600 hover:border-purple-500'}`}>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  COMPLETO
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-900 p-2 rounded-xl">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-2xl text-white">Pro</h3>
                  {therapist?.plan === 'PRO' && (
                    <Badge className="bg-green-600 text-white">Atual</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">R$ 249</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-purple-400 text-sm font-medium mb-6">Todos os tipos de leads</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Leads básicos (cadastro)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">Leads de análise</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-white font-bold">Leads premium (CTA)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">WhatsApp direto do usuário</span>
                  </li>
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan('PRO')}
                  disabled={selectingPlan !== null || therapist?.plan === 'PRO'}
                  className="group/btn relative overflow-hidden w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 border-2 border-white/20 transition-all duration-300 hover:scale-105"
                >
                  {/* Efeito shimmer em movimento contínuo */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-slow"></span>
                  {selectingPlan === 'PRO' ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : therapist?.plan === 'PRO' ? (
                    'Plano Atual'
                  ) : (
                    <span className="relative flex items-center justify-center">
                      <Star className="w-5 h-5 mr-2 animate-pulse" />
                      Escolher Pro
                    </span>
                  )}
                </Button>
              </Card>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Ao escolher um plano, você será redirecionado para o pagamento seguro.
              </p>
              <Button
                onClick={() => setShowPlansModal(false)}
                variant="ghost"
                className="mt-4 text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
