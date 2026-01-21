import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        plan: 'FREE',
        proUntil: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/downgrade-plan:', error)
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
  }
}
