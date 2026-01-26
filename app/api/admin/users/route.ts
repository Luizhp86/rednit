import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { analyses: true }
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
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        createdAt: u.createdAt,
        analysesCount: u._count.analyses
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
    const { userId, name, email, phone, plan, creditsPaid, proUntil } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const updateData: any = {}
    
    // Dados básicos editáveis
    if (name !== undefined) {
      updateData.name = name || null
    }
    if (email !== undefined && email) {
      updateData.email = email
    }
    if (phone !== undefined) {
      updateData.phone = phone || null
    }
    
    // Plano e créditos
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
        name: true,
        phone: true,
        plan: true,
        creditsPaid: true,
        proUntil: true
      }
    })

    if (!oldUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
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

// POST - Criar um usuário manualmente
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, phone, plan, creditsPaid } = body

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Criar usuário no banco
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        plan: plan === 'PRO' ? 'PRO' : 'FREE',
        creditsPaid: typeof creditsPaid === 'number' ? creditsPaid : 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        plan: true,
        creditsPaid: true,
        createdAt: true
      }
    })

    // Registrar criação no log de auditoria
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'USER_CREATE',
        entity: 'User',
        entityId: user.id,
        oldValue: {},
        newValue: { email, name, phone, plan, creditsPaid },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Usuário ${user.email} criado manualmente por ${admin.email}`)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

// DELETE - Excluir um usuário
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    // Buscar usuário para log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        plan: true,
        _count: {
          select: { analyses: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Deletar usuário (cascade deleta analyses, payments, etc.)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Registrar exclusão no log de auditoria
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'USER_DELETE',
        entity: 'User',
        entityId: userId,
        oldValue: {
          email: user.email,
          name: user.name,
          phone: user.phone,
          plan: user.plan,
          analysesCount: user._count.analyses
        },
        newValue: {},
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Usuário ${user.email} excluído por ${admin.email}`)

    return NextResponse.json({ success: true, deletedUser: user.email })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
