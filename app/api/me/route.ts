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
          hasSeenOnboarding: false, // Garantir que novos usuários vejam o onboarding
          hasSeenPostFirstAnalysisOnboarding: false, // Garantir que novos usuários vejam o onboarding pós-primeira análise
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

    // Buscar terapeuta atribuído ao lead mais recente (se houver)
    const latestLead = await prisma.lead.findFirst({
      where: { userId: dbUser.id, therapistId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: {
        therapist: {
          select: { id: true, name: true, whatsapp: true, photoUrl: true }
        }
      }
    })

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

    // Modelo B2B: Leads não têm planos nem pagamentos
    // NOTA: hasSeenOnboarding pode ser undefined se a migration ainda não foi executada
    // Garantir que sempre retorne um boolean (false quando undefined)
    const hasSeenOnboarding = (dbUser as any).hasSeenOnboarding ?? false
    const hasSeenPostFirstAnalysisOnboarding = (dbUser as any).hasSeenPostFirstAnalysisOnboarding ?? false
    
    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      signo: dbUser.signo,
      instagram: dbUser.instagram,
      facebook: dbUser.facebook,
      hasSeenOnboarding: hasSeenOnboarding, // Sempre retorna boolean (false ou true)
      hasSeenPostFirstAnalysisOnboarding: hasSeenPostFirstAnalysisOnboarding, // Sempre retorna boolean (false ou true)
      stats: {
        totalAnalyses,
      },
      routeCorrection: {
        available: routeCorrectionAvailable,
        activeAnalysesCount: newAnalysesCount, // Análises novas (não usadas)
        totalAnalysesCount: totalAnalyses, // Total de análises
        isFirstTime,
        isFirstTimeAvailable,
        neededForNext,
      },
      therapist: latestLead?.therapist ? {
        id: latestLead.therapist.id,
        name: latestLead.therapist.name,
        whatsapp: latestLead.therapist.whatsapp,
        photoUrl: latestLead.therapist.photoUrl,
      } : null,
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
    const { name, phone, instagram, facebook, signo, hasSeenOnboarding, hasSeenPostFirstAnalysisOnboarding } = body

    // Verificar se é a primeira vez que o telefone está sendo adicionado
    const isFirstPhone = !dbUser.phone && phone

    // Atualizar usuário
    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (instagram !== undefined) updateData.instagram = instagram || null
    if (facebook !== undefined) updateData.facebook = facebook || null
    if (signo !== undefined) updateData.signo = signo || null
    if (hasSeenOnboarding !== undefined) updateData.hasSeenOnboarding = hasSeenOnboarding
    if (hasSeenPostFirstAnalysisOnboarding !== undefined) updateData.hasSeenPostFirstAnalysisOnboarding = hasSeenPostFirstAnalysisOnboarding

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

        console.log(`[API/ME] Lead SIGNUP gerado: ${leadResult.leadId}`)
        
        // Enviar email apenas se tiver terapeuta atribuído
        if (leadResult.therapistId) {
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
        } else {
          console.log('[API/ME] Lead criado sem terapeuta - aguardando atribuição manual')
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
        instagram: updatedUser.instagram,
        facebook: updatedUser.facebook,
        signo: updatedUser.signo,
      }
    })
  } catch (error) {
    console.error('Error in PATCH /api/me:', error)
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 })
  }
}
