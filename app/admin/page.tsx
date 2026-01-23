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
  Zap,
  FileText,
  Activity
} from 'lucide-react'

type SystemConfig = {
  minAnalysesFirstTime: number
  minNewAnalysesForUnlock: number
  freeCreditsDaily: number
  geminiDailyLimit: number
  geminiMonthlyBudgetCents: number
  proPriceMonthly: number
  proPriceQuarterly: number
  proPriceYearly: number
  creditPriceSingle: number
  creditPricePack3: number
  creditPricePack5: number
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'users' | 'logs'>('dashboard')
  
  // Dashboard data
  const [stats, setStats] = useState<Stats | null>(null)
  const [topUsers, setTopUsers] = useState<any[]>([])
  
  // Config
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [configDraft, setConfigDraft] = useState<SystemConfig | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  
  // Price input states (for free text input)
  const [priceInputs, setPriceInputs] = useState({
    proPriceMonthly: '',
    proPriceQuarterly: '',
    proPriceYearly: '',
    creditPriceSingle: '',
    creditPricePack3: '',
    creditPricePack5: '',
  })
  
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
  
  // Logs tab
  const [logsType, setLogsType] = useState<'admin' | 'activity'>('admin')
  const [adminLogs, setAdminLogs] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsTotalPages, setLogsTotalPages] = useState(1)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsStats, setLogsStats] = useState<any>(null)
  
  // Filtros de logs de atividade
  const [activityEventFilter, setActivityEventFilter] = useState('')
  const [activityUserFilter, setActivityUserFilter] = useState('')
  const [activityPageFilter, setActivityPageFilter] = useState('')
  const [activityStartDate, setActivityStartDate] = useState('')
  const [activityEndDate, setActivityEndDate] = useState('')
  
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
        // #region agent log
        const logDataLoad = {location:"admin/page.tsx:loadDashboard:received",message:"Config recebido no loadDashboard",data:{proPriceMonthly:data.config?.proPriceMonthly,creditPriceSingle:data.config?.creditPriceSingle},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"E"};
        fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logDataLoad)}).catch(function(){});
        // #endregion
        setStats(data.stats)
        setTopUsers(data.topUsers || [])
        setConfig(data.config)
        // Initialize price inputs with fallback defaults
        const cfg = data.config
        setPriceInputs({
          proPriceMonthly: String((cfg.proPriceMonthly ?? 2990) / 100),
          proPriceQuarterly: String((cfg.proPriceQuarterly ?? 7990) / 100),
          proPriceYearly: String((cfg.proPriceYearly ?? 29900) / 100),
          creditPriceSingle: String((cfg.creditPriceSingle ?? 799) / 100),
          creditPricePack3: String((cfg.creditPricePack3 ?? 2490) / 100),
          creditPricePack5: String((cfg.creditPricePack5 ?? 3990) / 100),
        })
        // Also ensure configDraft has all required fields with defaults
        setConfigDraft({
          ...data.config,
          proPriceMonthly: cfg.proPriceMonthly ?? 2990,
          proPriceQuarterly: cfg.proPriceQuarterly ?? 7990,
          proPriceYearly: cfg.proPriceYearly ?? 29900,
          creditPriceSingle: cfg.creditPriceSingle ?? 799,
          creditPricePack3: cfg.creditPricePack3 ?? 2490,
          creditPricePack5: cfg.creditPricePack5 ?? 3990,
        })
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

  const loadLogs = async (page = 1, filters?: {
    eventType?: string
    userId?: string
    page?: string
    startDate?: string
    endDate?: string
  }) => {
    setLoadingLogs(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })
      
      if (logsType === 'admin') {
        const res = await fetch(`/api/admin/logs?${params}`)
        if (res.ok) {
          const data = await res.json()
          setAdminLogs(data.logs)
          setLogsPage(data.pagination.page)
          setLogsTotal(data.pagination.total)
          setLogsTotalPages(data.pagination.totalPages)
          setLogsStats(data.stats)
        }
      } else {
        // Adicionar filtros de atividade
        if (filters?.eventType || activityEventFilter) {
          params.set('eventType', filters?.eventType || activityEventFilter)
        }
        if (filters?.userId || activityUserFilter) {
          params.set('userId', filters?.userId || activityUserFilter)
        }
        if (filters?.startDate || activityStartDate) {
          params.set('startDate', filters?.startDate || activityStartDate)
        }
        if (filters?.endDate || activityEndDate) {
          params.set('endDate', filters?.endDate || activityEndDate)
        }
        
        const res = await fetch(`/api/admin/activity?${params}`)
        if (res.ok) {
          const data = await res.json()
          setActivityLogs(data.logs)
          setLogsPage(data.pagination.page)
          setLogsTotal(data.pagination.total)
          setLogsTotalPages(data.pagination.totalPages)
          setLogsStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoadingLogs(false)
    }
  }
  
  const clearActivityFilters = () => {
    setActivityEventFilter('')
    setActivityUserFilter('')
    setActivityPageFilter('')
    setActivityStartDate('')
    setActivityEndDate('')
    setLogsPage(1)
    loadLogs(1, { eventType: '', userId: '', startDate: '', endDate: '' })
  }
  
  const applyActivityFilters = () => {
    setLogsPage(1)
    loadLogs(1)
  }

  const saveConfig = async () => {
    if (!configDraft) return
    setSavingConfig(true)
    
    // Sincronizar valores dos inputs de preço antes de salvar
    const parsePrice = (value: string): number => {
      const num = parseFloat(value.replace(',', '.'))
      return !isNaN(num) && num >= 0 ? Math.round(num * 100) : 0
    }
    
    // #region agent log
    const logData1 = {location:"admin/page.tsx:saveConfig:priceInputs",message:"priceInputs antes de parsePrice",data:{priceInputs:priceInputs,configDraftPrices:{proPriceMonthly:configDraft.proPriceMonthly,creditPriceSingle:configDraft.creditPriceSingle}},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"A-B"};
    fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logData1)}).catch(function(){});
    // #endregion
    
    const updatedConfig = {
      ...configDraft,
      proPriceMonthly: parsePrice(priceInputs.proPriceMonthly) || configDraft.proPriceMonthly,
      proPriceQuarterly: parsePrice(priceInputs.proPriceQuarterly) || configDraft.proPriceQuarterly,
      proPriceYearly: parsePrice(priceInputs.proPriceYearly) || configDraft.proPriceYearly,
      creditPriceSingle: parsePrice(priceInputs.creditPriceSingle) || configDraft.creditPriceSingle,
      creditPricePack3: parsePrice(priceInputs.creditPricePack3) || configDraft.creditPricePack3,
      creditPricePack5: parsePrice(priceInputs.creditPricePack5) || configDraft.creditPricePack5,
    }
    
    // #region agent log
    const parsedMonthly = parsePrice(priceInputs.proPriceMonthly);
    const logData2 = {location:"admin/page.tsx:saveConfig:updatedConfig",message:"updatedConfig a ser enviado",data:{updatedPrices:{proPriceMonthly:updatedConfig.proPriceMonthly,creditPriceSingle:updatedConfig.creditPriceSingle},parsedMonthly:parsedMonthly},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"A"};
    fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logData2)}).catch(function(){});
    // #endregion
    
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      })
      // #region agent log
      const resClone = res.clone();
      const resBody = await resClone.text();
      const logData3 = {location:"admin/page.tsx:saveConfig:response",message:"Resposta do PATCH",data:{status:res.status,ok:res.ok,bodyPreview:resBody.substring(0,500)},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"C-D"};
      fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logData3)}).catch(function(){});
      // #endregion
      
      if (res.ok) {
        const data = await res.json()
        const cfg = data.config
        // #region agent log
        const logData4 = {location:"admin/page.tsx:saveConfig:cfgReceived",message:"Config recebido do backend",data:{proPriceMonthly:cfg?.proPriceMonthly,creditPriceSingle:cfg?.creditPriceSingle},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"D"};
        fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logData4)}).catch(function(){});
        // #endregion
        setConfig(cfg)
        // Update configDraft with fallback defaults
        setConfigDraft({
          ...cfg,
          proPriceMonthly: cfg.proPriceMonthly ?? 2990,
          proPriceQuarterly: cfg.proPriceQuarterly ?? 7990,
          proPriceYearly: cfg.proPriceYearly ?? 29900,
          creditPriceSingle: cfg.creditPriceSingle ?? 799,
          creditPricePack3: cfg.creditPricePack3 ?? 2490,
          creditPricePack5: cfg.creditPricePack5 ?? 3990,
        })
        // Update price inputs after save
        setPriceInputs({
          proPriceMonthly: String((cfg.proPriceMonthly ?? 2990) / 100),
          proPriceQuarterly: String((cfg.proPriceQuarterly ?? 7990) / 100),
          proPriceYearly: String((cfg.proPriceYearly ?? 29900) / 100),
          creditPriceSingle: String((cfg.creditPriceSingle ?? 799) / 100),
          creditPricePack3: String((cfg.creditPricePack3 ?? 2490) / 100),
          creditPricePack5: String((cfg.creditPricePack5 ?? 3990) / 100),
        })
        alert('Configurações salvas!')
      } else {
        // #region agent log
        const logData5 = {location:"admin/page.tsx:saveConfig:error",message:"Erro ao salvar - resposta não OK",data:{status:res.status},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"D"};
        fetch("http://127.0.0.1:7242/ingest/13116cc7-c227-4dc6-9969-94d8eab22f3c",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(logData5)}).catch(function(){});
        // #endregion
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
          <button
            onClick={() => { setActiveTab('logs'); loadLogs(1); }}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              activeTab === 'logs' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Logs
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
                Preços de Assinatura PRO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Preço mensal (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="29.90"
                    value={priceInputs.proPriceMonthly}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow digits, comma and dot
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, proPriceMonthly: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.proPriceMonthly.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, proPriceMonthly: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, proPriceMonthly: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, proPriceMonthly: String(configDraft.proPriceMonthly / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Preço trimestral (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="79.90"
                    value={priceInputs.proPriceQuarterly}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, proPriceQuarterly: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.proPriceQuarterly.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, proPriceQuarterly: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, proPriceQuarterly: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, proPriceQuarterly: String(configDraft.proPriceQuarterly / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Preço anual (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="299.00"
                    value={priceInputs.proPriceYearly}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, proPriceYearly: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.proPriceYearly.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, proPriceYearly: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, proPriceYearly: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, proPriceYearly: String(configDraft.proPriceYearly / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Preços de Pacotes de Créditos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    1 Crédito (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="7.99"
                    value={priceInputs.creditPriceSingle}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, creditPriceSingle: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.creditPriceSingle.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, creditPriceSingle: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, creditPriceSingle: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, creditPriceSingle: String(configDraft.creditPriceSingle / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Pacote 3 Créditos (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="24.90"
                    value={priceInputs.creditPricePack3}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, creditPricePack3: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.creditPricePack3.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, creditPricePack3: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, creditPricePack3: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, creditPricePack3: String(configDraft.creditPricePack3 / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Pacote 5 Créditos (R$)
                  </label>
                  <Input
                    type="text"
                    placeholder="39.90"
                    value={priceInputs.creditPricePack5}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, creditPricePack5: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.creditPricePack5.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft, creditPricePack5: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, creditPricePack5: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, creditPricePack5: String(configDraft.creditPricePack5 / 100)})
                      }
                    }}
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

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Toggle entre Admin Logs e Activity Logs */}
            <div className="flex gap-3">
              <Button
                onClick={() => { setLogsType('admin'); setLogsPage(1); loadLogs(1); }}
                className={logsType === 'admin' ? 'bg-purple-600' : 'bg-gray-700'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Logs Admin
              </Button>
              <Button
                onClick={() => { setLogsType('activity'); setLogsPage(1); loadLogs(1); }}
                className={logsType === 'activity' ? 'bg-purple-600' : 'bg-gray-700'}
              >
                <Activity className="w-4 h-4 mr-2" />
                Atividade de Usuários
              </Button>
            </div>

            {/* Admin Logs */}
            {logsType === 'admin' && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Logs de Alterações do Sistema
                </h3>
                
                {/* Estatísticas rápidas */}
                {logsStats && Array.isArray(logsStats) && logsStats.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {logsStats.slice(0, 4).map((stat: any) => (
                      <div key={stat.action} className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-400">{stat.action}</p>
                        <p className="text-xl font-bold text-white">{stat.count}</p>
                      </div>
                    ))}
                  </div>
                )}

                {loadingLogs ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                            <th className="pb-3">Data/Hora</th>
                            <th className="pb-3">Admin</th>
                            <th className="pb-3">Ação</th>
                            <th className="pb-3">Entidade</th>
                            <th className="pb-3">Alterações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminLogs.map((log: any) => (
                            <tr key={log.id} className="border-b border-gray-700/50 align-top">
                              <td className="py-3 text-white text-sm">
                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                              </td>
                              <td className="py-3 text-gray-400 text-sm">{log.adminEmail}</td>
                              <td className="py-3">
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-600/20 text-purple-300">
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 text-gray-400 text-sm">
                                {log.entity}
                                {log.entityId && log.entityId !== 'default' && (
                                  <span className="block text-xs text-gray-500 truncate max-w-[100px]" title={log.entityId}>
                                    ID: {log.entityId.substring(0, 8)}...
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-xs max-w-md">
                                {/* Mostrar alterações de forma legível */}
                                {log.oldValue && log.newValue && (
                                  <div className="space-y-1">
                                    {Object.keys(log.newValue || {}).map((key: string) => {
                                      const oldVal = log.oldValue?.[key]
                                      const newVal = log.newValue?.[key]
                                      // Só mostrar se realmente mudou
                                      if (oldVal === newVal) return null
                                      
                                      // Formatar valores especiais
                                      const formatValue = (val: any) => {
                                        if (val === null || val === undefined) return '-'
                                        if (typeof val === 'boolean') return val ? 'Sim' : 'Não'
                                        if (typeof val === 'object') return JSON.stringify(val)
                                        // Valores em centavos (preços)
                                        if (key.includes('Price') || key.includes('Cents')) {
                                          return `R$ ${(Number(val) / 100).toFixed(2)}`
                                        }
                                        return String(val)
                                      }
                                      
                                      // Traduzir nomes dos campos
                                      const fieldLabels: Record<string, string> = {
                                        proPriceMonthly: 'Preço PRO Mensal',
                                        proPriceQuarterly: 'Preço PRO Trimestral',
                                        proPriceYearly: 'Preço PRO Anual',
                                        creditPriceSingle: 'Preço 1 Crédito',
                                        creditPricePack3: 'Preço Pacote 3',
                                        creditPricePack5: 'Preço Pacote 5',
                                        freeCreditsDaily: 'Créditos Diários',
                                        geminiDailyLimit: 'Limite Diário Gemini',
                                        geminiMonthlyBudgetCents: 'Orçamento Mensal Gemini',
                                        maintenanceMode: 'Modo Manutenção',
                                        allowNewRegistrations: 'Novos Cadastros',
                                        minAnalysesFirstTime: 'Mín. Análises 1ª Vez',
                                        minNewAnalysesForUnlock: 'Mín. Novas Análises',
                                        plan: 'Plano',
                                        creditsPaid: 'Créditos Pagos',
                                        proUntil: 'PRO Até',
                                        email: 'Email',
                                      }
                                      
                                      return (
                                        <div key={key} className="flex items-center gap-1 text-gray-300">
                                          <span className="font-medium text-gray-400">
                                            {fieldLabels[key] || key}:
                                          </span>
                                          <span className="text-red-400 line-through">
                                            {formatValue(oldVal)}
                                          </span>
                                          <span className="text-gray-500">→</span>
                                          <span className="text-green-400">
                                            {formatValue(newVal)}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                                {/* Se não houver alterações detalhadas, mostrar resumo */}
                                {(!log.oldValue || !log.newValue || Object.keys(log.newValue || {}).length === 0) && (
                                  <span className="text-gray-500 italic">Sem detalhes disponíveis</span>
                                )}
                                {/* IP em texto menor */}
                                {log.ipAddress && (
                                  <div className="mt-1 text-gray-600 text-[10px]">
                                    IP: {log.ipAddress}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400">
                        Mostrando {adminLogs.length} de {logsTotal} logs
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => { const newPage = logsPage - 1; setLogsPage(newPage); loadLogs(newPage); }}
                          disabled={logsPage === 1}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-400"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 text-gray-400">
                          {logsPage} / {logsTotalPages}
                        </span>
                        <Button
                          onClick={() => { const newPage = logsPage + 1; setLogsPage(newPage); loadLogs(newPage); }}
                          disabled={logsPage === logsTotalPages}
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
            )}

            {/* Activity Logs */}
            {logsType === 'activity' && (
              <>
                {/* Estatísticas de atividade */}
                {logsStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Top eventos */}
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Top Eventos</h4>
                      <div className="space-y-2">
                        {logsStats.eventTypes?.slice(0, 5).map((stat: any) => (
                          <div key={stat.eventType} className="flex justify-between text-sm">
                            <span className="text-gray-300">{stat.eventType}</span>
                            <span className="text-purple-400 font-semibold">{stat.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Páginas mais visitadas */}
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Páginas Mais Visitadas</h4>
                      <div className="space-y-2">
                        {logsStats.topPages?.slice(0, 5).map((page: any) => (
                          <div key={page.page} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300 truncate">{page.page}</span>
                              <span className="text-purple-400 font-semibold">{page.views}</span>
                            </div>
                            {page.avgDuration && (
                              <span className="text-xs text-gray-500">
                                ~{page.avgDuration}s médio
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Atividade diária */}
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Últimos 7 Dias</h4>
                      <div className="space-y-2">
                        {logsStats.dailyActivity?.map((day: any) => (
                          <div key={day.date} className="flex justify-between text-sm">
                            <span className="text-gray-300">{day.date}</span>
                            <span className="text-purple-400 font-semibold">{day.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Filtros de atividade */}
                <Card className="bg-gray-800 border-gray-700 p-4 mb-4">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs text-gray-400 mb-1">Tipo de Evento</label>
                      <select
                        value={activityEventFilter}
                        onChange={(e) => setActivityEventFilter(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white text-sm rounded px-3 py-2"
                      >
                        <option value="">Todos os eventos</option>
                        <option value="PAGE_VIEW">PAGE_VIEW</option>
                        <option value="PAGE_EXIT">PAGE_EXIT</option>
                        <option value="LOGIN">LOGIN</option>
                        <option value="LOGIN_ATTEMPT">LOGIN_ATTEMPT</option>
                        <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                        <option value="ANALYSIS_STARTED">ANALYSIS_STARTED</option>
                        <option value="ANALYSIS_CREATED">ANALYSIS_CREATED</option>
                        <option value="ANALYSIS_FAILED">ANALYSIS_FAILED</option>
                        <option value="BUTTON_CLICK">BUTTON_CLICK</option>
                        <option value="SCROLL_DEPTH">SCROLL_DEPTH</option>
                        <option value="ERROR">ERROR</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs text-gray-400 mb-1">ID do Usuário</label>
                      <Input
                        type="text"
                        placeholder="ID ou parte..."
                        value={activityUserFilter}
                        onChange={(e) => setActivityUserFilter(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                      />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-400 mb-1">Data Início</label>
                      <Input
                        type="date"
                        value={activityStartDate}
                        onChange={(e) => setActivityStartDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                      />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
                      <Input
                        type="date"
                        value={activityEndDate}
                        onChange={(e) => setActivityEndDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-sm h-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={applyActivityFilters}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 h-9"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Filtrar
                      </Button>
                      <Button
                        onClick={clearActivityFilters}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-400 h-9"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                  {/* Indicador de filtros ativos */}
                  {(activityEventFilter || activityUserFilter || activityStartDate || activityEndDate) && (
                    <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Filtros ativos:</span>
                      {activityEventFilter && (
                        <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                          Evento: {activityEventFilter}
                        </span>
                      )}
                      {activityUserFilter && (
                        <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                          Usuário: {activityUserFilter}
                        </span>
                      )}
                      {activityStartDate && (
                        <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                          De: {activityStartDate}
                        </span>
                      )}
                      {activityEndDate && (
                        <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                          Até: {activityEndDate}
                        </span>
                      )}
                    </div>
                  )}
                </Card>

                {/* Tabela de logs */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Logs de Atividade de Usuários
                  </h3>

                  {loadingLogs ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Nenhum log de atividade encontrado</p>
                      <p className="text-gray-500 text-sm">
                        {(activityEventFilter || activityUserFilter || activityStartDate || activityEndDate)
                          ? 'Tente ajustar os filtros ou limpar para ver todos os logs.'
                          : 'Os logs serão exibidos aqui quando os usuários interagirem com o sistema.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                              <th className="pb-3">Data/Hora</th>
                              <th className="pb-3">Email</th>
                              <th className="pb-3">Evento</th>
                              <th className="pb-3">Página</th>
                              <th className="pb-3">Detalhes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activityLogs.map((log: any) => {
                              // Definir cor baseada no tipo de evento
                              const eventColors: Record<string, string> = {
                                'LOGIN': 'bg-green-600/20 text-green-300',
                                'LOGIN_ATTEMPT': 'bg-yellow-600/20 text-yellow-300',
                                'LOGIN_FAILED': 'bg-red-600/20 text-red-300',
                                'PAGE_VIEW': 'bg-blue-600/20 text-blue-300',
                                'PAGE_EXIT': 'bg-gray-600/20 text-gray-300',
                                'ANALYSIS_STARTED': 'bg-purple-600/20 text-purple-300',
                                'ANALYSIS_CREATED': 'bg-green-600/20 text-green-300',
                                'ANALYSIS_FAILED': 'bg-red-600/20 text-red-300',
                                'BUTTON_CLICK': 'bg-orange-600/20 text-orange-300',
                                'SCROLL_DEPTH': 'bg-cyan-600/20 text-cyan-300',
                                'ERROR': 'bg-red-600/20 text-red-300',
                              }
                              const colorClass = eventColors[log.eventType] || 'bg-blue-600/20 text-blue-300'
                              
                              return (
                                <tr key={log.id} className="border-b border-gray-700/50 align-top">
                                  <td className="py-3 text-white text-sm">
                                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                                  </td>
                                  <td className="py-3 text-sm">
                                    {log.userEmail ? (
                                      <div>
                                        <span className="text-gray-300" title={log.userId}>
                                          {log.userEmail}
                                        </span>
                                        {log.userName && (
                                          <span className="block text-xs text-gray-500">{log.userName}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500 italic">Anônimo</span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                                      {log.eventType}
                                    </span>
                                  </td>
                                  <td className="py-3 text-gray-400 text-sm">
                                    {log.page || '-'}
                                  </td>
                                  <td className="py-3 text-xs max-w-xs">
                                    {/* Mostrar duração */}
                                    {log.duration && (
                                      <div className="text-gray-300 mb-1">
                                        <span className="text-gray-500">Duração:</span> {Math.round(log.duration / 1000)}s
                                      </div>
                                    )}
                                    {/* Mostrar eventData */}
                                    {log.eventData && Object.keys(log.eventData).length > 0 && (
                                      <div className="space-y-0.5">
                                        {Object.entries(log.eventData).map(([key, value]) => (
                                          <div key={key} className="text-gray-400">
                                            <span className="text-gray-500">{key}:</span>{' '}
                                            <span className="text-gray-300">
                                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {/* Se não houver duração nem eventData */}
                                    {!log.duration && (!log.eventData || Object.keys(log.eventData).length === 0) && (
                                      <span className="text-gray-600">-</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          Mostrando {activityLogs.length} de {logsTotal} logs
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { const newPage = logsPage - 1; setLogsPage(newPage); loadLogs(newPage); }}
                            disabled={logsPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-400"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="px-3 py-1 text-gray-400">
                            {logsPage} / {logsTotalPages}
                          </span>
                          <Button
                            onClick={() => { const newPage = logsPage + 1; setLogsPage(newPage); loadLogs(newPage); }}
                            disabled={logsPage === logsTotalPages}
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
              </>
            )}
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
