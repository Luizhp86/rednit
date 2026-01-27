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
  Activity,
  Key,
  Check,
  X,
  UserCheck,
  MessageCircle,
  Phone,
  Crown,
  Plus,
  Trash2,
  Edit,
  UserCog,
  Sliders,
  Layers
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FormThemesManager } from '@/components/admin/form-themes-manager'

type SystemConfig = {
  // Limites da jornada do lead
  leadMaxAnalysesPerDay: number
  leadMaxRouteCorrectionPerDay: number
  minAnalysesFirstTime: number
  minNewAnalysesForUnlock: number
  // Legado
  freeCreditsDaily: number
  geminiDailyLimit: number
  geminiMonthlyBudgetCents: number
  geminiModelAnalysis: string
  geminiModelRouteCorrection: string
  // B2B - Preços de terapeutas
  therapistPriceBasic: number
  therapistPriceIntermediate: number
  therapistPricePro: number
  therapistLeadsPerDay: number
  // Feature flags B2B
  enableLeadSignup: boolean
  enableLeadAnalysis: boolean
  enableLeadCta: boolean
  // Regras de geração de leads
  leadSignupPlans: string
  leadAnalysisPlans: string
  leadCtaPlans: string
  leadCooldownHours: number
  leadMaxSignupPerDay: number
  leadMaxAnalysisPerDay: number
  leadMaxCtaPerDay: number
  // Feature flags gerais
  maintenanceMode: boolean
  allowNewRegistrations: boolean
}

type Admin = {
  id: string
  email: string
  name: string | null
  role: string
  active: boolean
  createdAt: string
  createdBy: string | null
}

type Stats = {
  users: { total: number; withPhone: number }
  analyses: { total: number; today: number; thisMonth: number }
  therapists: { total: number; approved: number; pending: number }
  leads: { total: number; today: number; thisMonth: number; converted: number }
  gemini: { callsToday: number; callsThisMonth: number; estimatedCostThisMonth: number }
}

type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  createdAt: string
  analysesCount: number
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'users' | 'logs' | 'apikeys' | 'therapists' | 'leads' | 'admins' | 'demos' | 'forms'>('dashboard')
  
  // Dashboard data
  const [stats, setStats] = useState<Stats | null>(null)
  const [topUsers, setTopUsers] = useState<any[]>([])
  
  // Config
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [configDraft, setConfigDraft] = useState<SystemConfig | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  
  // Price input states (for free text input) - B2B Terapeutas
  const [priceInputs, setPriceInputs] = useState({
    therapistPriceBasic: '',
    therapistPriceIntermediate: '',
    therapistPricePro: '',
  })
  
  // Users
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // User modals
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editUserCredits, setEditUserCredits] = useState(0)
  const [editUserMode, setEditUserMode] = useState<'view' | 'edit'>('view')
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', phone: '' })
  const [savingUser, setSavingUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  
  // Create user modal
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState({ email: '', name: '', phone: '' })
  const [creatingUser, setCreatingUser] = useState(false)
  
  // Admins tab
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdminForm, setNewAdminForm] = useState({ email: '', name: '', role: 'ADMIN' })
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [deletingAdmin, setDeletingAdmin] = useState<string | null>(null)
  
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
  
  // API Keys
  const [apiKeys, setApiKeys] = useState<any>(null)
  const [apiKeysSummary, setApiKeysSummary] = useState<any>(null)
  const [loadingApiKeys, setLoadingApiKeys] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  // Therapists tab
  const [therapists, setTherapists] = useState<any[]>([])
  const [therapistSearch, setTherapistSearch] = useState('')
  const [therapistStatusFilter, setTherapistStatusFilter] = useState('')
  const [therapistPage, setTherapistPage] = useState(1)
  const [therapistTotal, setTherapistTotal] = useState(0)
  const [therapistTotalPages, setTherapistTotalPages] = useState(1)
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [therapistStats, setTherapistStats] = useState<any>(null)
  
  // Modal de edição de terapeuta
  const [editingTherapist, setEditingTherapist] = useState<any | null>(null)
  const [editTherapistMode, setEditTherapistMode] = useState<'view' | 'edit'>('view')
  const [editTherapistForm, setEditTherapistForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    type: 'OUTRO',
    bio: '',
    instagram: '',
    website: '',
    crp: '',
    plan: 'BASIC',
    status: 'PENDING',
    subscriptionStatus: 'inactive'
  })
  const [savingTherapist, setSavingTherapist] = useState(false)
  const [deletingTherapist, setDeletingTherapist] = useState<string | null>(null)
  const [showChangePlanModal, setShowChangePlanModal] = useState<string | null>(null)
  const [newPlanForTherapist, setNewPlanForTherapist] = useState('')
  
  // Leads tab
  const [adminLeads, setAdminLeads] = useState<any[]>([])
  const [leadTypeFilter, setLeadTypeFilter] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('')
  const [leadTherapistFilter, setLeadTherapistFilter] = useState('')
  const [leadPage, setLeadPage] = useState(1)
  const [leadTotal, setLeadTotal] = useState(0)
  const [leadTotalPages, setLeadTotalPages] = useState(1)
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [leadStats, setLeadStats] = useState<any>(null)
  const [allTherapists, setAllTherapists] = useState<any[]>([])
  const [assigningLead, setAssigningLead] = useState<string | null>(null)
  const [selectedTherapistForAssign, setSelectedTherapistForAssign] = useState('')
  const [sendNotificationOnAssign, setSendNotificationOnAssign] = useState(true)
  
  // Demos tab
  const [demos, setDemos] = useState<any[]>([])
  const [demoStatusFilter, setDemoStatusFilter] = useState('')
  const [demoPage, setDemoPage] = useState(1)
  const [demoTotal, setDemoTotal] = useState(0)
  const [demoTotalPages, setDemoTotalPages] = useState(1)
  const [loadingDemos, setLoadingDemos] = useState(false)
  const [demoStats, setDemoStats] = useState<any>(null)
  const [upcomingDemos, setUpcomingDemos] = useState<any[]>([])
  const [updatingDemoId, setUpdatingDemoId] = useState<string | null>(null)

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
        // Initialize price inputs with fallback defaults - B2B
        const cfg = data.config
        setPriceInputs({
          therapistPriceBasic: String((cfg.therapistPriceBasic ?? 7900) / 100),
          therapistPriceIntermediate: String((cfg.therapistPriceIntermediate ?? 14900) / 100),
          therapistPricePro: String((cfg.therapistPricePro ?? 24900) / 100),
        })
        // Also ensure configDraft has all required fields with defaults
        setConfigDraft({
          ...data.config,
          therapistPriceBasic: cfg.therapistPriceBasic ?? 7900,
          therapistPriceIntermediate: cfg.therapistPriceIntermediate ?? 14900,
          therapistPricePro: cfg.therapistPricePro ?? 24900,
          therapistLeadsPerDay: cfg.therapistLeadsPerDay ?? 10,
          enableLeadSignup: cfg.enableLeadSignup ?? true,
          enableLeadAnalysis: cfg.enableLeadAnalysis ?? true,
          enableLeadCta: cfg.enableLeadCta ?? true,
          // Regras de geração de leads
          leadSignupPlans: cfg.leadSignupPlans ?? '["BASIC","INTERMEDIATE","PRO"]',
          leadAnalysisPlans: cfg.leadAnalysisPlans ?? '["INTERMEDIATE","PRO"]',
          leadCtaPlans: cfg.leadCtaPlans ?? '["PRO"]',
          leadCooldownHours: cfg.leadCooldownHours ?? 24,
          leadMaxSignupPerDay: cfg.leadMaxSignupPerDay ?? 20,
          leadMaxAnalysisPerDay: cfg.leadMaxAnalysisPerDay ?? 10,
          leadMaxCtaPerDay: cfg.leadMaxCtaPerDay ?? 5,
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

  const createUser = async () => {
    if (!newUserForm.email) {
      alert('Email é obrigatório')
      return
    }
    setCreatingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      })
      if (res.ok) {
        setShowCreateUser(false)
        setNewUserForm({ email: '', name: '', phone: '' })
        loadUsers(1, userSearch)
        alert('Usuário criado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Erro ao criar usuário')
    } finally {
      setCreatingUser(false)
    }
  }

  const updateUser = async () => {
    if (!editingUser) return
    setSavingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editUserForm.name,
          email: editUserForm.email,
          phone: editUserForm.phone
        })
      })
      if (res.ok) {
        setEditUserMode('view')
        loadUsers(userPage, userSearch)
        const data = await res.json()
        setEditingUser({ ...editingUser, ...data.user })
        alert('Usuário atualizado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar usuário')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Erro ao atualizar usuário')
    } finally {
      setSavingUser(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }
    setDeletingUser(userId)
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setEditingUser(null)
        loadUsers(userPage, userSearch)
        alert('Usuário excluído com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário')
    } finally {
      setDeletingUser(null)
    }
  }

  const loadAdmins = async () => {
    setLoadingAdmins(true)
    try {
      const res = await fetch('/api/admin/admins')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins || [])
      }
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const createAdmin = async () => {
    if (!newAdminForm.email) {
      alert('Email é obrigatório')
      return
    }
    setCreatingAdmin(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminForm)
      })
      if (res.ok) {
        setShowCreateAdmin(false)
        setNewAdminForm({ email: '', name: '', role: 'ADMIN' })
        loadAdmins()
        alert('Administrador criado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao criar administrador')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      alert('Erro ao criar administrador')
    } finally {
      setCreatingAdmin(false)
    }
  }

  const toggleAdminActive = async (adminId: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, active: !active })
      })
      if (res.ok) {
        loadAdmins()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar admin')
      }
    } catch (error) {
      console.error('Error toggling admin:', error)
    }
  }

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) {
      return
    }
    setDeletingAdmin(adminId)
    try {
      const res = await fetch(`/api/admin/admins?adminId=${adminId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        loadAdmins()
        alert('Administrador excluído com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir administrador')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('Erro ao excluir administrador')
    } finally {
      setDeletingAdmin(null)
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
  
  const loadApiKeys = async () => {
    setLoadingApiKeys(true)
    try {
      const res = await fetch('/api/admin/api-keys')
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data.apiKeys)
        setApiKeysSummary(data.summary)
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoadingApiKeys(false)
    }
  }

  const loadTherapists = async (page = 1, search = '', status = '') => {
    setLoadingTherapists(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      
      const res = await fetch(`/api/admin/therapists?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTherapists(data.therapists)
        setTherapistPage(data.pagination.page)
        setTherapistTotal(data.pagination.total)
        setTherapistTotalPages(data.pagination.totalPages)
        setTherapistStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading therapists:', error)
    } finally {
      setLoadingTherapists(false)
    }
  }

  const loadAdminLeads = async (page = 1, type = '', status = '', therapistId = '') => {
    setLoadingLeads(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      if (therapistId) params.set('therapistId', therapistId)
      
      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAdminLeads(data.leads)
        setLeadPage(data.pagination.page)
        setLeadTotal(data.pagination.total)
        setLeadTotalPages(data.pagination.totalPages)
        setLeadStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoadingLeads(false)
    }
  }
  
  const loadAllTherapists = async () => {
    try {
      const res = await fetch('/api/admin/therapists?limit=100&status=APPROVED')
      if (res.ok) {
        const data = await res.json()
        setAllTherapists(data.therapists || [])
      }
    } catch (error) {
      console.error('Error loading therapists for assign:', error)
    }
  }
  
  const assignTherapistToLead = async (leadId: string, therapistId: string, sendNotification: boolean) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, therapistId, sendNotification })
      })
      
      if (res.ok) {
        // Recarregar leads
        loadAdminLeads(leadPage, leadTypeFilter, leadStatusFilter, leadTherapistFilter)
        setAssigningLead(null)
        setSelectedTherapistForAssign('')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atribuir terapeuta')
      }
    } catch (error) {
      console.error('Error assigning therapist:', error)
      alert('Erro ao atribuir terapeuta')
    }
  }
  
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus })
      })
      
      if (res.ok) {
        loadAdminLeads(leadPage, leadTypeFilter, leadStatusFilter, leadTherapistFilter)
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  // ============================================
  // DEMONSTRAÇÕES
  // ============================================
  
  const loadDemos = async (page = 1, status = '') => {
    setLoadingDemos(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (status) params.set('status', status)
      
      const res = await fetch(`/api/admin/demos?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDemos(data.demos)
        setDemoPage(data.page)
        setDemoTotal(data.total)
        setDemoTotalPages(data.totalPages)
        setDemoStats(data.stats)
        setUpcomingDemos(data.upcomingDemos || [])
      }
    } catch (error) {
      console.error('Error loading demos:', error)
    } finally {
      setLoadingDemos(false)
    }
  }
  
  const updateDemoStatus = async (demoId: string, newStatus: string, notes?: string) => {
    setUpdatingDemoId(demoId)
    try {
      const res = await fetch('/api/admin/demos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: demoId, status: newStatus, notes })
      })
      
      if (res.ok) {
        loadDemos(demoPage, demoStatusFilter)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar demonstração')
      }
    } catch (error) {
      console.error('Error updating demo status:', error)
      alert('Erro ao atualizar demonstração')
    } finally {
      setUpdatingDemoId(null)
    }
  }

  const updateTherapist = async (therapistId: string, action: string) => {
    try {
      const res = await fetch('/api/admin/therapists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, action })
      })
      if (res.ok) {
        loadTherapists(therapistPage, therapistSearch, therapistStatusFilter)
      }
    } catch (error) {
      console.error('Error updating therapist:', error)
    }
  }

  const openTherapistModal = (therapist: any, mode: 'view' | 'edit' = 'view') => {
    setEditingTherapist(therapist)
    setEditTherapistMode(mode)
    setEditTherapistForm({
      name: therapist.name || '',
      email: therapist.email || '',
      whatsapp: therapist.whatsapp || '',
      type: therapist.type || 'OUTRO',
      bio: therapist.bio || '',
      instagram: therapist.instagram || '',
      website: therapist.website || '',
      crp: therapist.crp || '',
      plan: therapist.plan || 'BASIC',
      status: therapist.status || 'PENDING',
      subscriptionStatus: therapist.subscriptionStatus || 'inactive'
    })
  }

  const saveTherapistEdit = async () => {
    if (!editingTherapist) return
    setSavingTherapist(true)
    try {
      const res = await fetch('/api/admin/therapists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: editingTherapist.id,
          action: 'edit',
          ...editTherapistForm
        })
      })
      if (res.ok) {
        loadTherapists(therapistPage, therapistSearch, therapistStatusFilter)
        setEditingTherapist(null)
        setEditTherapistMode('view')
        alert('Terapeuta atualizado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar terapeuta')
      }
    } catch (error) {
      console.error('Error saving therapist:', error)
      alert('Erro ao salvar terapeuta')
    } finally {
      setSavingTherapist(false)
    }
  }

  const changeTherapistPlan = async (therapistId: string, newPlan: string) => {
    try {
      const res = await fetch('/api/admin/therapists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          action: 'change_plan',
          plan: newPlan
        })
      })
      if (res.ok) {
        loadTherapists(therapistPage, therapistSearch, therapistStatusFilter)
        setShowChangePlanModal(null)
        setNewPlanForTherapist('')
        alert('Plano alterado com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao alterar plano')
      }
    } catch (error) {
      console.error('Error changing therapist plan:', error)
      alert('Erro ao alterar plano')
    }
  }

  const deleteTherapist = async (therapistId: string) => {
    if (!confirm('Tem certeza que deseja excluir este terapeuta? Esta ação não pode ser desfeita. Os leads associados serão desvinculados mas mantidos no sistema.')) {
      return
    }
    
    setDeletingTherapist(therapistId)
    try {
      const res = await fetch(`/api/admin/therapists?therapistId=${therapistId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        loadTherapists(therapistPage, therapistSearch, therapistStatusFilter)
        alert('Terapeuta excluído com sucesso!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir terapeuta')
      }
    } catch (error) {
      console.error('Error deleting therapist:', error)
      alert('Erro ao excluir terapeuta')
    } finally {
      setDeletingTherapist(null)
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
    
    const updatedConfig = {
      ...configDraft,
      therapistPriceBasic: parsePrice(priceInputs.therapistPriceBasic) || configDraft.therapistPriceBasic,
      therapistPriceIntermediate: parsePrice(priceInputs.therapistPriceIntermediate) || configDraft.therapistPriceIntermediate,
      therapistPricePro: parsePrice(priceInputs.therapistPricePro) || configDraft.therapistPricePro,
    }
    
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      })
      
      if (res.ok) {
        const data = await res.json()
        const cfg = data.config
        setConfig(cfg)
        // Update configDraft with fallback defaults - B2B
        setConfigDraft({
          ...cfg,
          therapistPriceBasic: cfg.therapistPriceBasic ?? 7900,
          therapistPriceIntermediate: cfg.therapistPriceIntermediate ?? 14900,
          therapistPricePro: cfg.therapistPricePro ?? 24900,
          therapistLeadsPerDay: cfg.therapistLeadsPerDay ?? 10,
          enableLeadSignup: cfg.enableLeadSignup ?? true,
          enableLeadAnalysis: cfg.enableLeadAnalysis ?? true,
          enableLeadCta: cfg.enableLeadCta ?? true,
          leadSignupPlans: cfg.leadSignupPlans ?? '["BASIC","INTERMEDIATE","PRO"]',
          leadAnalysisPlans: cfg.leadAnalysisPlans ?? '["INTERMEDIATE","PRO"]',
          leadCtaPlans: cfg.leadCtaPlans ?? '["PRO"]',
          leadCooldownHours: cfg.leadCooldownHours ?? 24,
          leadMaxSignupPerDay: cfg.leadMaxSignupPerDay ?? 20,
          leadMaxAnalysisPerDay: cfg.leadMaxAnalysisPerDay ?? 10,
          leadMaxCtaPerDay: cfg.leadMaxCtaPerDay ?? 5,
        })
        // Update price inputs after save - B2B
        setPriceInputs({
          therapistPriceBasic: String((cfg.therapistPriceBasic ?? 7900) / 100),
          therapistPriceIntermediate: String((cfg.therapistPriceIntermediate ?? 14900) / 100),
          therapistPricePro: String((cfg.therapistPricePro ?? 24900) / 100),
        })
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

  // Função updateUser removida - modelo B2B não usa mais planos de usuário

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  // Tab configuration para renderização dinâmica
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, onClick: () => setActiveTab('dashboard') },
    { id: 'config', label: 'Config', icon: Settings, onClick: () => setActiveTab('config') },
    { id: 'users', label: 'Usuários', icon: Users, onClick: () => { setActiveTab('users'); loadUsers(1, ''); } },
    { id: 'therapists', label: 'Terapeutas', icon: UserCheck, onClick: () => { setActiveTab('therapists'); loadTherapists(1, '', ''); } },
    { id: 'leads', label: 'Leads', icon: MessageCircle, onClick: () => { setActiveTab('leads'); loadAdminLeads(1, '', '', ''); loadAllTherapists(); } },
    { id: 'forms', label: 'Formulários', icon: Layers, onClick: () => setActiveTab('forms') },
    { id: 'demos', label: 'Demos', icon: Activity, onClick: () => { setActiveTab('demos'); loadDemos(1, ''); } },
    { id: 'logs', label: 'Logs', icon: FileText, onClick: () => { setActiveTab('logs'); loadLogs(1); } },
    { id: 'apikeys', label: 'API Keys', icon: Key, onClick: () => { setActiveTab('apikeys'); loadApiKeys(); } },
    { id: 'admins', label: 'Admins', icon: UserCog, onClick: () => { setActiveTab('admins'); loadAdmins(); } },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-teal-500/20" />
            <div className="relative w-16 h-16 rounded-full border-2 border-teal-500/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-t-2 border-teal-400 animate-spin" />
            </div>
          </div>
          <p className="text-teal-400/80 text-sm font-mono tracking-wider uppercase">Inicializando sistema...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header - Command Bar */}
      <nav className="relative z-50 bg-[#0d0d14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <Logo size="lg" variant="dark" />
                  <div className="absolute -inset-1 bg-teal-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Radar Match
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    Control Panel v2.0
                  </span>
                </div>
              </Link>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400 tracking-wider uppercase">Admin Mode</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={loadDashboard}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-teal-400 transition-all group"
                title="Recarregar dados"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={`relative px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 text-sm ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/30" />
                )}
                <Icon className={`relative w-4 h-4 ${isActive ? 'text-teal-400' : ''}`} />
                <span className="relative">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-300 font-semibold text-sm">Erro ao carregar dados</p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              </div>
              <button 
                onClick={loadDashboard}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
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
            {/* Stats Cards - Redesigned */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Usuários Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6 hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-mono text-cyan-500/60 tracking-wider">USERS</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stats.users.total.toLocaleString()}</p>
                  <p className="text-sm text-white/40">
                    <span className="text-cyan-400">{stats.users.withPhone || 0}</span> com telefone
                  </p>
                </div>
              </div>

              {/* Análises Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6 hover:border-teal-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                      <BarChart3 className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs font-mono text-teal-500/60 tracking-wider">ANÁLISES</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stats.analyses.total.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs">{stats.analyses.today} hoje</span>
                    <span>{stats.analyses.thisMonth} mês</span>
                  </div>
                </div>
              </div>

              {/* Terapeutas Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6 hover:border-emerald-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-mono text-emerald-500/60 tracking-wider">TERAPEUTAS</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stats.therapists?.total || 0}</p>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span className="text-emerald-400">{stats.therapists?.approved || 0}</span> aprovados
                    <span className="text-white/20">•</span>
                    <span className="text-amber-400">{stats.therapists?.pending || 0}</span> pendentes
                  </div>
                </div>
              </div>

              {/* Leads Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6 hover:border-pink-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
                      <MessageCircle className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-xs font-mono text-pink-500/60 tracking-wider">LEADS</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stats.leads?.total || 0}</p>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span className="text-pink-400">{stats.leads?.today || 0}</span> hoje
                    <span className="text-white/20">•</span>
                    <span className="text-green-400">{stats.leads?.converted || 0}</span> convertidos
                  </div>
                </div>
              </div>
            </div>

            {/* API Usage Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <Cpu className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono text-amber-500/60 tracking-wider">GEMINI API</span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stats.gemini.callsToday}</p>
                  <p className="text-sm text-white/40">
                    <span className="text-amber-400">{stats.gemini.callsThisMonth}</span> chamadas este mês
                  </p>
                </div>
              </div>

              {/* Top Users - Redesigned */}
              <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1419] to-[#0a0d10] border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    Top Usuários
                  </h3>
                  <span className="text-xs font-mono text-white/30">POR ANÁLISES</span>
                </div>
                <div className="space-y-3">
                  {topUsers.slice(0, 5).map((user, idx) => (
                    <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                        <span className="text-xs font-bold text-teal-400">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.email}</p>
                        <p className="text-xs text-white/40">{user.name || 'Sem nome'}</p>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400 font-mono">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <span className="text-sm font-bold text-teal-400">{user.analysesCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            {/* Limites da Jornada do Lead */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Limites da Jornada do Lead
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Máx. análises por dia (por lead)
                  </label>
                  <Input
                    type="number"
                    value={configDraft.leadMaxAnalysesPerDay ?? 50}
                    onChange={(e) => setConfigDraft({...configDraft, leadMaxAnalysesPerDay: parseInt(e.target.value) || 50})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limite de análises de match que um lead pode fazer por dia
                  </p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Máx. análises de comportamento por dia (por lead)
                  </label>
                  <Input
                    type="number"
                    value={configDraft.leadMaxRouteCorrectionPerDay ?? 3}
                    onChange={(e) => setConfigDraft({...configDraft, leadMaxRouteCorrectionPerDay: parseInt(e.target.value) || 3})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limite de análises de comportamento por dia (usa Gemini)
                  </p>
                </div>
              </div>
              
              <h4 className="text-md font-semibold text-gray-300 mt-6 mb-4">Desbloqueio de Análise de Comportamento</h4>
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
              
              <div className="border-t border-gray-700 mt-6 pt-6">
                <h4 className="text-md font-semibold text-white mb-4">Modelos de IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Modelo para Análise de Matches
                    </label>
                    <select
                      value={configDraft.geminiModelAnalysis || 'gemini-1.5-flash'}
                      onChange={(e) => setConfigDraft({...configDraft, geminiModelAnalysis: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (rápido, econômico)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (mais capaz)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (mais recente)</option>
                      <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (ultra rápido)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Usado para análise principal de matches</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Modelo para Correção de Rota
                    </label>
                    <select
                      value={configDraft.geminiModelRouteCorrection || 'gemini-2.0-flash'}
                      onChange={(e) => setConfigDraft({...configDraft, geminiModelRouteCorrection: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (rápido, econômico)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (mais capaz)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (mais recente)</option>
                      <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (ultra rápido)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Usado para análise de comportamento e evolução</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Preços de Planos de Terapeutas (B2B)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Plano Básico (R$/mês)
                  </label>
                  <Input
                    type="text"
                    placeholder="79.00"
                    value={priceInputs.therapistPriceBasic}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, therapistPriceBasic: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.therapistPriceBasic.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft!, therapistPriceBasic: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, therapistPriceBasic: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, therapistPriceBasic: String((configDraft?.therapistPriceBasic || 7900) / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leads de cadastro apenas</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Plano Intermediário (R$/mês)
                  </label>
                  <Input
                    type="text"
                    placeholder="149.00"
                    value={priceInputs.therapistPriceIntermediate}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, therapistPriceIntermediate: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.therapistPriceIntermediate.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft!, therapistPriceIntermediate: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, therapistPriceIntermediate: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, therapistPriceIntermediate: String((configDraft?.therapistPriceIntermediate || 14900) / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leads cadastro + CTA (email)</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Plano PRO (R$/mês)
                  </label>
                  <Input
                    type="text"
                    placeholder="249.00"
                    value={priceInputs.therapistPricePro}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                        setPriceInputs({...priceInputs, therapistPricePro: value})
                      }
                    }}
                    onBlur={() => {
                      const value = priceInputs.therapistPricePro.replace(',', '.')
                      const num = parseFloat(value)
                      if (!isNaN(num) && num >= 0) {
                        setConfigDraft({...configDraft!, therapistPricePro: Math.round(num * 100)})
                        setPriceInputs({...priceInputs, therapistPricePro: num.toFixed(2)})
                      } else {
                        setPriceInputs({...priceInputs, therapistPricePro: String((configDraft?.therapistPricePro || 24900) / 100)})
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Todos os leads + WhatsApp direto</p>
                </div>
              </div>
              
              {/* Limite de leads por dia */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="max-w-xs">
                  <label className="block text-gray-400 text-sm mb-2">
                    Limite de leads por terapeuta/dia
                  </label>
                  <Input
                    type="number"
                    value={configDraft?.therapistLeadsPerDay || 10}
                    onChange={(e) => setConfigDraft({...configDraft!, therapistLeadsPerDay: parseInt(e.target.value) || 10})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </Card>

            {/* Regras de Geração de Leads */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-pink-500" />
                Regras de Geração de Leads
              </h3>
              
              {/* Quais planos recebem cada tipo de lead */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-3">Quais planos recebem cada tipo de lead:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SIGNUP leads */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-blue-400 font-semibold mb-2">📝 Leads SIGNUP (frios)</p>
                      <p className="text-xs text-gray-500 mb-3">Usuários que cadastraram telefone</p>
                      <div className="space-y-2">
                        {['BASIC', 'INTERMEDIATE', 'PRO'].map(plan => {
                          const plans = JSON.parse(configDraft?.leadSignupPlans || '[]')
                          const checked = plans.includes(plan)
                          return (
                            <label key={plan} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const newPlans = e.target.checked 
                                    ? [...plans, plan]
                                    : plans.filter((p: string) => p !== plan)
                                  setConfigDraft({...configDraft!, leadSignupPlans: JSON.stringify(newPlans)})
                                }}
                                className="w-4 h-4 rounded bg-gray-600"
                              />
                              <span className="text-white text-sm">{plan}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* ANALYSIS leads */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-purple-400 font-semibold mb-2">📊 Leads ANALYSIS (mornos)</p>
                      <p className="text-xs text-gray-500 mb-3">Usuários que fizeram análise</p>
                      <div className="space-y-2">
                        {['BASIC', 'INTERMEDIATE', 'PRO'].map(plan => {
                          const plans = JSON.parse(configDraft?.leadAnalysisPlans || '[]')
                          const checked = plans.includes(plan)
                          return (
                            <label key={plan} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const newPlans = e.target.checked 
                                    ? [...plans, plan]
                                    : plans.filter((p: string) => p !== plan)
                                  setConfigDraft({...configDraft!, leadAnalysisPlans: JSON.stringify(newPlans)})
                                }}
                                className="w-4 h-4 rounded bg-gray-600"
                              />
                              <span className="text-white text-sm">{plan}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* CTA leads */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-green-400 font-semibold mb-2">🔥 Leads CTA (quentes)</p>
                      <p className="text-xs text-gray-500 mb-3">Clicaram em "Falar com especialista"</p>
                      <div className="space-y-2">
                        {['BASIC', 'INTERMEDIATE', 'PRO'].map(plan => {
                          const plans = JSON.parse(configDraft?.leadCtaPlans || '[]')
                          const checked = plans.includes(plan)
                          return (
                            <label key={plan} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const newPlans = e.target.checked 
                                    ? [...plans, plan]
                                    : plans.filter((p: string) => p !== plan)
                                  setConfigDraft({...configDraft!, leadCtaPlans: JSON.stringify(newPlans)})
                                }}
                                className="w-4 h-4 rounded bg-gray-600"
                              />
                              <span className="text-white text-sm">{plan}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cooldown e limites */}
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 font-semibold mb-3">Cooldown e limites diários:</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">
                        Cooldown entre leads (horas)
                      </label>
                      <Input
                        type="number"
                        value={configDraft?.leadCooldownHours || 24}
                        onChange={(e) => setConfigDraft({...configDraft!, leadCooldownHours: parseInt(e.target.value) || 24})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mesmo usuário, mesmo tipo</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">
                        Máx SIGNUP/dia/terapeuta
                      </label>
                      <Input
                        type="number"
                        value={configDraft?.leadMaxSignupPerDay || 20}
                        onChange={(e) => setConfigDraft({...configDraft!, leadMaxSignupPerDay: parseInt(e.target.value) || 20})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">
                        Máx ANALYSIS/dia/terapeuta
                      </label>
                      <Input
                        type="number"
                        value={configDraft?.leadMaxAnalysisPerDay || 10}
                        onChange={(e) => setConfigDraft({...configDraft!, leadMaxAnalysisPerDay: parseInt(e.target.value) || 10})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">
                        Máx CTA/dia/terapeuta
                      </label>
                      <Input
                        type="number"
                        value={configDraft?.leadMaxCtaPerDay || 5}
                        onChange={(e) => setConfigDraft({...configDraft!, leadMaxCtaPerDay: parseInt(e.target.value) || 5})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Feature Flags
              </h3>
              <div className="space-y-4">
                {/* Flags B2B */}
                <div className="pb-4 border-b border-gray-700">
                  <p className="text-sm text-purple-400 font-semibold mb-3">🎯 Geração de Leads (B2B)</p>
                  <div className="space-y-3 ml-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configDraft?.enableLeadSignup ?? true}
                        onChange={(e) => setConfigDraft({...configDraft!, enableLeadSignup: e.target.checked})}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <div>
                        <span className="text-white font-medium">Gerar Lead no Cadastro</span>
                        <p className="text-xs text-gray-500">Gera lead quando usuário informa telefone</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configDraft?.enableLeadAnalysis ?? true}
                        onChange={(e) => setConfigDraft({...configDraft!, enableLeadAnalysis: e.target.checked})}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <div>
                        <span className="text-white font-medium">Gerar Lead na Análise</span>
                        <p className="text-xs text-gray-500">Gera lead quando usuário preenche o formulário de análise</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configDraft?.enableLeadCta ?? true}
                        onChange={(e) => setConfigDraft({...configDraft!, enableLeadCta: e.target.checked})}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <div>
                        <span className="text-white font-medium">Gerar Lead no CTA</span>
                        <p className="text-xs text-gray-500">Gera lead quando usuário clica em "Falar com especialista"</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Flags Gerais */}
                <div>
                  <p className="text-sm text-gray-400 font-semibold mb-3">⚙️ Sistema</p>
                  <div className="space-y-3 ml-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configDraft?.maintenanceMode ?? false}
                        onChange={(e) => setConfigDraft({...configDraft!, maintenanceMode: e.target.checked})}
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
                        checked={configDraft?.allowNewRegistrations ?? true}
                        onChange={(e) => setConfigDraft({...configDraft!, allowNewRegistrations: e.target.checked})}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <div>
                        <span className="text-white font-medium">Permitir Novos Cadastros</span>
                        <p className="text-xs text-gray-500">Permite que novos usuários se cadastrem</p>
                      </div>
                    </label>
                  </div>
                </div>
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
            {/* Search + Create */}
            <div className="flex gap-4 items-center">
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
              <Button
                onClick={() => setShowCreateUser(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
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
                          <th className="pb-3">Telefone</th>
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
                              {user.phone ? (
                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-600/20 text-green-400">
                                  {user.phone}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 text-white">{user.analysesCount}</td>
                            <td className="py-3 text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user)
                                    setEditUserMode('view')
                                    setEditUserForm({ name: user.name || '', email: user.email, phone: user.phone || '' })
                                  }}
                                  className="text-purple-400 hover:text-purple-300 text-sm"
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUser(user)
                                    setEditUserMode('edit')
                                    setEditUserForm({ name: user.name || '', email: user.email, phone: user.phone || '' })
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  disabled={deletingUser === user.id}
                                  className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                                >
                                  {deletingUser === user.id ? '...' : 'Excluir'}
                                </button>
                              </div>
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

        {/* API Keys Tab */}
        {activeTab === 'apikeys' && (
          <div className="space-y-6">
            {/* Resumo */}
            {apiKeysSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      apiKeysSummary.required.configured === apiKeysSummary.required.total 
                        ? 'bg-green-600/20' 
                        : 'bg-yellow-600/20'
                    }`}>
                      <Key className={`w-6 h-6 ${
                        apiKeysSummary.required.configured === apiKeysSummary.required.total 
                          ? 'text-green-500' 
                          : 'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Serviços Obrigatórios</p>
                      <p className="text-2xl font-bold text-white">
                        {apiKeysSummary.required.configured} / {apiKeysSummary.required.total}
                      </p>
                      <p className="text-xs text-gray-500">configurados</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Serviços Opcionais</p>
                      <p className="text-2xl font-bold text-white">
                        {apiKeysSummary.optional.configured} / {apiKeysSummary.optional.total}
                      </p>
                      <p className="text-xs text-gray-500">configurados</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {loadingApiKeys ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : apiKeys ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(apiKeys).map(([key, service]: [string, any]) => {
                  const allConfigured = Object.values(service.keys).every((k: any) => k.configured)
                  const someConfigured = Object.values(service.keys).some((k: any) => k.configured)
                  
                  return (
                    <Card 
                      key={key} 
                      className={`border p-6 ${
                        allConfigured 
                          ? 'bg-gray-800 border-green-700/50' 
                          : someConfigured 
                            ? 'bg-gray-800 border-yellow-700/50'
                            : service.optional 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-gray-800 border-red-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {service.name}
                            {service.optional && (
                              <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                                Opcional
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">{service.description}</p>
                        </div>
                        <div className={`p-2 rounded-full ${
                          allConfigured 
                            ? 'bg-green-600/20' 
                            : someConfigured 
                              ? 'bg-yellow-600/20'
                              : 'bg-red-600/20'
                        }`}>
                          {allConfigured ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : someConfigured ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(service.keys).map(([keyName, keyData]: [string, any]) => (
                          <div 
                            key={keyName} 
                            className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300">{keyData.label}</span>
                                {keyData.configured ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-mono">{keyData.envVar}</p>
                            </div>
                            <div className="text-right">
                              {keyData.configured ? (
                                <code className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 font-mono">
                                  {keyData.masked}
                                </code>
                              ) : (
                                <span className="text-xs text-red-400">Não configurado</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700 p-12 text-center">
                <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Clique em "API Keys" para carregar as informações</p>
              </Card>
            )}

            {/* Instruções */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Informações de Segurança
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  As chaves de API são armazenadas no arquivo <code className="bg-gray-700 px-1 rounded">.env</code> no servidor.
                </p>
                <p>
                  Por segurança, apenas os primeiros e últimos caracteres são exibidos aqui.
                </p>
                <p>
                  Para alterar uma chave, edite o arquivo <code className="bg-gray-700 px-1 rounded">.env</code> diretamente e reinicie o servidor.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Therapists Tab */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            {/* Stats */}
            {therapistStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total</p>
                      <p className="text-2xl font-bold text-white">{therapistStats.total}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Ativos</p>
                      <p className="text-2xl font-bold text-white">{therapistStats.active}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-600/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Pendentes</p>
                      <p className="text-2xl font-bold text-white">
                        {therapistStats.byStatus?.find((s: any) => s.status === 'PENDING')?._count || 0}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <Crown className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">PRO</p>
                      <p className="text-2xl font-bold text-white">
                        {therapistStats.byPlan?.find((p: any) => p.plan === 'PRO')?._count || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={therapistSearch}
                  onChange={(e) => setTherapistSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadTherapists(1, therapistSearch, therapistStatusFilter)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <select
                value={therapistStatusFilter}
                onChange={(e) => { setTherapistStatusFilter(e.target.value); loadTherapists(1, therapistSearch, e.target.value); }}
                className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">Todos os status</option>
                <option value="PENDING">Pendentes</option>
                <option value="APPROVED">Aprovados</option>
                <option value="SUSPENDED">Suspensos</option>
                <option value="BLOCKED">Bloqueados</option>
              </select>
              <Button onClick={() => loadTherapists(1, therapistSearch, therapistStatusFilter)} className="bg-purple-600 hover:bg-purple-700">
                Buscar
              </Button>
            </div>

            {/* Table */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              {loadingTherapists ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                          <th className="pb-3">Nome</th>
                          <th className="pb-3">Tipo</th>
                          <th className="pb-3">Plano</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Leads</th>
                          <th className="pb-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {therapists.map((t) => (
                          <tr key={t.id} className="border-b border-gray-700/50">
                            <td className="py-3">
                              <div>
                                <p className="text-white font-medium">{t.name}</p>
                                <p className="text-gray-400 text-sm">{t.email}</p>
                                {t.whatsapp && (
                                  <p className="text-gray-500 text-xs flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {t.whatsapp}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-gray-300">{t.type}</td>
                            <td className="py-3">
                              <button
                                onClick={() => { setShowChangePlanModal(t.id); setNewPlanForTherapist(t.plan); }}
                                className="cursor-pointer hover:opacity-80 transition"
                                title="Clique para alterar plano"
                              >
                                <Badge className={
                                  t.plan === 'PRO' ? 'bg-purple-600' : 
                                  t.plan === 'INTERMEDIATE' ? 'bg-orange-600' : 'bg-gray-600'
                                }>
                                  {t.plan}
                                </Badge>
                              </button>
                            </td>
                            <td className="py-3">
                              <Badge className={
                                t.status === 'APPROVED' ? 'bg-green-600' :
                                t.status === 'PENDING' ? 'bg-yellow-600' :
                                t.status === 'SUSPENDED' ? 'bg-orange-600' : 'bg-red-600'
                              }>
                                {t.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-white">{t.leadsReceived}</td>
                            <td className="py-3">
                              <div className="flex gap-2 flex-wrap">
                                {/* Botão Ver/Editar */}
                                <Button 
                                  onClick={() => openTherapistModal(t, 'view')} 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-gray-600"
                                  title="Ver detalhes"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                {/* Ações de status */}
                                {t.status === 'PENDING' && (
                                  <Button onClick={() => updateTherapist(t.id, 'approve')} size="sm" className="bg-green-600 hover:bg-green-700">
                                    Aprovar
                                  </Button>
                                )}
                                {t.status === 'APPROVED' && !t.active && (
                                  <Button onClick={() => updateTherapist(t.id, 'activate')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    Ativar
                                  </Button>
                                )}
                                {t.active && (
                                  <Button onClick={() => updateTherapist(t.id, 'deactivate')} size="sm" variant="outline" className="border-gray-600">
                                    Desativar
                                  </Button>
                                )}
                                {t.status !== 'BLOCKED' && (
                                  <Button onClick={() => updateTherapist(t.id, 'block')} size="sm" variant="outline" className="border-red-600 text-red-400">
                                    Bloquear
                                  </Button>
                                )}
                                
                                {/* Botão Excluir */}
                                <Button 
                                  onClick={() => deleteTherapist(t.id)} 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-600 text-red-400 hover:bg-red-900/30"
                                  disabled={deletingTherapist === t.id}
                                  title="Excluir terapeuta"
                                >
                                  {deletingTherapist === t.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Mostrando {therapists.length} de {therapistTotal}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadTherapists(therapistPage - 1, therapistSearch, therapistStatusFilter)}
                        disabled={therapistPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-600"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-1 text-gray-400">{therapistPage} / {therapistTotalPages}</span>
                      <Button
                        onClick={() => loadTherapists(therapistPage + 1, therapistSearch, therapistStatusFilter)}
                        disabled={therapistPage === therapistTotalPages}
                        variant="outline"
                        size="sm"
                        className="border-gray-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Modal de Alteração de Plano */}
            {showChangePlanModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    Alterar Plano
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition">
                      <input 
                        type="radio" 
                        name="newPlan" 
                        value="BASIC"
                        checked={newPlanForTherapist === 'BASIC'}
                        onChange={(e) => setNewPlanForTherapist(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <p className="text-white font-medium">BASIC</p>
                        <p className="text-gray-400 text-sm">Leads de cadastro (frios)</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition">
                      <input 
                        type="radio" 
                        name="newPlan" 
                        value="INTERMEDIATE"
                        checked={newPlanForTherapist === 'INTERMEDIATE'}
                        onChange={(e) => setNewPlanForTherapist(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <p className="text-white font-medium">INTERMEDIATE</p>
                        <p className="text-gray-400 text-sm">Leads de cadastro + análise</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition">
                      <input 
                        type="radio" 
                        name="newPlan" 
                        value="PRO"
                        checked={newPlanForTherapist === 'PRO'}
                        onChange={(e) => setNewPlanForTherapist(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <p className="text-white font-medium">PRO</p>
                        <p className="text-gray-400 text-sm">Todos os leads + WhatsApp direto</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button 
                      onClick={() => { setShowChangePlanModal(null); setNewPlanForTherapist(''); }}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => changeTherapistPlan(showChangePlanModal, newPlanForTherapist)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Salvar Plano
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Modal de Edição/Visualização de Terapeuta */}
            {editingTherapist && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
                <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl mx-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-purple-500" />
                      {editTherapistMode === 'edit' ? 'Editar Terapeuta' : 'Detalhes do Terapeuta'}
                    </h3>
                    <div className="flex gap-2">
                      {editTherapistMode === 'view' && (
                        <Button 
                          onClick={() => setEditTherapistMode('edit')}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      <Button 
                        onClick={() => { setEditingTherapist(null); setEditTherapistMode('view'); }}
                        size="sm"
                        variant="outline"
                        className="border-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editTherapistMode === 'view' ? (
                    // Modo Visualização
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Nome</p>
                          <p className="text-white">{editingTherapist.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white">{editingTherapist.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">WhatsApp</p>
                          <p className="text-white">{editingTherapist.whatsapp || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Tipo</p>
                          <p className="text-white">{editingTherapist.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Plano</p>
                          <Badge className={
                            editingTherapist.plan === 'PRO' ? 'bg-purple-600' : 
                            editingTherapist.plan === 'INTERMEDIATE' ? 'bg-orange-600' : 'bg-gray-600'
                          }>
                            {editingTherapist.plan}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <Badge className={
                            editingTherapist.status === 'APPROVED' ? 'bg-green-600' :
                            editingTherapist.status === 'PENDING' ? 'bg-yellow-600' :
                            editingTherapist.status === 'SUSPENDED' ? 'bg-orange-600' : 'bg-red-600'
                          }>
                            {editingTherapist.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Assinatura</p>
                          <Badge className={editingTherapist.subscriptionStatus === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                            {editingTherapist.subscriptionStatus}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">CRP</p>
                          <p className="text-white">{editingTherapist.crp || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Instagram</p>
                          <p className="text-white">{editingTherapist.instagram || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Website</p>
                          <p className="text-white">{editingTherapist.website || '-'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Bio</p>
                        <p className="text-white">{editingTherapist.bio || '-'}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                        <div>
                          <p className="text-gray-400 text-sm">Leads Recebidos</p>
                          <p className="text-white text-xl font-bold">{editingTherapist.leadsReceived || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Leads Este Mês</p>
                          <p className="text-white text-xl font-bold">{editingTherapist.leadsThisMonth || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Cadastro</p>
                          <p className="text-white text-sm">{new Date(editingTherapist.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Modo Edição
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Nome</label>
                          <Input
                            value={editTherapistForm.name}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, name: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Email</label>
                          <Input
                            value={editTherapistForm.email}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, email: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">WhatsApp</label>
                          <Input
                            value={editTherapistForm.whatsapp}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, whatsapp: e.target.value})}
                            placeholder="5511999999999"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Tipo</label>
                          <select
                            value={editTherapistForm.type}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, type: e.target.value})}
                            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
                          >
                            <option value="TAROLOGO">Tarólogo</option>
                            <option value="COACH">Coach</option>
                            <option value="HOLISTICO">Holístico</option>
                            <option value="ASTROLOGO">Astrólogo</option>
                            <option value="TERAPEUTA_FLORAL">Terapeuta Floral</option>
                            <option value="CONSTELADOR">Constelador</option>
                            <option value="PSICOLOGO">Psicólogo</option>
                            <option value="OUTRO">Outro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Plano</label>
                          <select
                            value={editTherapistForm.plan}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, plan: e.target.value})}
                            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
                          >
                            <option value="BASIC">BASIC</option>
                            <option value="INTERMEDIATE">INTERMEDIATE</option>
                            <option value="PRO">PRO</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Status</label>
                          <select
                            value={editTherapistForm.status}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, status: e.target.value})}
                            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="APPROVED">Aprovado</option>
                            <option value="SUSPENDED">Suspenso</option>
                            <option value="BLOCKED">Bloqueado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Status Assinatura</label>
                          <select
                            value={editTherapistForm.subscriptionStatus}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, subscriptionStatus: e.target.value})}
                            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
                          >
                            <option value="inactive">Inativa</option>
                            <option value="active">Ativa</option>
                            <option value="past_due">Atrasada</option>
                            <option value="canceled">Cancelada</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">CRP</label>
                          <Input
                            value={editTherapistForm.crp}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, crp: e.target.value})}
                            placeholder="00/00000"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Instagram</label>
                          <Input
                            value={editTherapistForm.instagram}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, instagram: e.target.value})}
                            placeholder="@usuario"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Website</label>
                          <Input
                            value={editTherapistForm.website}
                            onChange={(e) => setEditTherapistForm({...editTherapistForm, website: e.target.value})}
                            placeholder="https://..."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Bio</label>
                        <textarea
                          value={editTherapistForm.bio}
                          onChange={(e) => setEditTherapistForm({...editTherapistForm, bio: e.target.value})}
                          className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2 min-h-[100px]"
                          placeholder="Biografia do terapeuta..."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <Button 
                          onClick={() => setEditTherapistMode('view')}
                          variant="outline"
                          className="border-gray-600"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={saveTherapistEdit}
                          disabled={savingTherapist}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {savingTherapist ? (
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
                  )}
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Stats */}
            {leadStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total</p>
                      <p className="text-2xl font-bold text-white">{leadStats.total}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Hoje</p>
                      <p className="text-2xl font-bold text-white">{leadStats.today}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/20 rounded-lg">
                      <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Esta Semana</p>
                      <p className="text-2xl font-bold text-white">{leadStats.week}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Este Mês</p>
                      <p className="text-2xl font-bold text-white">{leadStats.month}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Alerta de leads sem terapeuta */}
            {leadStats?.unassigned > 0 && (
              <Card className="bg-orange-900/30 border-orange-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="text-orange-200 font-semibold">
                        {leadStats.unassigned} lead{leadStats.unassigned > 1 ? 's' : ''} sem terapeuta atribuído
                      </p>
                      <p className="text-orange-300/70 text-sm">Clique para filtrar e atribuir terapeutas</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => { 
                      setLeadTherapistFilter('unassigned'); 
                      loadAdminLeads(1, leadTypeFilter, leadStatusFilter, 'unassigned'); 
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Ver leads sem terapeuta
                  </Button>
                </div>
              </Card>
            )}

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <select
                value={leadTypeFilter}
                onChange={(e) => { setLeadTypeFilter(e.target.value); loadAdminLeads(1, e.target.value, leadStatusFilter, leadTherapistFilter); }}
                className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">Todos os tipos</option>
                <option value="SIGNUP">Cadastro (Frio)</option>
                <option value="ANALYSIS">Análise (Morno)</option>
                <option value="CTA">CTA (Quente)</option>
              </select>
              <select
                value={leadStatusFilter}
                onChange={(e) => { setLeadStatusFilter(e.target.value); loadAdminLeads(1, leadTypeFilter, e.target.value, leadTherapistFilter); }}
                className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">Todos os status</option>
                <option value="NEW">Novos</option>
                <option value="CONTACTED">Contatados</option>
                <option value="CONVERTED">Convertidos</option>
                <option value="LOST">Perdidos</option>
              </select>
              <select
                value={leadTherapistFilter}
                onChange={(e) => { setLeadTherapistFilter(e.target.value); loadAdminLeads(1, leadTypeFilter, leadStatusFilter, e.target.value); }}
                className="bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">Todos os terapeutas</option>
                <option value="unassigned">⚠️ Sem terapeuta</option>
                {allTherapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <Button onClick={() => loadAdminLeads(1, leadTypeFilter, leadStatusFilter, leadTherapistFilter)} variant="outline" className="border-gray-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              {(leadTypeFilter || leadStatusFilter || leadTherapistFilter) && (
                <Button 
                  onClick={() => { 
                    setLeadTypeFilter(''); 
                    setLeadStatusFilter(''); 
                    setLeadTherapistFilter('');
                    loadAdminLeads(1, '', '', ''); 
                  }} 
                  variant="outline" 
                  className="border-gray-700 text-gray-400"
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            {/* Table */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              {loadingLeads ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                          <th className="pb-3">Data</th>
                          <th className="pb-3">Tipo</th>
                          <th className="pb-3">Lead</th>
                          <th className="pb-3">Contato</th>
                          <th className="pb-3">Match</th>
                          <th className="pb-3">Terapeuta</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminLeads.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-500">
                              Nenhum lead encontrado
                            </td>
                          </tr>
                        ) : adminLeads.map((lead) => (
                          <tr key={lead.id} className={`border-b border-gray-700/50 ${!lead.therapist ? 'bg-orange-900/10' : ''}`}>
                            <td className="py-3 text-white text-sm">
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                              <br />
                              <span className="text-gray-500 text-xs">
                                {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="py-3">
                              <Badge className={
                                lead.type === 'CTA' ? 'bg-green-600' : 
                                lead.type === 'ANALYSIS' ? 'bg-purple-600' : 'bg-blue-600'
                              }>
                                {lead.type === 'CTA' ? 'Quente' : 
                                 lead.type === 'ANALYSIS' ? 'Análise' : 'Cadastro'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <p className="text-white">{lead.userName || 'Sem nome'}</p>
                              <p className="text-gray-400 text-sm">{lead.userEmail}</p>
                            </td>
                            <td className="py-3">
                              <a 
                                href={`https://wa.me/55${lead.userPhone?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm"
                              >
                                <Phone className="w-3 h-3" />
                                {lead.userPhone}
                              </a>
                            </td>
                            <td className="py-3 text-gray-300">{lead.matchName || '-'}</td>
                            <td className="py-3">
                              {lead.therapist ? (
                                <>
                                  <p className="text-white text-sm">{lead.therapist.name}</p>
                                  <Badge className={
                                    lead.therapist.plan === 'PRO' ? 'bg-purple-600' :
                                    lead.therapist.plan === 'INTERMEDIATE' ? 'bg-orange-600' : 'bg-gray-600'
                                  } style={{ fontSize: '10px' }}>
                                    {lead.therapist.plan}
                                  </Badge>
                                </>
                              ) : (
                                <Badge className="bg-orange-600 animate-pulse">
                                  ⚠️ Sem terapeuta
                                </Badge>
                              )}
                            </td>
                            <td className="py-3">
                              <Badge className={
                                lead.status === 'NEW' ? 'bg-blue-600' :
                                lead.status === 'CONTACTED' ? 'bg-yellow-600' :
                                lead.status === 'CONVERTED' ? 'bg-green-600' : 'bg-gray-600'
                              }>
                                {lead.status === 'NEW' ? 'Novo' :
                                 lead.status === 'CONTACTED' ? 'Contatado' :
                                 lead.status === 'CONVERTED' ? 'Convertido' : 'Perdido'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex flex-col gap-1">
                                {assigningLead === lead.id ? (
                                  <div className="flex flex-col gap-2 min-w-[200px]">
                                    <select
                                      value={selectedTherapistForAssign}
                                      onChange={(e) => setSelectedTherapistForAssign(e.target.value)}
                                      className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 text-sm"
                                    >
                                      <option value="">Selecione...</option>
                                      {allTherapists.map(t => (
                                        <option key={t.id} value={t.id}>
                                          {t.name} ({t.plan})
                                        </option>
                                      ))}
                                    </select>
                                    <label className="flex items-center gap-2 text-xs text-gray-400">
                                      <input 
                                        type="checkbox" 
                                        checked={sendNotificationOnAssign}
                                        onChange={(e) => setSendNotificationOnAssign(e.target.checked)}
                                        className="rounded"
                                      />
                                      Enviar notificação
                                    </label>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                                        onClick={() => {
                                          if (selectedTherapistForAssign) {
                                            assignTherapistToLead(lead.id, selectedTherapistForAssign, sendNotificationOnAssign)
                                          }
                                        }}
                                        disabled={!selectedTherapistForAssign}
                                      >
                                        <Check className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-gray-600 text-xs px-2 py-1"
                                        onClick={() => {
                                          setAssigningLead(null)
                                          setSelectedTherapistForAssign('')
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className={`text-xs ${!lead.therapist ? 'border-orange-500 text-orange-400 hover:bg-orange-600 hover:text-white' : 'border-gray-600'}`}
                                    onClick={() => {
                                      setAssigningLead(lead.id)
                                      setSelectedTherapistForAssign(lead.therapist?.id || '')
                                    }}
                                  >
                                    {lead.therapist ? 'Trocar' : 'Atribuir'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Mostrando {adminLeads.length} de {leadTotal}
                      {leadStats?.unassigned > 0 && (
                        <span className="text-orange-400 ml-2">
                          ({leadStats.unassigned} sem terapeuta)
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadAdminLeads(leadPage - 1, leadTypeFilter, leadStatusFilter, leadTherapistFilter)}
                        disabled={leadPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-600"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-1 text-gray-400">{leadPage} / {leadTotalPages}</span>
                      <Button
                        onClick={() => loadAdminLeads(leadPage + 1, leadTypeFilter, leadStatusFilter, leadTherapistFilter)}
                        disabled={leadPage === leadTotalPages}
                        variant="outline"
                        size="sm"
                        className="border-gray-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Top Therapists by Leads */}
            {leadStats?.byTherapist && leadStats.byTherapist.length > 0 && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Top Terapeutas por Leads
                </h3>
                <div className="space-y-3">
                  {leadStats.byTherapist.slice(0, 5).map((t: any, idx: number) => (
                    <div key={t.therapistId} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold">{idx + 1}</span>
                        <span className="text-white">{t.therapistName}</span>
                      </div>
                      <span className="text-purple-400 font-bold">{t.count} leads</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCog className="w-6 h-6 text-purple-500" />
                Administradores do Sistema
              </h2>
              <Button
                onClick={() => setShowCreateAdmin(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Admin
              </Button>
            </div>

            <Card className="bg-gray-800 border-gray-700 p-6">
              {loadingAdmins ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Nome</th>
                        <th className="pb-3">Cargo</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Criado em</th>
                        <th className="pb-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((adm) => (
                        <tr key={adm.id} className="border-b border-gray-700/50">
                          <td className="py-3 text-white">{adm.email}</td>
                          <td className="py-3 text-gray-400">{adm.name || '-'}</td>
                          <td className="py-3">
                            <Badge className={adm.role === 'SUPER_ADMIN' ? 'bg-purple-600' : 'bg-blue-600'}>
                              {adm.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={adm.active ? 'bg-green-600' : 'bg-gray-600'}>
                              {adm.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-400">
                            {new Date(adm.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3">
                            {adm.id !== 'super-admin' && adm.role !== 'SUPER_ADMIN' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleAdminActive(adm.id, adm.active)}
                                  className={`text-sm ${adm.active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                                >
                                  {adm.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                  onClick={() => deleteAdmin(adm.id)}
                                  disabled={deletingAdmin === adm.id}
                                  className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                                >
                                  {deletingAdmin === adm.id ? '...' : 'Excluir'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Protegido</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Info */}
            <Card className="bg-blue-900/30 border-blue-600 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-200 font-semibold">Sobre os Administradores</p>
                  <p className="text-blue-300/70 text-sm mt-1">
                    Administradores têm acesso total ao painel de controle. 
                    Apenas o Super Admin pode adicionar ou remover outros administradores.
                    O Super Admin principal não pode ser editado ou removido.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Adicionar Administrador</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="email@exemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O email deve corresponder a um usuário que pode fazer login no sistema
                  </p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nome</label>
                  <Input
                    type="text"
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nome do administrador"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Cargo</label>
                  <select
                    value={newAdminForm.role}
                    onChange={(e) => setNewAdminForm({...newAdminForm, role: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateAdmin(false)
                    setNewAdminForm({ email: '', name: '', role: 'ADMIN' })
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createAdmin}
                  disabled={creatingAdmin || !newAdminForm.email}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {creatingAdmin ? 'Adicionando...' : 'Adicionar Admin'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* User Details/Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {editUserMode === 'edit' ? 'Editar Usuário' : 'Detalhes do Usuário'}
                </h3>
                {editUserMode === 'view' && (
                  <button
                    onClick={() => setEditUserMode('edit')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {editUserMode === 'view' ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{editingUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nome:</span>
                    <span className="text-white">{editingUser.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Telefone:</span>
                    <span className="text-white">{editingUser.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Análises:</span>
                    <span className="text-white">{editingUser.analysesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Criado em:</span>
                    <span className="text-white">{new Date(editingUser.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Email</label>
                    <Input
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Nome</label>
                    <Input
                      type="text"
                      value={editUserForm.name}
                      onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Telefone</label>
                    <Input
                      type="text"
                      value={editUserForm.phone}
                      onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {editUserMode === 'edit' ? (
                  <>
                    <Button
                      onClick={() => setEditUserMode('view')}
                      className="flex-1 bg-gray-700 hover:bg-gray-600"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={updateUser}
                      disabled={savingUser}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {savingUser ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => deleteUser(editingUser.id)}
                      disabled={deletingUser === editingUser.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setEditingUser(null)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600"
                    >
                      Fechar
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Criar Novo Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nome</label>
                  <Input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Telefone</label>
                  <Input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowCreateUser(false)
                    setNewUserForm({ email: '', name: '', phone: '' })
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createUser}
                  disabled={creatingUser || !newUserForm.email}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {creatingUser ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Demos Tab */}
        {activeTab === 'demos' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Demonstrações Agendadas
              </h2>
              <Button
                onClick={() => loadDemos(1, demoStatusFilter)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Stats */}
            {demoStats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-2xl font-bold text-white">{demoStats.total}</p>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-400">{demoStats.pending}</p>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">Confirmadas</p>
                  <p className="text-2xl font-bold text-blue-400">{demoStats.confirmed}</p>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">Realizadas</p>
                  <p className="text-2xl font-bold text-green-400">{demoStats.completed}</p>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">Canceladas</p>
                  <p className="text-2xl font-bold text-red-400">{demoStats.cancelled}</p>
                </Card>
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <p className="text-gray-400 text-xs">No-show</p>
                  <p className="text-2xl font-bold text-gray-400">{demoStats.noShow}</p>
                </Card>
              </div>
            )}

            {/* Próximas demonstrações */}
            {upcomingDemos.length > 0 && (
              <Card className="bg-purple-900/30 border-purple-700 p-4">
                <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Próximos 7 dias ({upcomingDemos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {upcomingDemos.slice(0, 6).map((demo: any) => (
                    <div key={demo.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white text-sm">{demo.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          demo.status === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {demo.status === 'CONFIRMED' ? 'Confirmada' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-purple-400 text-sm font-semibold">
                        {new Date(demo.scheduledAt).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit' 
                        })} às {new Date(demo.scheduledAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-gray-400 text-xs">{demo.email}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Filtros */}
            <div className="flex gap-4 items-center">
              <select
                value={demoStatusFilter}
                onChange={(e) => {
                  setDemoStatusFilter(e.target.value)
                  loadDemos(1, e.target.value)
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Todos os status</option>
                <option value="PENDING">Pendentes</option>
                <option value="CONFIRMED">Confirmadas</option>
                <option value="COMPLETED">Realizadas</option>
                <option value="CANCELLED">Canceladas</option>
                <option value="NO_SHOW">No-show</option>
              </select>
            </div>

            {/* Lista */}
            {loadingDemos ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : demos.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <p className="text-gray-400">Nenhuma demonstração encontrada</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {demos.map((demo: any) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-yellow-600',
                    CONFIRMED: 'bg-blue-600',
                    COMPLETED: 'bg-green-600',
                    CANCELLED: 'bg-red-600',
                    NO_SHOW: 'bg-gray-600',
                  }
                  const statusLabels: Record<string, string> = {
                    PENDING: 'Pendente',
                    CONFIRMED: 'Confirmada',
                    COMPLETED: 'Realizada',
                    CANCELLED: 'Cancelada',
                    NO_SHOW: 'No-show',
                  }
                  
                  return (
                    <Card key={demo.id} className="bg-gray-800 border-gray-700 p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-white">{demo.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded text-white ${statusColors[demo.status]}`}>
                              {statusLabels[demo.status]}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Data:</span>{' '}
                              <span className="text-purple-400 font-medium">
                                {new Date(demo.scheduledAt).toLocaleDateString('pt-BR', { 
                                  weekday: 'short', 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  year: 'numeric'
                                })} às {new Date(demo.scheduledAt).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>{' '}
                              <a href={`mailto:${demo.email}`} className="text-blue-400 hover:underline">{demo.email}</a>
                            </div>
                            <div>
                              <span className="text-gray-500">Telefone:</span>{' '}
                              <a href={`https://wa.me/55${demo.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                                {demo.phone}
                              </a>
                            </div>
                            {demo.company && (
                              <div>
                                <span className="text-gray-500">Empresa:</span>{' '}
                                <span className="text-white">{demo.company}</span>
                              </div>
                            )}
                          </div>
                          {demo.notes && (
                            <div className="mt-2 text-sm text-gray-400 bg-gray-700 rounded p-2">
                              <span className="font-medium">Notas:</span> {demo.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {demo.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => updateDemoStatus(demo.id, 'CONFIRMED')}
                                disabled={updatingDemoId === demo.id}
                                className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                              >
                                Confirmar
                              </Button>
                              <Button
                                onClick={() => updateDemoStatus(demo.id, 'CANCELLED')}
                                disabled={updatingDemoId === demo.id}
                                className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          {demo.status === 'CONFIRMED' && (
                            <>
                              <Button
                                onClick={() => updateDemoStatus(demo.id, 'COMPLETED')}
                                disabled={updatingDemoId === demo.id}
                                className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                              >
                                Marcar Realizada
                              </Button>
                              <Button
                                onClick={() => updateDemoStatus(demo.id, 'NO_SHOW')}
                                disabled={updatingDemoId === demo.id}
                                className="bg-gray-600 hover:bg-gray-500 text-xs px-3 py-1"
                              >
                                No-show
                              </Button>
                              <Button
                                onClick={() => updateDemoStatus(demo.id, 'CANCELLED')}
                                disabled={updatingDemoId === demo.id}
                                className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Paginação */}
            {demoTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Mostrando {demos.length} de {demoTotal} demonstrações
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => loadDemos(demoPage - 1, demoStatusFilter)}
                    disabled={demoPage <= 1}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="bg-gray-800 px-4 py-2 rounded-lg text-white">
                    {demoPage} / {demoTotalPages}
                  </span>
                  <Button
                    onClick={() => loadDemos(demoPage + 1, demoStatusFilter)}
                    disabled={demoPage >= demoTotalPages}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <FormThemesManager />
        )}
      </div>
    </div>
  )
}
