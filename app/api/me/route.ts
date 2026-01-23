import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSystemConfig } from '@/lib/config'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        entitlements: true,
        _count: {
          select: {
            analyses: true,
            payments: true,
          },
        },
      },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!,
        },
        include: {
          entitlements: true,
          _count: {
            select: {
              analyses: true,
              payments: true,
            },
          },
        },
      })
    }

    const totalAnalyses = dbUser._count.analyses

    // Buscar configurações do sistema
    const config = await getSystemConfig()

    // Contar análises NOVAS (não usadas em análise de comportamento anterior)
    const newAnalysesCount = await prisma.analysis.count({
      where: {
        userId: dbUser.id,
        usedInRouteCorrection: false,
      },
    })

    // Verificar se já fez alguma análise de comportamento antes
    const hasUsedAnalyses = totalAnalyses > newAnalysesCount
    const isFirstTime = !hasUsedAnalyses

    // Lógica de desbloqueio (usando configurações do sistema):
    // - Primeira vez: precisa de X análises total
    // - Depois: precisa de Y análises NOVAS (não usadas)
    let routeCorrectionAvailable: boolean
    let neededForNext: number

    if (isFirstTime) {
      // Primeira vez: precisa de minAnalysesFirstTime análises
      routeCorrectionAvailable = totalAnalyses >= config.minAnalysesFirstTime
      neededForNext = routeCorrectionAvailable ? 0 : config.minAnalysesFirstTime - totalAnalyses
    } else {
      // Já fez antes: precisa de minNewAnalysesForUnlock novas
      routeCorrectionAvailable = newAnalysesCount >= config.minNewAnalysesForUnlock
      neededForNext = routeCorrectionAvailable ? 0 : config.minNewAnalysesForUnlock - newAnalysesCount
    }

    // Check if this is the first time becoming available
    const isFirstTimeAvailable = isFirstTime && totalAnalyses === config.minAnalysesFirstTime

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      plan: dbUser.plan,
      creditsFreeDaily: dbUser.creditsFreeDaily,
      creditsPaid: dbUser.creditsPaid,
      proUntil: dbUser.proUntil,
      stats: {
        totalAnalyses,
        totalPayments: dbUser._count.payments,
      },
      routeCorrection: {
        available: routeCorrectionAvailable,
        activeAnalysesCount: newAnalysesCount, // Análises novas (não usadas)
        totalAnalysesCount: totalAnalyses, // Total de análises
        isFirstTime,
        isFirstTimeAvailable,
        neededForNext,
      },
      prices: {
        subscription: {
          monthly: config.proPriceMonthly,
          quarterly: config.proPriceQuarterly,
          yearly: config.proPriceYearly,
        },
        credits: {
          single: config.creditPriceSingle,
          pack3: config.creditPricePack3,
          pack5: config.creditPricePack5,
        },
      },
    })
  } catch (error) {
    console.error('Error in /api/me:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
