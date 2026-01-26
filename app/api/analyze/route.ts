import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyze, type AnalysisInput } from '@/lib/rules/engine'
import { analysisInputSchema } from '@/lib/validations/analysis'
import { startOfDay } from 'date-fns'
import { generateLead } from '@/lib/lead-rotation'
import { sendLeadAnalysisNotification } from '@/lib/email'

// Simple in-memory rate limiting (for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, limit: number): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 }) // 1 hour
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get or create user in our DB
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!,
        },
      })
    }

    // Check daily reset for free users
    const today = startOfDay(new Date())
    if (
      dbUser.plan === 'FREE' &&
      (!dbUser.lastDailyReset || dbUser.lastDailyReset < today)
    ) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          creditsFreeDaily: 10, // 10 análises gratuitas por dia
          lastDailyReset: today,
        },
      })
      dbUser.creditsFreeDaily = 10
    }

    // Check credits
    if (dbUser.plan === 'FREE') {
      if (dbUser.creditsFreeDaily <= 0) {
        return NextResponse.json(
          { error: 'Limite diário de análises gratuitas atingido' },
          { status: 403 }
        )
      }
    }

    // Rate limiting
    const rateLimit = dbUser.plan === 'PRO' ? 100 : 5
    if (!checkRateLimit(dbUser.id, rateLimit)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    // Parse and validate input
    const body = await request.json()
    
    // Log para debug
    console.log('[ANALYZE] Body recebido:', JSON.stringify(body, null, 2))
    console.log('[ANALYZE] Tipo de iniciativa:', typeof body.iniciativa, Array.isArray(body.iniciativa) ? 'É ARRAY!' : 'Não é array')
    
    // Garantir que campos enum não sejam arrays
    const cleanedBody: any = { ...body }
    
    // Se algum campo enum vier como array, pegar o primeiro valor
    const enumFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato', 
                        'tempo_resposta', 'encontro_marcado', 'remarcou_com_data', 'curiosidade_por_voce', 
                        'respeito_limites', 'disponivel_so_madrugada', 'fala_futuro']
    
    const requiredFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
    const optionalEnumFields = ['tempo_resposta', 'encontro_marcado', 'remarcou_com_data', 'curiosidade_por_voce', 
                                 'respeito_limites', 'disponivel_so_madrugada', 'fala_futuro']
    
    enumFields.forEach(field => {
      if (cleanedBody[field] && Array.isArray(cleanedBody[field])) {
        console.warn(`[ANALYZE] Campo ${field} veio como array, convertendo para string:`, cleanedBody[field])
        cleanedBody[field] = cleanedBody[field][0] || cleanedBody[field]
      }
      // Garantir que é string
      if (cleanedBody[field] !== undefined && cleanedBody[field] !== null) {
        cleanedBody[field] = String(cleanedBody[field])
      }
    })
    
    // Validar campos obrigatórios antes de processar
    for (const field of requiredFields) {
      if (!cleanedBody[field] || cleanedBody[field] === '') {
        console.error(`[ANALYZE] Campo obrigatório ${field} está vazio ou ausente`)
        return NextResponse.json(
          { 
            error: 'Dados inválidos', 
            details: `Campo obrigatório "${field}" não foi preenchido` 
          },
          { status: 400 }
        )
      }
    }
    
    // Garantir valores padrão para campos opcionais
    const bodyWithDefaults: any = {
      ...cleanedBody,
      cancelou_encontro: cleanedBody.cancelou_encontro,
      sinais_alerta: Array.isArray(cleanedBody.sinais_alerta) ? cleanedBody.sinais_alerta : [],
      inegociaveis: Array.isArray(cleanedBody.inegociaveis) ? cleanedBody.inegociaveis : [],
    }
    
    // Remover campos vazios de enum opcionais antes de validar
    optionalEnumFields.forEach(field => {
      if (bodyWithDefaults[field] === '' || bodyWithDefaults[field] === null || bodyWithDefaults[field] === undefined) {
        delete bodyWithDefaults[field]
      }
    })
    
    console.log('[ANALYZE] Body limpo:', JSON.stringify(bodyWithDefaults, null, 2))
    
    const validatedInput = analysisInputSchema.parse(bodyWithDefaults)

    // Run rule-based analysis (sem IA para análises individuais)
    const result = analyze(validatedInput as AnalysisInput)

    // Save analysis
    // #region agent log
    console.log('[ANALYZE] PRE_CREATE userId:', dbUser.id, 'stage:', validatedInput.estagio)
    // #endregion
    
    const analysis = await prisma.analysis.create({
      data: {
        userId: dbUser.id,
        stage: validatedInput.estagio as any,
        inputJson: validatedInput as any,
        resultJson: result as any,
        isPaid: false,
      },
    })

    // #region agent log
    console.log('[ANALYZE] POST_CREATE analysisId:', analysis.id, 'hasId:', !!analysis.id, 'type:', typeof analysis.id)
    // #endregion

    // Gerar lead ANALYSIS se usuário tem telefone e feature está habilitada
    if (dbUser.phone) {
      try {
        // Verificar se geração de lead na análise está habilitada
        const config = await prisma.systemConfig.findUnique({
          where: { id: 'default' },
          select: { enableLeadAnalysis: true }
        })
        
        if (config?.enableLeadAnalysis === false) {
          console.log('[ANALYZE] Lead ANALYSIS desabilitado nas configurações')
        } else {
          // Extrair dados resumidos da análise para o lead
          const analysisData = {
            matchName: validatedInput.nome_match,
            redFlags: result.red_flags || [],
            greenFlags: result.green_flags || [],
            scores: result.scores || {},
            hypothesis: result.hypotheses_top3?.[0]?.key,
          }

          const leadResult = await generateLead({
            type: 'ANALYSIS',
            userId: dbUser.id,
            userName: dbUser.name || undefined,
            userEmail: dbUser.email,
            userPhone: dbUser.phone,
            analysisId: analysis.id,
            matchName: validatedInput.nome_match,
            analysisData,
          })

          // Verificar se o lead foi ignorado pela regra de cooldown
          if (leadResult.skipped) {
            console.log('[ANALYZE] Lead ANALYSIS ignorado (regra cooldown)')
          } else {
            console.log('[ANALYZE] Lead ANALYSIS gerado:', leadResult.leadId)
          }
          
          // Enviar email apenas se lead foi criado e tiver terapeuta atribuído
          if (!leadResult.skipped && leadResult.therapistId) {
            const therapist = await prisma.therapist.findUnique({
              where: { id: leadResult.therapistId },
              select: { email: true, name: true, plan: true }
            })

            if (therapist) {
              await sendLeadAnalysisNotification({
                therapist: { email: therapist.email, name: therapist.name, plan: therapist.plan },
                lead: {
                  userName: dbUser.name,
                  userEmail: dbUser.email,
                  userPhone: dbUser.phone,
                  matchName: validatedInput.nome_match,
                  analysisData,
                }
              }).catch(err => console.error('[ANALYZE] Erro ao enviar email de lead:', err))

              // Marcar email como enviado
              await prisma.lead.update({
                where: { id: leadResult.leadId },
                data: { emailSentAt: new Date() }
              }).catch(err => console.error('[ANALYZE] Erro ao atualizar lead:', err))
            }
          } else if (!leadResult.skipped) {
            console.log('[ANALYZE] Lead criado sem terapeuta - aguardando atribuição manual')
          }
        }
      } catch (leadError) {
        console.error('[ANALYZE] Erro ao gerar lead ANALYSIS:', leadError)
        // Não falhar a requisição se o lead falhar
      }
    }

    // Deduct credit for free users
    if (dbUser.plan === 'FREE') {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          creditsFreeDaily: {
            decrement: 1,
          },
        },
      })
    }

    // #region agent log
    console.log('[ANALYZE] RESPONSE_PREPARE id:', analysis.id)
    // #endregion

    // Return free teaser + analysis ID
    const responseData = {
      id: analysis.id,
      free_teaser: result.free_teaser,
      premium_available: true, // Premium report exists but locked behind paywall
    }
    
    // #region agent log
    console.log('[ANALYZE] RESPONSE_SEND', JSON.stringify(responseData))
    // #endregion
    
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Error in /api/analyze:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}
