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

    // MODELO B2B: Usuários autenticados sempre têm acesso completo às análises
    // A monetização agora é via terapeutas, não usuários
    const hasAccess = true
    
    // Marcar análise como visualizada (para tracking)
    if (!analysis.isPaid) {
      await prisma.analysis.update({
        where: { id },
        data: { isPaid: true }
      })
    }
    
    console.log('[ANALYSES] Acesso liberado (modelo B2B):', {
      userId: dbUser.id,
      analysisId: analysis.id,
    })

    const resultJson = analysis.resultJson as any
    const inputJson = analysis.inputJson as any
    
    // Extrair nome_match de várias fontes possíveis (prioridade: resultado > input)
    const nomeMatch = resultJson.nome_match || 
                      resultJson.meta?.nome_match || 
                      resultJson.free_teaser?.nome_match ||
                      resultJson.premium_report?.nome_match ||
                      inputJson?.nome_match || 
                      null
    
    console.log('[ANALYSES] nome_match extraído:', nomeMatch)
    
    // Garantir que usuários free NUNCA recebam dados premium
    const response: any = {
      id: analysis.id,
      stage: analysis.stage,
      isPaid: analysis.isPaid,
      createdAt: analysis.createdAt,
      free_teaser: {
        ...resultJson.free_teaser,
        nome_match: nomeMatch,
        avatar_match: inputJson?.avatar_match,
      },
      has_access: hasAccess,
      avatar_match: inputJson?.avatar_match,
      nome_match: nomeMatch, // Adicionar no nível raiz também
    }
    
    // Apenas adicionar premium se tiver acesso
    if (hasAccess) {
      response.premium = {
        ...resultJson.premium_report,
        scores: resultJson.scores, // Incluir scores completos no premium
        nome_match: nomeMatch,
        avatar_match: inputJson?.avatar_match,
        // Incluir mensagem de encorajamento se existir
        encouragement_message: resultJson.encouragement_message,
        // Incluir next_actions personalizadas
        next_actions: resultJson.next_actions,
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

// POST: Desbloquear análise (modelo B2B - sem pagamento para leads)
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

    // Modelo B2B: Desbloquear automaticamente para todos os usuários
    await prisma.analysis.update({
      where: { id },
      data: { isPaid: true },
    })

    return NextResponse.json({ success: true, message: 'Análise desbloqueada' })
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
