import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-auth'

// GET /api/admin/form-themes/[id] - Buscar tema específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    if (!(await isAdminEmail(user.email))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    const theme = await prisma.formTheme.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          }
        },
        _count: {
          select: { analyses: true }
        }
      }
    })

    if (!theme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Erro ao buscar tema:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tema' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/form-themes/[id] - Atualizar tema
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    if (!(await isAdminEmail(user.email))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Buscar tema atual
    const currentTheme = await prisma.formTheme.findUnique({
      where: { id }
    })

    if (!currentTheme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }

    // Se mudar o nome, verificar se não existe outro com o mesmo nome
    if (body.name && body.name !== currentTheme.name) {
      const existing = await prisma.formTheme.findUnique({
        where: { name: body.name }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe um tema com este nome' },
          { status: 400 }
        )
      }
    }

    // Validar datas para temas sazonais
    if (body.seasonal && (!body.startDate || !body.endDate)) {
      return NextResponse.json(
        { error: 'Temas sazonais precisam de data de início e fim' },
        { status: 400 }
      )
    }

    const updatedTheme = await prisma.formTheme.update({
      where: { id },
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description !== undefined ? body.description : undefined,
        icon: body.icon !== undefined ? body.icon : undefined,
        color: body.color,
        active: body.active,
        order: body.order,
        seasonal: body.seasonal,
        startDate: body.startDate ? new Date(body.startDate) : body.startDate === null ? null : undefined,
        endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined
      },
      include: {
        _count: {
          select: { 
            questions: true,
            analyses: true 
          }
        }
      }
    })

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_THEME_UPDATE',
        entity: 'FormTheme',
        entityId: id,
        oldValue: currentTheme,
        newValue: updatedTheme,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(updatedTheme)
  } catch (error) {
    console.error('Erro ao atualizar tema:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tema' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/form-themes/[id] - Deletar tema
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    if (!(await isAdminEmail(user.email))) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    // Verificar se o tema existe
    const theme = await prisma.formTheme.findUnique({
      where: { id },
      include: {
        _count: {
          select: { analyses: true }
        }
      }
    })

    if (!theme) {
      return NextResponse.json({ error: 'Tema não encontrado' }, { status: 404 })
    }

    // Verificar se há análises usando este tema
    if (theme._count.analyses > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar um tema que já possui análises',
          analysesCount: theme._count.analyses
        },
        { status: 400 }
      )
    }

    // Deletar tema (cascade deletará as perguntas e opções)
    await prisma.formTheme.delete({
      where: { id }
    })

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_THEME_DELETE',
        entity: 'FormTheme',
        entityId: id,
        oldValue: theme,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tema:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar tema' },
      { status: 500 }
    )
  }
}
