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
    const action = searchParams.get('action') // Filtro opcional
    const adminEmail = searchParams.get('adminEmail') // Filtro opcional
    const startDate = searchParams.get('startDate') // Filtro opcional
    const endDate = searchParams.get('endDate') // Filtro opcional

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (action) {
      where.action = action
    }
    
    if (adminEmail) {
      where.adminEmail = {
        contains: adminEmail,
        mode: 'insensitive',
      }
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
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.adminLog.count({ where }),
    ])

    // Estatísticas rápidas
    const stats = await prisma.adminLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.map((s) => ({
        action: s.action,
        count: s._count,
      })),
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs', details: error.message },
      { status: 500 }
    )
  }
}
