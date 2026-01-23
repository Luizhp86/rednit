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
    // Apenas usuários PRO ou análises pagas têm acesso ao conteúdo premium
    const hasAccess = analysis.isPaid || dbUser.plan === 'PRO'
    
    console.log('[ANALYSES] Verificando acesso:', {
      userId: dbUser.id,
      plan: dbUser.plan,
      isPaid: analysis.isPaid,
      hasAccess
    })

    const resultJson = analysis.resultJson as any
    const inputJson = analysis.inputJson as any
    
    // Garantir que usuários free NUNCA recebam dados premium
    const response: any = {
      id: analysis.id,
      stage: analysis.stage,
      isPaid: analysis.isPaid,
      createdAt: analysis.createdAt,
      free_teaser: {
        ...resultJson.free_teaser,
        nome_match: resultJson.meta?.nome_match || resultJson.nome_match,
        avatar_match: inputJson?.avatar_match,
      },
      has_access: hasAccess,
      avatar_match: inputJson?.avatar_match,
    }
    
    // Apenas adicionar premium se tiver acesso
    if (hasAccess) {
      response.premium = {
        ...resultJson.premium_report,
        scores: resultJson.scores, // Incluir scores completos no premium
        nome_match: resultJson.meta?.nome_match || resultJson.nome_match,
        avatar_match: inputJson?.avatar_match,
      }
    } else {
      response.premium = null
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in /api/analyses/[id]:', error)
    return NextResponse.json({ error: 'Erro ao buscar análise' }, { status: 500 })
  }
}

export async function POST(
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

    if (analysis.isPaid) {
      return NextResponse.json({ error: 'Análise já desbloqueada' }, { status: 400 })
    }

    // Se for PRO, desbloquear automaticamente
    if (dbUser.plan === 'PRO') {
      await prisma.analysis.update({
        where: { id },
        data: { isPaid: true },
      })
      return NextResponse.json({ success: true, message: 'Análise desbloqueada' })
    }

    // Verificar se tem créditos pagos
    if (dbUser.creditsPaid <= 0) {
      return NextResponse.json(
        { error: 'Você não tem créditos disponíveis. Compre um pacote para desbloquear análises.' },
        { status: 403 }
      )
    }

    // Desbloquear usando crédito
    await prisma.$transaction([
      prisma.analysis.update({
        where: { id },
        data: { isPaid: true },
      }),
      prisma.user.update({
        where: { id: dbUser.id },
        data: {
          creditsPaid: {
            decrement: 1,
          },
        },
      }),
    ])

    return NextResponse.json({ 
      success: true, 
      message: 'Análise desbloqueada com sucesso',
      creditsRemaining: dbUser.creditsPaid - 1,
    })
  } catch (error) {
    console.error('Error unlocking analysis:', error)
    return NextResponse.json({ error: 'Erro ao desbloquear análise' }, { status: 500 })
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
