import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSystemConfig } from '@/lib/config'
import { generateLead } from '@/lib/lead-rotation'
import { sendLeadSignupNotification } from '@/lib/email'

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
      phone: dbUser.phone,
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

// Atualizar perfil do usuário (nome, telefone)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { name, phone } = body

    // Verificar se é a primeira vez que o telefone está sendo adicionado
    const isFirstPhone = !dbUser.phone && phone

    // Atualizar usuário
    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
    })

    // Se é a primeira vez adicionando telefone, gerar lead SIGNUP
    if (isFirstPhone) {
      try {
        const leadResult = await generateLead({
          type: 'SIGNUP',
          userId: dbUser.id,
          userName: updatedUser.name || undefined,
          userEmail: updatedUser.email,
          userPhone: phone,
        })

        if (leadResult) {
          // Buscar terapeuta para enviar email
          const therapist = await prisma.therapist.findUnique({
            where: { id: leadResult.therapistId },
            select: { email: true, name: true }
          })

          if (therapist) {
            await sendLeadSignupNotification({
              therapist: { email: therapist.email, name: therapist.name },
              lead: {
                userName: updatedUser.name,
                userEmail: updatedUser.email,
                userPhone: phone,
              }
            })
          }
        }
      } catch (leadError) {
        console.error('Erro ao gerar lead SIGNUP:', leadError)
        // Não falhar a requisição se o lead falhar
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
      }
    })
  } catch (error) {
    console.error('Error in PATCH /api/me:', error)
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 })
  }
}
