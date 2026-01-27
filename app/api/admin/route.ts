import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { invalidateConfigCache } from '@/lib/config'

// Email principal do super admin (fallback)
const SUPER_ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Verificar se é admin no banco
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: user.email!, active: true }
    })
    if (admin) return user
  } catch (e) {
    // Tabela admin pode não existir ainda
  }

  // Fallback: email hardcoded
  if (user.email === SUPER_ADMIN_EMAIL) {
    return user
  }

  return null
}

// Configurações padrão (caso tabela não exista)
const DEFAULT_CONFIG = {
  id: 'default',
  minAnalysesFirstTime: 3,
  minNewAnalysesForUnlock: 4,
  freeCreditsDaily: 10,
  geminiDailyLimit: 100,
  geminiMonthlyBudgetCents: 50000,
  // B2B - Preços de terapeutas
  therapistPriceBasic: 7900,
  therapistPriceIntermediate: 14900,
  therapistPricePro: 24900,
  therapistLeadsPerDay: 10,
  // Feature flags B2B
  enableLeadSignup: true,
  enableLeadAnalysis: true,
  enableLeadCta: true,
  // Regras de geração de leads (configuráveis)
  leadSignupPlans: '["BASIC","INTERMEDIATE","PRO"]',
  leadAnalysisPlans: '["INTERMEDIATE","PRO"]',
  leadCtaPlans: '["PRO"]',
  leadCooldownHours: 24,
  leadMaxSignupPerDay: 20,
  leadMaxAnalysisPerDay: 10,
  leadMaxCtaPerDay: 5,
  // Feature flags gerais
  maintenanceMode: false,
  allowNewRegistrations: true,
  geminiCallsToday: 0,
  geminiLastResetDate: null,
  // Modelos Gemini configuráveis
  geminiModelAnalysis: 'gemini-1.5-flash',
  geminiModelRouteCorrection: 'gemini-2.0-flash',
  createdAt: new Date(),
  updatedAt: new Date()
}

// GET - Obter configurações e estatísticas
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar ou criar configurações (com fallback se tabela não existe)
    let config: any = DEFAULT_CONFIG
    try {
      const dbConfig = await prisma.systemConfig.findUnique({
        where: { id: 'default' }
      })
      if (dbConfig) {
        config = dbConfig
      } else {
        // Tentar criar se não existe
        try {
          config = await prisma.systemConfig.create({
            data: { id: 'default' }
          })
        } catch (createError) {
          console.log('[ADMIN] Não foi possível criar config, usando padrão')
        }
      }
    } catch (configError) {
      console.log('[ADMIN] Tabela SystemConfig não existe, usando padrão')
    }

    // Estatísticas de usuários (leads potenciais)
    const totalUsers = await prisma.user.count()
    const usersWithPhone = await prisma.user.count({ where: { phone: { not: null } } })

    // Estatísticas de análises
    const totalAnalyses = await prisma.analysis.count()
    const analysesToday = await prisma.analysis.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
    const analysesThisMonth = await prisma.analysis.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Estatísticas de terapeutas (B2B)
    let therapistStats = { total: 0, approved: 0, pending: 0 }
    try {
      const totalTherapists = await prisma.therapist.count()
      const approvedTherapists = await prisma.therapist.count({ where: { status: 'APPROVED' } })
      const pendingTherapists = await prisma.therapist.count({ where: { status: 'PENDING' } })
      therapistStats = { total: totalTherapists, approved: approvedTherapists, pending: pendingTherapists }
    } catch (e) {
      // Tabela ainda não existe
    }

    // Estatísticas de leads (B2B)
    let leadStats = { total: 0, today: 0, thisMonth: 0, converted: 0 }
    try {
      const totalLeads = await prisma.lead.count()
      const leadsToday = await prisma.lead.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      })
      const leadsThisMonth = await prisma.lead.count({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
      })
      const convertedLeads = await prisma.lead.count({ where: { status: 'CONVERTED' } })
      leadStats = { total: totalLeads, today: leadsToday, thisMonth: leadsThisMonth, converted: convertedLeads }
    } catch (e) {
      // Tabela ainda não existe
    }

    // Uso do Gemini (se a tabela existir)
    let geminiStats = {
      callsToday: 0,
      callsThisMonth: 0,
      estimatedCostThisMonth: 0
    }

    try {
      const geminiToday = await prisma.geminiUsageLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
      const geminiMonth = await prisma.geminiUsageLog.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _count: true,
        _sum: { estimatedCost: true }
      })

      geminiStats = {
        callsToday: geminiToday,
        callsThisMonth: geminiMonth._count,
        estimatedCostThisMonth: geminiMonth._sum.estimatedCost || 0
      }
    } catch (e) {
      // Tabela ainda não existe
    }

    // Top usuários por análises
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        _count: {
          select: { analyses: true }
        }
      },
      orderBy: {
        analyses: {
          _count: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      config,
      stats: {
        users: {
          total: totalUsers,
          withPhone: usersWithPhone
        },
        analyses: {
          total: totalAnalyses,
          today: analysesToday,
          thisMonth: analysesThisMonth
        },
        therapists: therapistStats,
        leads: leadStats,
        gemini: geminiStats
      },
      topUsers: topUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        analysesCount: u._count.analyses
      }))
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados', details: error.message }, { status: 500 })
  }
}

// PATCH - Atualizar configurações
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()

    // Campos permitidos para atualização
    const allowedFields = [
      'minAnalysesFirstTime',
      'minNewAnalysesForUnlock',
      'freeCreditsDaily',
      'geminiDailyLimit',
      'geminiMonthlyBudgetCents',
      'geminiModelAnalysis',
      'geminiModelRouteCorrection',
      // B2B - Preços de terapeutas
      'therapistPriceBasic',
      'therapistPriceIntermediate',
      'therapistPricePro',
      'therapistLeadsPerDay',
      // Feature flags B2B
      'enableLeadSignup',
      'enableLeadAnalysis',
      'enableLeadCta',
      // Regras de geração de leads
      'leadSignupPlans',
      'leadAnalysisPlans',
      'leadCtaPlans',
      'leadCooldownHours',
      'leadMaxSignupPerDay',
      'leadMaxAnalysisPerDay',
      'leadMaxCtaPerDay',
      // Feature flags gerais
      'maintenanceMode',
      'allowNewRegistrations'
    ]

    // Filtrar apenas campos permitidos
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    console.log(`[ADMIN] Tentando salvar configurações:`, updateData)
    
    // Buscar config antiga para audit log
    const oldConfig = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })
    
    const config = await prisma.systemConfig.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData }
    })

    // Registrar alteração no log de auditoria
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'CONFIG_UPDATE',
        entity: 'SystemConfig',
        entityId: 'default',
        oldValue: oldConfig || {},
        newValue: updateData,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    // Invalidar cache das configurações
    invalidateConfigCache()

    console.log(`[ADMIN] Configurações salvas por ${admin.email}:`, config)

    // Retornar config com todos os campos explícitos
    return NextResponse.json({ 
      config: {
        ...config,
        therapistPriceBasic: config.therapistPriceBasic,
        therapistPriceIntermediate: config.therapistPriceIntermediate,
        therapistPricePro: config.therapistPricePro,
        therapistLeadsPerDay: config.therapistLeadsPerDay,
        enableLeadSignup: config.enableLeadSignup,
        enableLeadCta: config.enableLeadCta,
      }
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin:', error)
    return NextResponse.json({ error: 'Erro ao atualizar configurações', details: error.message }, { status: 500 })
  }
}
