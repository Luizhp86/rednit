import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/admin/form-questions/reorder - Reordenar perguntas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const admin = await prisma.admin.findUnique({
      where: { email: user.email! }
    })

    if (!admin || !admin.active) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { questions } = body // Array de { id, order }

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Array de perguntas é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar ordem de cada pergunta
    await prisma.$transaction(
      questions.map(({ id, order }) =>
        prisma.formQuestion.update({
          where: { id },
          data: { order }
        })
      )
    )

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_QUESTIONS_REORDER',
        entity: 'FormQuestion',
        newValue: { questions },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao reordenar perguntas:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar perguntas' },
      { status: 500 }
    )
  }
}
