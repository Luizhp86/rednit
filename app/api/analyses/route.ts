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
      },
    })

    return NextResponse.json(analyses)
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
