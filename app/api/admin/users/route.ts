import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return user
}

// GET - Listar usuários com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (plan === 'PRO' || plan === 'FREE') {
      where.plan = plan
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          creditsFreeDaily: true,
          creditsPaid: true,
          proUntil: true,
          createdAt: true,
          _count: {
            select: { analyses: true, payments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(u => ({
        ...u,
        analysesCount: u._count.analyses,
        paymentsCount: u._count.payments
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

// PATCH - Atualizar um usuário
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, plan, creditsPaid, proUntil } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const updateData: any = {}
    if (plan === 'PRO' || plan === 'FREE') {
      updateData.plan = plan
    }
    if (typeof creditsPaid === 'number') {
      updateData.creditsPaid = creditsPaid
    }
    if (proUntil) {
      updateData.proUntil = new Date(proUntil)
    }

    // Buscar dados antigos para audit log
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        plan: true,
        creditsPaid: true,
        proUntil: true
      }
    })

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        creditsPaid: true,
        proUntil: true
      }
    })

    // Determinar tipo de ação para log mais específico
    let action = 'USER_UPDATE'
    if (updateData.plan && oldUser && updateData.plan !== oldUser.plan) {
      action = 'USER_PLAN_UPDATE'
    } else if (updateData.creditsPaid !== undefined && oldUser && updateData.creditsPaid !== oldUser.creditsPaid) {
      action = 'USER_CREDITS_UPDATE'
    }

    // Registrar alteração no log de auditoria
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action,
        entity: 'User',
        entityId: userId,
        oldValue: oldUser || {},
        newValue: updateData,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Usuário ${user.email} atualizado por ${admin.email}:`, updateData)

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}
