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
  // Preços de assinaturas
  proPriceMonthly: 2990,
  proPriceQuarterly: 7990,
  proPriceYearly: 29900,
  // Preços de pacotes de créditos
  creditPriceSingle: 799,
  creditPricePack3: 2490,
  creditPricePack5: 3990,
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
      
      // #region agent log
      const fs = await import('fs')
      const logPath = 'c:\\Users\\luizh\\radar-match\\.cursor\\debug.log'
      const logEntryGet = JSON.stringify({location:'api/admin/route.ts:GET:dbConfig',message:'Config lido do banco no GET',data:{dbConfigExists:!!dbConfig,proPriceMonthly:dbConfig?.proPriceMonthly,proPriceQuarterly:dbConfig?.proPriceQuarterly,proPriceYearly:dbConfig?.proPriceYearly,creditPriceSingle:dbConfig?.creditPriceSingle,creditPricePack3:dbConfig?.creditPricePack3,creditPricePack5:dbConfig?.creditPricePack5},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})
      fs.appendFileSync(logPath, logEntryGet + '\n')
      // #endregion

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
    
    // #region agent log
    const fs = await import('fs')
    const logPath = 'c:\\Users\\luizh\\radar-match\\.cursor\\debug.log'
    const logEntry1 = JSON.stringify({location:'api/admin/route.ts:PATCH:bodyReceived',message:'Body recebido no PATCH',data:{proPriceMonthly:body.proPriceMonthly,proPriceQuarterly:body.proPriceQuarterly,proPriceYearly:body.proPriceYearly,creditPriceSingle:body.creditPriceSingle,creditPricePack3:body.creditPricePack3,creditPricePack5:body.creditPricePack5},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})
    fs.appendFileSync(logPath, logEntry1 + '\n')
    // #endregion

    // Campos permitidos para atualização
    const allowedFields = [
      'minAnalysesFirstTime',
      'minNewAnalysesForUnlock',
      'freeCreditsDaily',
      'geminiDailyLimit',
      'geminiMonthlyBudgetCents',
      // Preços de assinaturas
      'proPriceMonthly',
      'proPriceQuarterly',
      'proPriceYearly',
      // Preços de pacotes de créditos
      'creditPriceSingle',
      'creditPricePack3',
      'creditPricePack5',
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
    
    // #region agent log
    const logEntry2 = JSON.stringify({location:'api/admin/route.ts:PATCH:updateData',message:'updateData filtrado',data:{updateData,priceFields:{proPriceMonthly:updateData.proPriceMonthly,proPriceQuarterly:updateData.proPriceQuarterly,proPriceYearly:updateData.proPriceYearly,creditPriceSingle:updateData.creditPriceSingle}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})
    fs.appendFileSync(logPath, logEntry2 + '\n')
    // #endregion

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
    
    // #region agent log
    const logEntry3 = JSON.stringify({location:'api/admin/route.ts:PATCH:afterUpsert',message:'Config após upsert',data:{configFromDb:{id:config.id,proPriceMonthly:config.proPriceMonthly,proPriceQuarterly:config.proPriceQuarterly,proPriceYearly:config.proPriceYearly,creditPriceSingle:config.creditPriceSingle,creditPricePack3:config.creditPricePack3,creditPricePack5:config.creditPricePack5}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})
    fs.appendFileSync(logPath, logEntry3 + '\n')
    // #endregion

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
        proPriceMonthly: config.proPriceMonthly,
        proPriceQuarterly: config.proPriceQuarterly,
        proPriceYearly: config.proPriceYearly,
        creditPriceSingle: config.creditPriceSingle,
        creditPricePack3: config.creditPricePack3,
        creditPricePack5: config.creditPricePack5,
      }
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin:', error)
    return NextResponse.json({ error: 'Erro ao atualizar configurações', details: error.message }, { status: 500 })
  }
}
