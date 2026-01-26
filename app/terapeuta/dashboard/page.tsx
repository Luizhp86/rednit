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
  Crown
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
  leadsCta: number
}

type Lead = {
  id: string
  type: 'SIGNUP' | 'CTA'
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
              <Logo size="lg" />
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
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Status Alert */}
        {!therapist.active && (
          <Card className="bg-yellow-900/20 border-yellow-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-yellow-200 font-semibold">Conta inativa</p>
                <p className="text-yellow-300 text-sm">
                  {therapist.subscriptionStatus !== 'active' 
                    ? 'Ative sua assinatura para começar a receber leads.'
                    : 'Sua conta está aprovada mas inativa. Entre em contato com o suporte.'}
                </p>
              </div>
              {therapist.subscriptionStatus !== 'active' && (
                <Link href="/terapeuta/assinatura" className="ml-auto">
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    Ativar Assinatura
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                        <Badge className={lead.type === 'CTA' ? 'bg-green-600' : 'bg-blue-600'}>
                          {lead.type === 'CTA' ? 'Quente' : 'Cadastro'}
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

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Detalhes do Lead</h2>
                <Badge className={selectedLead.type === 'CTA' ? 'bg-green-600 mt-2' : 'bg-blue-600 mt-2'}>
                  {selectedLead.type === 'CTA' ? 'Lead Quente' : 'Lead Cadastro'}
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
              {selectedLead.type === 'CTA' && selectedLead.analysisData && (
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
    </div>
  )
}
