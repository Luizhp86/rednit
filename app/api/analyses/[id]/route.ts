import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    if (analysis.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Return free teaser or full result based on isPaid and user plan
    // In development, always grant access for testing
    const hasAccess = process.env.NODE_ENV === 'development' || analysis.isPaid || dbUser.plan === 'PRO'

    const resultJson = analysis.resultJson as any
    return NextResponse.json({
      id: analysis.id,
      stage: analysis.stage,
      isPaid: analysis.isPaid,
      createdAt: analysis.createdAt,
      free_teaser: {
        ...resultJson.free_teaser,
        nome_match: resultJson.nome_match,
      },
      premium: hasAccess ? {
        ...resultJson.premium,
        nome_match: resultJson.nome_match,
      } : null,
      has_access: hasAccess,
    })
  } catch (error) {
    console.error('Error in /api/analyses/[id]:', error)
    return NextResponse.json({ error: 'Erro ao buscar análise' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    })

    if (!analysis || analysis.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    await prisma.analysis.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting analysis:', error)
    return NextResponse.json({ error: 'Erro ao excluir análise' }, { status: 500 })
  }
}
