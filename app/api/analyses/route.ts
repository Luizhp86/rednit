import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

    const analyses = await prisma.analysis.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        stage: true,
        isPaid: true,
        createdAt: true,
        resultJson: true,
        inputJson: true,
      },
    })

    const response = analyses.map((analysis) => {
      const resultJson = analysis.resultJson as any
      const inputJson = analysis.inputJson as any
      const nomeMatch =
        resultJson?.meta?.nome_match ||
        resultJson?.nome_match ||
        inputJson?.nome_match ||
        null
      const generoMatch =
        inputJson?.genero_match ||
        resultJson?.meta?.genero_match ||
        resultJson?.genero_match ||
        null

      return {
        id: analysis.id,
        stage: analysis.stage,
        isPaid: analysis.isPaid,
        createdAt: analysis.createdAt,
        nome_match: nomeMatch,
        genero_match: generoMatch,
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in /api/analyses:', error)
    return NextResponse.json({ error: 'Erro ao buscar análises' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    // Delete all analyses for this user
    const result = await prisma.analysis.deleteMany({
      where: { userId: dbUser.id },
    })

    console.log(`[DELETE ANALYSES] Deletadas ${result.count} análises do usuário ${dbUser.email}`)

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} análise(s) excluída(s) com sucesso`,
    })
  } catch (error: any) {
    console.error('[DELETE ANALYSES] Erro:', error.message)
    return NextResponse.json({ error: 'Erro ao excluir análises' }, { status: 500 })
  }
}
