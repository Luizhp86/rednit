import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyzeRouteCorrection } from '@/lib/ai/gemini'

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

    // Get all analyses for this user
    const analyses = await prisma.analysis.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })

    // Require at least 2 analyses
    if (analyses.length < 2) {
      return NextResponse.json(
        { error: 'Você precisa de pelo menos 2 análises para ver a correção de rota' },
        { status: 400 }
      )
    }

    // Get user's objective from the most recent analysis (or default)
    const mostRecentAnalysis = analyses[0]
    const inputJson = mostRecentAnalysis?.inputJson as any
    const userObjective = inputJson?.objetivo_usuario || 'CONHECER'

    // Prepare data for Gemini
    const routeCorrectionInput = {
      analyses: analyses.map(analysis => {
        const resultJson = analysis.resultJson as any
        return {
          inputJson: analysis.inputJson,
          resultJson: resultJson,
          scores: resultJson?.scores || {},
          createdAt: analysis.createdAt.toISOString(),
        }
      }),
      userObjective,
    }

    // Analyze with Gemini
    const correction = await analyzeRouteCorrection(routeCorrectionInput)

    return NextResponse.json({
      correction,
      total_analyses: analyses.length,
    })
  } catch (error: any) {
    console.error('Error in /api/route-correction:', error)
    return NextResponse.json(
      { error: 'Erro ao processar correção de rota', details: error.message },
      { status: 500 }
    )
  }
}
