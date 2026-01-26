import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Email autorizado para acessar o painel admin
const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return user
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const eventType = searchParams.get('eventType') // Filtro opcional
    const userId = searchParams.get('userId') // Filtro opcional
    const startDate = searchParams.get('startDate') // Filtro opcional
    const endDate = searchParams.get('endDate') // Filtro opcional

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (eventType) {
      where.eventType = eventType
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Buscar logs com paginação
    const [logsRaw, total] = await Promise.all([
      prisma.userActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userActivityLog.count({ where }),
    ])
    
    // Buscar emails dos usuários únicos
    const userIds = [...new Set(logsRaw.filter(l => l.userId).map(l => l.userId!))]
    const users = userIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true }
        })
      : []
    const userMap = new Map(users.map(u => [u.id, u]))
    
    // Adicionar informações do usuário aos logs
    const logs = logsRaw.map(log => ({
      ...log,
      userEmail: log.userId ? userMap.get(log.userId)?.email || null : null,
      userName: log.userId ? userMap.get(log.userId)?.name || null : null,
    }))

    // Estatísticas de eventos
    const eventStats = await prisma.userActivityLog.groupBy({
      by: ['eventType'],
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
      take: 10,
    })

    // Páginas mais visitadas (PAGE_VIEW)
    const pageViews = await prisma.userActivityLog.groupBy({
      by: ['page'],
      where: {
        eventType: 'PAGE_VIEW',
        page: { not: null },
      },
      _count: true,
      _avg: {
        duration: true,
      },
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: 10,
    })

    // Atividade por dia (últimos 7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyActivity = await prisma.$queryRaw<
      Array<{ date: Date; count: number }>
    >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as count
      FROM user_activity_logs
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        eventTypes: eventStats.map((s) => ({
          eventType: s.eventType,
          count: s._count,
        })),
        topPages: pageViews.map((p) => ({
          page: p.page,
          views: p._count,
          avgDuration: p._avg.duration ? Math.round(p._avg.duration / 1000) : null, // em segundos
        })),
        dailyActivity: dailyActivity.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          count: d.count,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/activity:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs de atividade', details: error.message },
      { status: 500 }
    )
  }
}
