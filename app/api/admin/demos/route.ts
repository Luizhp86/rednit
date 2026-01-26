import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as demonstrações (para admin)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin (simplificado - em produção usar middleware)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const where: any = {}
    if (status) {
      where.status = status
    }
    
    const [demos, total] = await Promise.all([
      prisma.demo.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.demo.count({ where }),
    ])
    
    // Estatísticas
    const stats = await prisma.demo.groupBy({
      by: ['status'],
      _count: true,
    })
    
    const statsMap = {
      total,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    }
    
    stats.forEach(stat => {
      const status = stat.status.toLowerCase()
      if (status === 'no_show' || status === 'noshow') {
        statsMap.noShow = stat._count
      } else if (status === 'pending') {
        statsMap.pending = stat._count
      } else if (status === 'confirmed') {
        statsMap.confirmed = stat._count
      } else if (status === 'completed') {
        statsMap.completed = stat._count
      } else if (status === 'cancelled') {
        statsMap.cancelled = stat._count
      }
    })
    
    // Demos da próxima semana
    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const upcomingDemos = await prisma.demo.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: nextWeek,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { scheduledAt: 'asc' },
    })
    
    return NextResponse.json({
      demos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: statsMap,
      upcomingDemos,
    })
    
  } catch (error) {
    console.error('Erro ao buscar demonstrações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status de uma demonstração
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      )
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }
    
    const updateData: any = { status }
    
    if (notes !== undefined) {
      updateData.notes = notes
    }
    
    // Adicionar timestamps conforme status
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date()
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
    }
    
    const demo = await prisma.demo.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({
      success: true,
      demo,
    })
    
  } catch (error) {
    console.error('Erro ao atualizar demonstração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
