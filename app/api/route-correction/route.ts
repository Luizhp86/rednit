import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyzeRouteCorrection, prepareAnalysisDataForAI, type AnalysisDataPoint } from '@/lib/ai/gemini'
import { getSystemConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get user from DB
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Check if user has PRO plan - Route Correction is PRO only
    if (dbUser.plan !== 'PRO') {
      return NextResponse.json(
        { error: 'A Análise de Comportamento é um recurso exclusivo do Plano PRO' },
        { status: 403 }
      )
    }

    // Buscar TODAS as análises do usuário (para análise com pesos)
    const allAnalyses = await prisma.analysis.findMany({
      where: { 
        userId: dbUser.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inputJson: true,
        resultJson: true,
        createdAt: true,
        usedInRouteCorrection: true,
      },
    })

    const totalCount = allAnalyses.length
    const newAnalysesCount = allAnalyses.filter(a => !a.usedInRouteCorrection).length
    const isFirstTime = newAnalysesCount === totalCount // Nunca fez análise de comportamento

    // Buscar configurações do sistema
    const config = await getSystemConfig()

    // Verificar se pode gerar (usando configurações do sistema)
    if (isFirstTime) {
      // Primeira vez: precisa de X análises
      if (totalCount < config.minAnalysesFirstTime) {
        const needed = config.minAnalysesFirstTime - totalCount
        return NextResponse.json(
          { 
            error: `Você precisa de mais ${needed} análise${needed > 1 ? 's' : ''} para gerar sua primeira Análise de Comportamento`,
            totalCount,
            neededForNext: needed,
          },
          { status: 400 }
        )
      }
    } else {
      // Já fez antes: precisa de Y análises NOVAS
      if (newAnalysesCount < config.minNewAnalysesForUnlock) {
        const needed = config.minNewAnalysesForUnlock - newAnalysesCount
        return NextResponse.json(
          { 
            error: `Você precisa de mais ${needed} análise${needed > 1 ? 's' : ''} nova${needed > 1 ? 's' : ''} para gerar uma nova Análise de Comportamento`,
            totalCount,
            newAnalysesCount,
            neededForNext: needed,
          },
          { status: 400 }
        )
      }
    }

    // Get user's objective from the most recent analysis (or default)
    const mostRecentAnalysis = allAnalyses[0]
    const inputJson = mostRecentAnalysis?.inputJson as any
    const userObjective = inputJson?.objetivo_usuario || 'CONHECER'

    // Converter análises para formato esperado
    const analysisDataPoints: AnalysisDataPoint[] = allAnalyses.map(analysis => {
      const input = analysis.inputJson as any
      const result = analysis.resultJson as any
      const scores = result?.scores || {}
      
      return {
        inputJson: {
          objetivo_usuario: input?.objetivo_usuario,
          estagio: input?.estagio,
          iniciativa: input?.iniciativa,
          frequencia_contato: input?.frequencia_contato,
          tempo_resposta: input?.tempo_resposta,
          encontro_marcado: input?.encontro_marcado,
          cancelou_encontro: input?.cancelou_encontro,
          remarcou_com_data: input?.remarcou_com_data,
          curiosidade_por_voce: input?.curiosidade_por_voce,
          respeito_limites: input?.respeito_limites,
          disponivel_so_madrugada: input?.disponivel_so_madrugada,
          fala_futuro: input?.fala_futuro,
          sinais_alerta: input?.sinais_alerta || [],
        },
        scores: {
          reciprocidade: scores.reciprocidade,
          constancia: scores.constancia,
          acao_mundo_real: scores.acao_mundo_real,
          risco_ghosting: scores.risco_ghosting,
          risco_enrolacao: scores.risco_enrolacao,
          compat_objetivo: scores.compat_objetivo,
          respeito: scores.respeito,
        },
        createdAt: analysis.createdAt.toISOString(),
      }
    })

    // Preparar dados otimizados (agrega se houver muitas análises)
    const routeCorrectionInput = prepareAnalysisDataForAI(analysisDataPoints)
    
    console.log(`[ROUTE-CORRECTION] Analisando ${totalCount} análises do usuário (${newAnalysesCount} novas)`)
    if (routeCorrectionInput.aggregatedData) {
      console.log(`[ROUTE-CORRECTION] Modo agregado ativado para economizar tokens`)
    }

    // Analyze with Gemini (passando userId para log de uso)
    const correction = await analyzeRouteCorrection(routeCorrectionInput, dbUser.id)

    // IMPORTANTE: Marcar TODAS as análises como usadas para controlar custo
    // O usuário precisará fazer 2 novas análises para desbloquear novamente
    const analysisIds = allAnalyses.map(a => a.id)
    await prisma.analysis.updateMany({
      where: {
        id: { in: analysisIds },
      },
      data: {
        usedInRouteCorrection: true,
      },
    })

    console.log(`[ROUTE-CORRECTION] Marcadas ${analysisIds.length} análises como usadas na análise de comportamento`)

    return NextResponse.json({
      correction,
      total_analyses: totalCount,
      new_analyses_used: newAnalysesCount,
      has_evolution_data: !!correction.evolution,
    })
  } catch (error: any) {
    console.error('Error in /api/route-correction:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise de comportamento', details: error.message },
      { status: 500 }
    )
  }
}
