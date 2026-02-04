import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { FeedbackKind } from '@prisma/client'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Verificar se é admin no banco
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: user.email!, active: true }
    })
    if (admin) return user
  } catch (e) {
    // Tabela admin pode não existir ainda
  }

  // Fallback: email hardcoded
  const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'
  if (user.email === ADMIN_EMAIL) {
    return user
  }

  return null
}

// GET - Listar feedbacks com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || '' // Busca por email ou nome
    const skipped = searchParams.get('skipped') // 'true', 'false' ou null (todos)
    const minRating = searchParams.get('minRating') // Filtro de rating mínimo
    const kindParam = searchParams.get('kind') || 'FIRST_ANALYSIS_EXPERIENCE'
    const kind: FeedbackKind = kindParam === 'FIRST_ANALYSIS_EXPERIENCE' ? FeedbackKind.FIRST_ANALYSIS_EXPERIENCE : FeedbackKind.FIRST_ANALYSIS_EXPERIENCE

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      kind,
    }

    if (skipped === 'true') {
      where.skipped = true
    } else if (skipped === 'false') {
      where.skipped = false
    }

    if (minRating) {
      const minRatingNum = parseInt(minRating)
      if (minRatingNum >= 1 && minRatingNum <= 5) {
        where.rating = {
          gte: minRatingNum,
        }
      }
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Buscar feedbacks com paginação
    const [feedbacks, total] = await Promise.all([
      prisma.experienceFeedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          analysis: {
            select: {
              id: true,
              createdAt: true,
              inputJson: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.experienceFeedback.count({ where }),
    ])

    // Estatísticas rápidas
    const stats = await prisma.experienceFeedback.groupBy({
      by: ['rating'],
      where: { kind, skipped: false },
      _count: true,
      orderBy: {
        rating: 'desc',
      },
    })

    const skippedCount = await prisma.experienceFeedback.count({
      where: { kind, skipped: true },
    })

    // Calcular média de rating
    const avgRating = await prisma.experienceFeedback.aggregate({
      where: { kind, skipped: false, rating: { not: null } },
      _avg: {
        rating: true,
      },
    })

    return NextResponse.json({
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        userId: f.userId,
        user: {
          email: f.user.email,
          name: f.user.name,
          phone: f.user.phone,
        },
        analysisId: f.analysisId,
        analysisCreatedAt: f.analysis?.createdAt || null,
        analysisMatchName:
          (f.analysis?.inputJson as any)?.nome_match || null,
        kind: f.kind,
        rating: f.rating,
        message: f.message,
        skipped: f.skipped,
        createdAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        ratingDistribution: stats.map((s) => ({
          rating: s.rating,
          count: s._count,
        })),
        skippedCount,
        avgRating: avgRating._avg.rating || 0,
        totalWithRating: total - skippedCount,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/experience-feedback:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar feedbacks', details: error.message },
      { status: 500 }
    )
  }
}
