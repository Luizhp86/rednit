'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Users, 
  BarChart3, 
  DollarSign, 
  Cpu,
  Shield,
  Save,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react'

type SystemConfig = {
  minAnalysesFirstTime: number
  minNewAnalysesForUnlock: number
  freeCreditsDaily: number
  geminiDailyLimit: number
  geminiMonthlyBudgetCents: number
  proPriceMonthly: number
  proPriceYearly: number
  maintenanceMode: boolean
  allowNewRegistrations: boolean
}

type Stats = {
  users: { total: number; pro: number; free: number }
  analyses: { total: number; today: number; thisMonth: number }
  revenue: { total: number; thisMonth: number }
  gemini: { callsToday: number; callsThisMonth: number; estimatedCostThisMonth: number }
}

type User = {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PRO'
  creditsFreeDaily: number
  creditsPaid: number
  proUntil: string | null
  createdAt: string
  analysesCount: number
  paymentsCount: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'users'>('dashboard')
  
  // Dashboard data
  const [stats, setStats] = useState<Stats | null>(null)
  const [topUsers, setTopUsers] = useState<any[]>([])
  
  // Config
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [configDraft, setConfigDraft] = useState<SystemConfig | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  
  // Users
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserPlan, setEditUserPlan] = useState<'FREE' | 'PRO'>('FREE')
  const [editUserCredits, setEditUserCredits] = useState(0)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin-login')
      if (res.ok) {
        setIsAdmin(true)
        loadDashboard()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setTopUsers(data.topUsers || [])
        setConfig(data.config)
        setConfigDraft(data.config)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Erro ao carregar dados')
        console.error('Error loading dashboard:', errorData)
      }
    } catch (error: any) {
      setError('Erro de conexão: ' + error.message)
      console.error('Error loading dashboard:', error)
    }
  }

  const loadUsers = async (page = 1, search = '') => {
    setLoadingUsers(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setUserPage(data.pagination.page)
        setUserTotal(data.pagination.total)
        setUserTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const saveConfig = async () => {
    if (!configDraft) return
    setSavingConfig(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configDraft)
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        setConfigDraft(data.config)
        alert('Configurações salvas!')
      } else {
        alert('Erro ao salvar configurações')
      }
    } catch (error) {
      alert('Erro ao salvar configurações')
    } finally {
      setSavingConfig(false)
    }
  }

  const updateUser = async () => {
    if (!editingUser) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          plan: editUserPlan,
          creditsPaid: editUserCredits
        })
      })
      if (res.ok) {
        alert('Usuário atualizado!')
        setEditingUser(null)
        loadUsers(userPage, userSearch)
      } else {
        alert('Erro ao atualizar usuário')
      }
    } catch (error) {
      alert('Erro ao atualizar usuário')
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Logo size="lg" />
            </Link>
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            Voltar ao App
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              activeTab === 'dashboard' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              activeTab === 'config' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>
          <button
            onClick={() => { setActiveTab('users'); loadUsers(1, ''); }}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              activeTab === 'users' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Usuários
          </button>
          
          {/* Botão Refresh */}
          <button
            onClick={loadDashboard}
            className="ml-auto px-4 py-3 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
            title="Recarregar dados"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <Card className="bg-red-900/50 border-red-700 p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-200 font-semibold">Erro ao carregar dados</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button 
                onClick={loadDashboard}
                className="ml-auto bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-white text-sm"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {!error && !stats && activeTab === 'dashboard' && (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">Carregando dados...</span>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Usuários</p>
                    <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                    <p className="text-xs text-gray-500">
                      {stats.users.pro} PRO / {stats.users.free} FREE
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Análises</p>
                    <p className="text-2xl font-bold text-white">{stats.analyses.total}</p>
                    <p className="text-xs text-gray-500">
                      {stats.analyses.today} hoje / {stats.analyses.thisMonth} este mês
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Receita Total</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue.total)}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(stats.revenue.thisMonth)} este mês
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600/20 rounded-lg">
                    <Cpu className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Gemini API</p>
                    <p className="text-2xl font-bold text-white">{stats.gemini.callsToday}</p>
                    <p className="text-xs text-gray-500">
                      chamadas hoje / {stats.gemini.callsThisMonth} este mês
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Users */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Top Usuários por Análises
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">Plano</th>
                      <th className="pb-3">Análises</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, idx) => (
                      <tr key={user.id} className="border-b border-gray-700/50">
                        <td className="py-3 text-white">{user.email}</td>
                        <td className="py-3 text-gray-400">{user.name || '-'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.plan === 'PRO' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-3 text-white font-semibold">{user.analysesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Config Tab - Loading */}
        {activeTab === 'config' && !configDraft && !error && (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">Carregando configurações...</span>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && configDraft && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Análise de Comportamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Mínimo de análises (primeira vez)
                  </label>
                  <Input
                    type="number"
                    value={configDraft.minAnalysesFirstTime}
                    onChange={(e) => setConfigDraft({...configDraft, minAnalysesFirstTime: parseInt(e.target.value) || 0})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantidade de análises para desbloquear pela primeira vez
                  </p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Mínimo de análises novas (depois)
                  </label>
                  <Input
                    type="number"
                    value={configDraft.minNewAnalysesForUnlock}
                    onChange={(e) => setConfigDraft({...configDraft, minNewAnalysesForUnlock: parseInt(e.target.value) || 0})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantidade de análises novas para desbloquear novamente
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Créditos de Usuários
              </h3>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Créditos gratuitos por dia
                </label>
                <Input
                  type="number"
                  value={configDraft.freeCreditsDaily}
                  onChange={(e) => setConfigDraft({...configDraft, freeCreditsDaily: parseInt(e.target.value) || 0})}
                  className="bg-gray-700 border-gray-600 text-white w-full max-w-xs"
                />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-orange-500" />
                Controle de Gastos - Gemini API
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Limite diário de chamadas
                  </label>
                  <Input
                    type="number"
                    value={configDraft.geminiDailyLimit}
                    onChange={(e) => setConfigDraft({...configDraft, geminiDailyLimit: parseInt(e.target.value) || 0})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Orçamento mensal (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(configDraft.geminiMonthlyBudgetCents / 100).toFixed(2)}
                    onChange={(e) => setConfigDraft({...configDraft, geminiMonthlyBudgetCents: Math.round(parseFloat(e.target.value || '0') * 100)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Preços PRO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Preço mensal (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(configDraft.proPriceMonthly / 100).toFixed(2)}
                    onChange={(e) => setConfigDraft({...configDraft, proPriceMonthly: Math.round(parseFloat(e.target.value || '0') * 100)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Preço anual (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(configDraft.proPriceYearly / 100).toFixed(2)}
                    onChange={(e) => setConfigDraft({...configDraft, proPriceYearly: Math.round(parseFloat(e.target.value || '0') * 100)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Feature Flags
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configDraft.maintenanceMode}
                    onChange={(e) => setConfigDraft({...configDraft, maintenanceMode: e.target.checked})}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                  />
                  <div>
                    <span className="text-white font-medium">Modo Manutenção</span>
                    <p className="text-xs text-gray-500">Bloqueia o acesso ao sistema para todos os usuários</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configDraft.allowNewRegistrations}
                    onChange={(e) => setConfigDraft({...configDraft, allowNewRegistrations: e.target.checked})}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                  />
                  <div>
                    <span className="text-white font-medium">Permitir Novos Cadastros</span>
                    <p className="text-xs text-gray-500">Permite que novos usuários se cadastrem</p>
                  </div>
                </label>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={saveConfig}
                disabled={savingConfig}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                {savingConfig ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar por email ou nome..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers(1, userSearch)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={() => loadUsers(1, userSearch)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Buscar
              </Button>
            </div>

            {/* Users Table */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Nome</th>
                          <th className="pb-3">Plano</th>
                          <th className="pb-3">Análises</th>
                          <th className="pb-3">Criado em</th>
                          <th className="pb-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-700/50">
                            <td className="py-3 text-white">{user.email}</td>
                            <td className="py-3 text-gray-400">{user.name || '-'}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                user.plan === 'PRO' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}>
                                {user.plan}
                              </span>
                            </td>
                            <td className="py-3 text-white">{user.analysesCount}</td>
                            <td className="py-3 text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => {
                                  setEditingUser(user)
                                  setEditUserPlan(user.plan)
                                  setEditUserCredits(user.creditsPaid)
                                }}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Mostrando {users.length} de {userTotal} usuários
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadUsers(userPage - 1, userSearch)}
                        disabled={userPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-400"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-1 text-gray-400">
                        {userPage} / {userTotalPages}
                      </span>
                      <Button
                        onClick={() => loadUsers(userPage + 1, userSearch)}
                        disabled={userPage === userTotalPages}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-400"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Editar Usuário</h3>
              <p className="text-gray-400 text-sm mb-4">{editingUser.email}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Plano</label>
                  <select
                    value={editUserPlan}
                    onChange={(e) => setEditUserPlan(e.target.value as 'FREE' | 'PRO')}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Créditos Pagos</label>
                  <Input
                    type="number"
                    value={editUserCredits}
                    onChange={(e) => setEditUserCredits(parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setEditingUser(null)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-400"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={updateUser}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Salvar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
