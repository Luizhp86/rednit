import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyze, type AnalysisInput } from '@/lib/rules/engine'
import { analysisInputSchema } from '@/lib/validations/analysis'
import { analyzeWithGemini } from '@/lib/ai/gemini'
import { startOfDay } from 'date-fns'

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
          creditsFreeDaily: 1,
          lastDailyReset: today,
        },
      })
      dbUser.creditsFreeDaily = 1
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
    const enumFields = ['objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato', 
                        'tempo_resposta', 'encontro_marcado', 'remarcou_com_data', 'curiosidade_por_voce', 
                        'respeito_limites', 'disponivel_so_madrugada', 'fala_futuro']
    
    const requiredFields = ['objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
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

    // Run rule-based analysis first (always)
    const ruleBasedResult = analyze(validatedInput as AnalysisInput)

    // Enhance with Gemini AI for all users (both FREE and PRO)
    let result = ruleBasedResult
    console.log(`[ANALYZE] Melhorando análise com Gemini para usuário ${dbUser.plan}...`)
    try {
      result = await analyzeWithGemini(validatedInput as AnalysisInput, ruleBasedResult)
      console.log('[ANALYZE] Análise melhorada com Gemini com sucesso')
    } catch (error: any) {
      console.error('[ANALYZE] Erro ao usar Gemini, usando análise baseada em regras:', error.message)
      // Fallback to rule-based
      result = ruleBasedResult
    }

    // Save analysis
    const analysis = await prisma.analysis.create({
      data: {
        userId: dbUser.id,
        stage: validatedInput.estagio as any,
        inputJson: validatedInput as any,
        resultJson: result as any,
        isPaid: false,
      },
    })

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

    // Return free teaser + analysis ID
    return NextResponse.json({
      id: analysis.id,
      free_teaser: result.free_teaser,
      premium_available: !result.premium, // Will be true, but locked behind paywall
    })
  } catch (error: any) {
    console.error('Error in /api/analyze:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}
