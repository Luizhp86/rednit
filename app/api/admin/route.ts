import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { invalidateConfigCache } from '@/lib/config'

// Email autorizado para acessar o painel admin
const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return user
}

// Configurações padrão (caso tabela não exista)
const DEFAULT_CONFIG = {
  id: 'default',
  minAnalysesFirstTime: 3,
  minNewAnalysesForUnlock: 4,
  freeCreditsDaily: 10,
  geminiDailyLimit: 100,
  geminiMonthlyBudgetCents: 50000,
  proPriceMonthly: 2990,
  proPriceYearly: 29900,
  maintenanceMode: false,
  allowNewRegistrations: true,
  geminiCallsToday: 0,
  geminiLastResetDate: null,
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

    // Estatísticas de usuários
    const totalUsers = await prisma.user.count()
    const proUsers = await prisma.user.count({ where: { plan: 'PRO' } })
    const freeUsers = totalUsers - proUsers

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

    // Estatísticas de pagamentos
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amountCents: true }
    })
    const revenueThisMonth = await prisma.payment.aggregate({
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amountCents: true }
    })

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
        plan: true,
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
          pro: proUsers,
          free: freeUsers
        },
        analyses: {
          total: totalAnalyses,
          today: analysesToday,
          thisMonth: analysesThisMonth
        },
        revenue: {
          total: totalRevenue._sum.amountCents || 0,
          thisMonth: revenueThisMonth._sum.amountCents || 0
        },
        gemini: geminiStats
      },
      topUsers: topUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        plan: u.plan,
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
      'proPriceMonthly',
      'proPriceYearly',
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

    const config = await prisma.systemConfig.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData }
    })

    // Invalidar cache das configurações
    invalidateConfigCache()

    console.log(`[ADMIN] Configurações atualizadas por ${admin.email}:`, updateData)

    return NextResponse.json({ config })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin:', error)
    return NextResponse.json({ error: 'Erro ao atualizar configurações', details: error.message }, { status: 500 })
  }
}
