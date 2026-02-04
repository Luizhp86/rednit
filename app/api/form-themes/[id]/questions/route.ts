import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET /api/form-themes/[id]/questions - Buscar perguntas de um tema (incluindo fixas)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar tema
    const theme = await prisma.formTheme.findUnique({
      where: { id, active: true }
    })

    if (!theme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }

    // Buscar perguntas do tema
    const themeQuestions = await prisma.formQuestion.findMany({
      where: { themeId: id },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Buscar perguntas fixas que aparecem ANTES
    const fixedBefore = await prisma.formQuestion.findMany({
      where: {
        isFixed: true,
        fixedPosition: 'BEFORE'
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Buscar perguntas fixas que aparecem DEPOIS
    const fixedAfter = await prisma.formQuestion.findMany({
      where: {
        isFixed: true,
        fixedPosition: 'AFTER'
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Combinar perguntas na ordem: fixas BEFORE + tema + fixas AFTER
    const allQuestions = [
      ...fixedBefore,
      ...themeQuestions,
      ...fixedAfter
    ]

    // Remover duplicatas baseado no 'key' da pergunta
    // Manter apenas a primeira ocorrência de cada key
    const seenKeys = new Set<string>()
    const uniqueQuestions = allQuestions.filter(question => {
      if (seenKeys.has(question.key)) {
        console.log(`[API FORM-THEMES] Removendo pergunta duplicada: ${question.key}`)
        return false
      }
      seenKeys.add(question.key)
      return true
    })

    console.log(`[API FORM-THEMES] Total de perguntas antes: ${allQuestions.length}`)
    console.log(`[API FORM-THEMES] Total de perguntas após remover duplicatas: ${uniqueQuestions.length}`)
    console.log(`[API FORM-THEMES] Keys das perguntas: ${uniqueQuestions.map(q => q.key).join(', ')}`)

    return NextResponse.json({
      theme,
      questions: uniqueQuestions
    })
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perguntas' },
      { status: 500 }
    )
  }
}
