import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET /api/form-themes - Listar temas ativos (público para usuários autenticados)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const now = new Date()

    const themes = await prisma.formTheme.findMany({
      where: {
        active: true,
        OR: [
          // Temas não sazonais
          { seasonal: false },
          // Temas sazonais dentro do período
          {
            seasonal: true,
            startDate: { lte: now },
            endDate: { gte: now }
          }
        ]
      },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: [
        { seasonal: 'desc' }, // Sazonais primeiro
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(themes)
  } catch (error) {
    console.error('Erro ao buscar temas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar temas' },
      { status: 500 }
    )
  }
}
