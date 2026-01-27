import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-auth'

// GET /api/admin/form-questions - Listar perguntas
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
    const themeId = searchParams.get('themeId')
    const fixedOnly = searchParams.get('fixedOnly') === 'true'

    const questions = await prisma.formQuestion.findMany({
      where: fixedOnly 
        ? { isFixed: true }
        : themeId 
          ? { themeId }
          : undefined,
      include: {
        theme: true,
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perguntas' },
      { status: 500 }
    )
  }
}

// POST /api/admin/form-questions - Criar nova pergunta
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
      themeId,
      key,
      label,
      description,
      type,
      required,
      order,
      weight,
      placeholder,
      rows,
      autoAdvance,
      showIf,
      isFixed,
      fixedPosition,
      options
    } = body

    // Validações
    if (!key || !label || !type) {
      return NextResponse.json(
        { error: 'Key, label e type são obrigatórios' },
        { status: 400 }
      )
    }

    // Se não é fixa, precisa ter themeId
    if (!isFixed && !themeId) {
      return NextResponse.json(
        { error: 'Perguntas não fixas precisam estar vinculadas a um tema' },
        { status: 400 }
      )
    }

    // Se é fixa, precisa ter fixedPosition
    if (isFixed && !fixedPosition) {
      return NextResponse.json(
        { error: 'Perguntas fixas precisam ter uma posição (BEFORE ou AFTER)' },
        { status: 400 }
      )
    }

    // Verificar se já existe pergunta com esta key no tema
    if (themeId) {
      const existing = await prisma.formQuestion.findUnique({
        where: {
          themeId_key: {
            themeId,
            key
          }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe uma pergunta com esta key neste tema' },
          { status: 400 }
        )
      }
    }

    // Criar pergunta
    const question = await prisma.formQuestion.create({
      data: {
        themeId: themeId || null,
        key,
        label,
        description: description || null,
        type,
        required: required || false,
        order: order || 0,
        weight: weight !== undefined ? weight : 50,
        placeholder: placeholder || null,
        rows: rows || null,
        autoAdvance: autoAdvance || false,
        showIf: showIf || null,
        isFixed: isFixed || false,
        fixedPosition: fixedPosition || null,
        options: options ? {
          create: options.map((opt: any, idx: number) => ({
            value: opt.value,
            label: opt.label,
            hint: opt.hint || null,
            icon: opt.icon || null,
            color: opt.color || null,
            order: opt.order !== undefined ? opt.order : idx
          }))
        } : undefined
      },
      include: {
        theme: true,
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_QUESTION_CREATE',
        entity: 'FormQuestion',
        entityId: question.id,
        newValue: question,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pergunta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pergunta' },
      { status: 500 }
    )
  }
}
