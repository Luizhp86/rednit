import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const SUPER_ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

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
    if (admin) return { ...user, role: admin.role }
  } catch (e) {
    // Tabela admin pode não existir ainda
  }

  // Fallback: email hardcoded (SUPER_ADMIN)
  if (user.email === SUPER_ADMIN_EMAIL) {
    return { ...user, role: 'SUPER_ADMIN' }
  }

  return null
}

// GET - Listar administradores
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    let admins: any[] = []
    
    try {
      admins = await prisma.admin.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (e) {
      // Tabela pode não existir
    }

    // Sempre incluir o super admin se não estiver na lista
    const hasSuperAdmin = admins.some(a => a.email === SUPER_ADMIN_EMAIL)
    if (!hasSuperAdmin) {
      admins.unshift({
        id: 'super-admin',
        email: SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null
      })
    }

    return NextResponse.json({ admins })
  } catch (error: any) {
    console.error('Error in GET /api/admin/admins:', error)
    return NextResponse.json({ error: 'Erro ao buscar admins' }, { status: 500 })
  }
}

// POST - Criar um novo administrador
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Apenas SUPER_ADMIN pode criar admins
    if (admin.role !== 'SUPER_ADMIN' && admin.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Apenas Super Admin pode criar administradores' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, role } = body

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe
    const existing = await prisma.admin.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ error: 'Admin com este email já existe' }, { status: 400 })
    }

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name: name || null,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
        active: true,
        createdBy: admin.email
      }
    })

    // Registrar no log
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'ADMIN_CREATE',
        entity: 'Admin',
        entityId: newAdmin.id,
        oldValue: {},
        newValue: { email, name, role },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Novo admin ${email} criado por ${admin.email}`)

    return NextResponse.json({ admin: newAdmin }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/admin/admins:', error)
    return NextResponse.json({ error: 'Erro ao criar admin' }, { status: 500 })
  }
}

// PATCH - Atualizar um administrador
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Apenas SUPER_ADMIN pode editar admins
    if (admin.role !== 'SUPER_ADMIN' && admin.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Apenas Super Admin pode editar administradores' }, { status: 403 })
    }

    const body = await request.json()
    const { adminId, name, role, active } = body

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório' }, { status: 400 })
    }

    // Não permitir editar o super admin hardcoded
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (targetAdmin?.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Não é possível editar o Super Admin principal' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (typeof active === 'boolean') updateData.active = active

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData
    })

    // Registrar no log
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'ADMIN_UPDATE',
        entity: 'Admin',
        entityId: adminId,
        oldValue: targetAdmin || {},
        newValue: updateData,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Admin ${updatedAdmin.email} atualizado por ${admin.email}`)

    return NextResponse.json({ admin: updatedAdmin })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/admins:', error)
    return NextResponse.json({ error: 'Erro ao atualizar admin' }, { status: 500 })
  }
}

// DELETE - Excluir um administrador
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Apenas SUPER_ADMIN pode excluir admins
    if (admin.role !== 'SUPER_ADMIN' && admin.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Apenas Super Admin pode excluir administradores' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório' }, { status: 400 })
    }

    // Buscar admin para verificação
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })
    }

    // Não permitir excluir o super admin principal
    if (targetAdmin.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Não é possível excluir o Super Admin principal' }, { status: 400 })
    }

    await prisma.admin.delete({
      where: { id: adminId }
    })

    // Registrar no log
    await prisma.adminLog.create({
      data: {
        adminEmail: admin.email!,
        action: 'ADMIN_DELETE',
        entity: 'Admin',
        entityId: adminId,
        oldValue: { email: targetAdmin.email, name: targetAdmin.name, role: targetAdmin.role },
        newValue: {},
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      }
    })

    console.log(`[ADMIN] Admin ${targetAdmin.email} excluído por ${admin.email}`)

    return NextResponse.json({ success: true, deletedAdmin: targetAdmin.email })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/admins:', error)
    return NextResponse.json({ error: 'Erro ao excluir admin' }, { status: 500 })
  }
}
