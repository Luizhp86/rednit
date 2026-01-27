import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-auth'

// GET /api/admin/form-themes - Listar todos os temas
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const includeQuestions = searchParams.get('includeQuestions') === 'true'

    const themes = await prisma.formTheme.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: includeQuestions ? {
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
      } : {
        _count: {
          select: { 
            questions: true,
            analyses: true 
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(themes)
  } catch (error) {
    console.error('Erro ao buscar temas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar temas' },
      { status: 500 }
    )
  }
}

// POST /api/admin/form-themes - Criar novo tema
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      displayName,
      description,
      icon,
      color,
      active,
      order,
      seasonal,
      startDate,
      endDate
    } = body

    // Validações
    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Nome e nome de exibição são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const existing = await prisma.formTheme.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um tema com este nome' },
        { status: 400 }
      )
    }

    // Validar datas para temas sazonais
    if (seasonal && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: 'Temas sazonais precisam de data de início e fim' },
        { status: 400 }
      )
    }

    const theme = await prisma.formTheme.create({
      data: {
        name,
        displayName,
        description: description || null,
        icon: icon || null,
        color: color || 'purple',
        active: active !== undefined ? active : true,
        order: order || 0,
        seasonal: seasonal || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_THEME_CREATE',
        entity: 'FormTheme',
        entityId: theme.id,
        newValue: theme,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tema:', error)
    return NextResponse.json(
      { error: 'Erro ao criar tema' },
      { status: 500 }
    )
  }
}
