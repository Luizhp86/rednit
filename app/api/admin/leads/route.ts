import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function isAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(user.email?.toLowerCase() || '')
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const therapistId = searchParams.get('therapistId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Construir filtro
    const where: any = {}
    
    if (type && ['SIGNUP', 'CTA'].includes(type)) {
      where.type = type
    }
    
    if (status && ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status)) {
      where.status = status
    }
    
    if (therapistId) {
      where.therapistId = therapistId
    }
    
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }
    
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate + 'T23:59:59') }
    }
    
    // Buscar leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          therapist: {
            select: {
              id: true,
              name: true,
              email: true,
              plan: true,
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])
    
    // Estatísticas gerais
    const stats = await prisma.lead.groupBy({
      by: ['type'],
      _count: true,
    })
    
    const statusStats = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    })
    
    // Leads por terapeuta (top 10)
    const leadsByTherapist = await prisma.lead.groupBy({
      by: ['therapistId'],
      _count: true,
      orderBy: { _count: { therapistId: 'desc' } },
      take: 10,
    })
    
    // Buscar nomes dos terapeutas
    const therapistIds = leadsByTherapist.map(l => l.therapistId)
    const therapists = await prisma.therapist.findMany({
      where: { id: { in: therapistIds } },
      select: { id: true, name: true }
    })
    
    const therapistMap = new Map(therapists.map(t => [t.id, t.name]))
    
    const leadsByTherapistWithNames = leadsByTherapist.map(l => ({
      therapistId: l.therapistId,
      therapistName: therapistMap.get(l.therapistId) || 'Desconhecido',
      count: l._count,
    }))
    
    // Leads hoje, semana, mês
    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [leadsToday, leadsWeek, leadsMonth] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    ])
    
    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        today: leadsToday,
        week: leadsWeek,
        month: leadsMonth,
        byType: stats,
        byStatus: statusStats,
        byTherapist: leadsByTherapistWithNames,
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
