import { NextResponse } from 'next/server'
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
      include: {
        entitlements: true,
        _count: {
          select: {
            analyses: true,
            payments: true,
          },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      plan: dbUser.plan,
      creditsFreeDaily: dbUser.creditsFreeDaily,
      creditsPaid: dbUser.creditsPaid,
      proUntil: dbUser.proUntil,
      stats: {
        totalAnalyses: dbUser._count.analyses,
        totalPayments: dbUser._count.payments,
      },
    })
  } catch (error) {
    console.error('Error in /api/me:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
