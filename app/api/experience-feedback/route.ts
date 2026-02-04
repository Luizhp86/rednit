import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Verificar se o usuário já deu feedback
export async function GET() {
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

    // Verificar se já existe feedback de primeira análise
    const existingFeedback = await prisma.experienceFeedback.findUnique({
      where: {
        userId_kind: {
          userId: dbUser.id,
          kind: 'FIRST_ANALYSIS_EXPERIENCE',
        },
      },
    })

    return NextResponse.json({
      hasFeedback: !!existingFeedback,
      feedback: existingFeedback || null,
    })
  } catch (error) {
    console.error('Error in GET /api/experience-feedback:', error)
    return NextResponse.json({ error: 'Erro ao verificar feedback' }, { status: 500 })
  }
}

// POST - Criar ou atualizar feedback
export async function POST(request: NextRequest) {
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
    const { rating, message, analysisId, skipped } = body

    // Validações
    if (!skipped) {
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating deve estar entre 1 e 5' },
          { status: 400 }
        )
      }
    }

    // Limitar tamanho da mensagem
    if (message && message.length > 1000) {
      return NextResponse.json(
        { error: 'Mensagem muito longa (máximo 1000 caracteres)' },
        { status: 400 }
      )
    }

    // Verificar se análise pertence ao usuário (se fornecida)
    if (analysisId) {
      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
      })

      if (!analysis || analysis.userId !== dbUser.id) {
        return NextResponse.json(
          { error: 'Análise não encontrada ou não pertence ao usuário' },
          { status: 404 }
        )
      }
    }

    // Criar ou atualizar feedback usando upsert
    const feedback = await prisma.experienceFeedback.upsert({
      where: {
        userId_kind: {
          userId: dbUser.id,
          kind: 'FIRST_ANALYSIS_EXPERIENCE',
        },
      },
      update: {
        rating: skipped ? null : rating,
        message: message || null,
        analysisId: analysisId || null,
        skipped: !!skipped,
      },
      create: {
        userId: dbUser.id,
        kind: 'FIRST_ANALYSIS_EXPERIENCE',
        rating: skipped ? null : rating,
        message: message || null,
        analysisId: analysisId || null,
        skipped: !!skipped,
      },
    })

    console.log(
      `[EXPERIENCE_FEEDBACK] Feedback ${skipped ? 'skipped' : 'submitted'} by ${dbUser.email} - rating: ${rating || 'N/A'}`
    )

    return NextResponse.json({
      success: true,
      feedback,
    })
  } catch (error: any) {
    console.error('Error in POST /api/experience-feedback:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar feedback', details: error.message },
      { status: 500 }
    )
  }
}
