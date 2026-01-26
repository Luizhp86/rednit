import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { sendTherapistApprovalEmail } from '@/lib/email'

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')
    
    // Construir filtro
    const where: any = {}
    
    if (status && ['PENDING', 'APPROVED', 'SUSPENDED', 'BLOCKED'].includes(status)) {
      where.status = status
    }
    
    if (plan && ['BASIC', 'INTERMEDIATE', 'PRO'].includes(plan)) {
      where.plan = plan
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Buscar terapeutas
    const [therapists, total] = await Promise.all([
      prisma.therapist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          type: true,
          plan: true,
          whatsapp: true,
          status: true,
          active: true,
          subscriptionStatus: true,
          leadsReceived: true,
          leadsThisMonth: true,
          createdAt: true,
          approvedAt: true,
        }
      }),
      prisma.therapist.count({ where })
    ])
    
    // Estatísticas
    const stats = await prisma.therapist.groupBy({
      by: ['status'],
      _count: true,
    })
    
    const planStats = await prisma.therapist.groupBy({
      by: ['plan'],
      where: { status: 'APPROVED' },
      _count: true,
    })
    
    const activeCount = await prisma.therapist.count({
      where: { active: true, subscriptionStatus: 'active' }
    })
    
    return NextResponse.json({
      therapists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats,
        byPlan: planStats,
        active: activeCount,
        total,
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar terapeutas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    const body = await request.json()
    const { therapistId, action, ...updateData } = body
    
    if (!therapistId) {
      return NextResponse.json({ error: 'therapistId é obrigatório' }, { status: 400 })
    }
    
    // Buscar terapeuta atual
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    })
    
    if (!therapist) {
      return NextResponse.json({ error: 'Terapeuta não encontrado' }, { status: 404 })
    }
    
    // Processar ações
    const data: any = {}
    
    let shouldSendApprovalEmail = false
    
    switch (action) {
      case 'approve':
        data.status = 'APPROVED'
        data.approvedAt = new Date()
        shouldSendApprovalEmail = true
        break
      case 'suspend':
        data.status = 'SUSPENDED'
        data.active = false
        break
      case 'block':
        data.status = 'BLOCKED'
        data.active = false
        break
      case 'activate':
        data.active = true
        break
      case 'deactivate':
        data.active = false
        break
      case 'update':
        // Atualizar campos específicos
        if (updateData.plan) data.plan = updateData.plan
        if (updateData.status) data.status = updateData.status
        break
    }
    
    const updated = await prisma.therapist.update({
      where: { id: therapistId },
      data,
    })
    
    // Enviar email de aprovação se necessário
    if (shouldSendApprovalEmail) {
      await sendTherapistApprovalEmail({
        email: updated.email,
        name: updated.name,
      })
    }
    
    // Log da ação
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
    await prisma.adminLog.create({
      data: {
        adminEmail: user?.email || 'unknown',
        action: `THERAPIST_${action?.toUpperCase() || 'UPDATE'}`,
        entity: 'Therapist',
        entityId: therapistId,
        oldValue: { status: therapist.status, active: therapist.active, plan: therapist.plan },
        newValue: data,
      }
    })
    
    return NextResponse.json({ therapist: updated })
    
  } catch (error) {
    console.error('Erro ao atualizar terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
