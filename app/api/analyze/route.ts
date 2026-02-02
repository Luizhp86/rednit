import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyze, type AnalysisInput } from '@/lib/rules/engine'
import { analysisInputSchema, themeAnalysisInputSchema } from '@/lib/validations/analysis'
import { generateLead } from '@/lib/lead-rotation'
import { sendLeadAnalysisNotification } from '@/lib/email'
import { getSystemConfig } from '@/lib/config'
import { startOfDay } from 'date-fns'
import { generatePersonalizedAnalysis, type ThemeQuestion, type PersonalizedAnalysisInput } from '@/lib/ai/gemini'

// Simple in-memory rate limiting (for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  const limit = 100 // Limite por hora para todos os usuários

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

    // Rate limiting (igual para todos os usuários - modelo B2B sem pagamento para leads)
    if (!checkRateLimit(dbUser.id)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    // Verificar limite diário de análises (configurável no admin)
    const config = await getSystemConfig()
    const today = startOfDay(new Date())
    
    const analysesToday = await prisma.analysis.count({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: today
        }
      }
    })

    if (analysesToday >= config.leadMaxAnalysesPerDay) {
      return NextResponse.json(
        { 
          error: `Você atingiu o limite de ${config.leadMaxAnalysesPerDay} análises por dia. Volte amanhã!`,
          limit: config.leadMaxAnalysesPerDay,
          used: analysesToday
        },
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
    const themeId = cleanedBody.themeId || null
    const hasTheme = !!themeId
    
    // Se algum campo enum vier como array, pegar o primeiro valor
    const enumFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato', 
                        'tempo_resposta', 'encontro_marcado', 'remarcou_com_data', 'curiosidade_por_voce', 
                        'respeito_limites', 'disponivel_so_madrugada', 'fala_futuro']
    
    // Campos obrigatórios apenas para formulário padrão (sem tema)
    const requiredFieldsStandard = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
    // Para formulários temáticos, genero_match e objetivo_usuario são obrigatórios (perguntas fixas)
    const requiredFieldsTheme = ['genero_match', 'objetivo_usuario']
    
    const requiredFields = hasTheme ? requiredFieldsTheme : requiredFieldsStandard
    
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
    console.log('[ANALYZE] Usando schema:', hasTheme ? 'themeAnalysisInputSchema' : 'analysisInputSchema')
    
    // Usar schema apropriado baseado na presença de themeId
    const validatedInput = hasTheme 
      ? themeAnalysisInputSchema.parse(bodyWithDefaults)
      : analysisInputSchema.parse(bodyWithDefaults)

    // Buscar pesos das perguntas e informações do tema se themeId está presente
    let questionWeights: Record<string, number> = {}
    let themeQuestions: ThemeQuestion[] = []
    let fixedQuestions: ThemeQuestion[] = []
    let themeInfo: { name: string; displayName: string; description: string | null } | null = null
    
    if (themeId) {
      try {
        // Buscar tema
        const theme = await prisma.formTheme.findUnique({
          where: { id: themeId },
          select: { name: true, displayName: true, description: true }
        })
        if (theme) {
          themeInfo = theme
        }
        
        // Buscar perguntas do tema com opções
        const questions = await prisma.formQuestion.findMany({
          where: {
            OR: [
              { themeId: themeId },
              { isFixed: true }
            ]
          },
          include: {
            options: {
              select: { value: true, label: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        })
        
        // Separar perguntas fixas e do tema
        for (const q of questions) {
          const questionData: ThemeQuestion = {
            key: q.key,
            label: q.label,
            type: q.type,
            weight: q.weight,
            isFixed: q.isFixed,
            options: q.options.map(o => ({ value: o.value, label: o.label }))
          }
          
          if (q.isFixed) {
            fixedQuestions.push(questionData)
          } else {
            themeQuestions.push(questionData)
          }
          
          questionWeights[q.key] = q.weight
        }
        
        console.log('[ANALYZE] Tema:', themeInfo?.displayName)
        console.log('[ANALYZE] Perguntas do tema:', themeQuestions.length)
        console.log('[ANALYZE] Perguntas fixas:', fixedQuestions.length)
        console.log('[ANALYZE] Pesos carregados:', questionWeights)
      } catch (error) {
        console.error('[ANALYZE] Erro ao buscar dados do tema:', error)
        // Continuar sem dados do tema se houver erro
      }
    }

    // Run rule-based analysis primeiro (como base)
    const ruleBasedResult = analyze(validatedInput as AnalysisInput, questionWeights)
    
    // Nome do match: usar "match" se não informado
    const matchName = validatedInput.nome_match?.trim() || 'match'
    
    // SEMPRE gerar análise personalizada com IA
    let result = ruleBasedResult
    console.log('========================================')
    console.log('[ANALYZE] ===== INICIANDO CHAMADA IA =====')
    console.log('[ANALYZE] matchName:', matchName)
    console.log('[ANALYZE] userName:', dbUser.name)
    console.log('[ANALYZE] themeInfo:', themeInfo)
    console.log('[ANALYZE] userObjective:', validatedInput.objetivo_usuario)
    console.log('========================================')
    
    try {
      const personalizedInput: PersonalizedAnalysisInput = {
        formData: validatedInput as Record<string, any>,
        userName: dbUser.name,
        matchName: matchName,
        matchGender: validatedInput.genero_match,
        userObjective: validatedInput.objetivo_usuario || 'CONHECER',
        themeName: themeInfo?.name || 'geral',
        themeDisplayName: themeInfo?.displayName || 'Análise Geral',
        themeDescription: themeInfo?.description || 'Análise de relacionamento',
        questions: themeQuestions,
        fixedQuestions: fixedQuestions,
        ruleBasedResult: ruleBasedResult,
      }
      
      console.log('[ANALYZE] Chamando generatePersonalizedAnalysis...')
      result = await generatePersonalizedAnalysis(personalizedInput, dbUser.id)
      console.log('[ANALYZE] ===== IA RETORNOU COM SUCESSO =====')
      console.log('[ANALYZE] Headline gerada:', result.free_teaser?.headline)
      console.log('[ANALYZE] Executive summary:', result.premium_report?.executive_summary?.slice(0, 2))
      console.log('========================================')
    } catch (error: any) {
      console.error('========================================')
      console.error('[ANALYZE] ===== ERRO NA CHAMADA IA =====')
      console.error('[ANALYZE] Erro:', error.message)
      console.error('[ANALYZE] Stack:', error.stack)
      console.error('========================================')
      // Fallback: usar análise baseada em regras (já tem o nome do match)
      result = {
        ...ruleBasedResult,
        meta: { ...ruleBasedResult.meta, nome_match: matchName },
        nome_match: matchName,
        free_teaser: { ...ruleBasedResult.free_teaser, nome_match: matchName },
        premium_report: { ...ruleBasedResult.premium_report, nome_match: matchName },
      } as typeof ruleBasedResult & { nome_match: string }
    }

    // Save analysis
    // Usar stage do input ou default 'TALKING' para formulários temáticos
    const analysisStage = validatedInput.estagio || 'TALKING'
    
    // #region agent log
    console.log('[ANALYZE] PRE_CREATE userId:', dbUser.id, 'stage:', analysisStage)
    // #endregion
    
    const analysis = await prisma.analysis.create({
      data: {
        userId: dbUser.id,
        stage: analysisStage as any,
        inputJson: validatedInput as any,
        resultJson: result as any,
        isPaid: false,
        themeId: themeId,
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
