import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-auth'

// PATCH /api/admin/form-questions/[id] - Atualizar pergunta
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

    // Buscar pergunta atual
    const currentQuestion = await prisma.formQuestion.findUnique({
      where: { id },
      include: { options: true }
    })

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Pergunta não encontrada' }, { status: 404 })
    }

    // Se mudar a key, verificar se não existe outra com a mesma key no tema
    if (body.key && body.key !== currentQuestion.key && currentQuestion.themeId) {
      const existing = await prisma.formQuestion.findUnique({
        where: {
          themeId_key: {
            themeId: currentQuestion.themeId,
            key: body.key
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

    // Atualizar pergunta
    const updatedQuestion = await prisma.formQuestion.update({
      where: { id },
      data: {
        key: body.key,
        label: body.label,
        description: body.description !== undefined ? body.description : undefined,
        type: body.type,
        required: body.required,
        order: body.order,
        weight: body.weight,
        placeholder: body.placeholder !== undefined ? body.placeholder : undefined,
        rows: body.rows !== undefined ? body.rows : undefined,
        autoAdvance: body.autoAdvance,
        showIf: body.showIf !== undefined ? body.showIf : undefined,
        isFixed: body.isFixed,
        fixedPosition: body.fixedPosition !== undefined ? body.fixedPosition : undefined
      },
      include: {
        theme: true,
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Se forneceu novas opções, atualizar
    if (body.options) {
      // Deletar opções antigas
      await prisma.formQuestionOption.deleteMany({
        where: { questionId: id }
      })

      // Criar novas opções
      await prisma.formQuestionOption.createMany({
        data: body.options.map((opt: any, idx: number) => ({
          questionId: id,
          value: opt.value,
          label: opt.label,
          hint: opt.hint || null,
          icon: opt.icon || null,
          color: opt.color || null,
          order: opt.order !== undefined ? opt.order : idx
        }))
      })

      // Buscar pergunta com novas opções
      const finalQuestion = await prisma.formQuestion.findUnique({
        where: { id },
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
          action: 'FORM_QUESTION_UPDATE',
          entity: 'FormQuestion',
          entityId: id,
          oldValue: currentQuestion,
          newValue: finalQuestion,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json(finalQuestion)
    }

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_QUESTION_UPDATE',
        entity: 'FormQuestion',
        entityId: id,
        oldValue: currentQuestion,
        newValue: updatedQuestion,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pergunta' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/form-questions/[id] - Deletar pergunta
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

    // Verificar se a pergunta existe
    const question = await prisma.formQuestion.findUnique({
      where: { id }
    })

    if (!question) {
      return NextResponse.json({ error: 'Pergunta não encontrada' }, { status: 404 })
    }

    // Deletar pergunta (cascade deletará as opções)
    await prisma.formQuestion.delete({
      where: { id }
    })

    // Log da ação
    await prisma.adminLog.create({
      data: {
        adminEmail: user.email!,
        action: 'FORM_QUESTION_DELETE',
        entity: 'FormQuestion',
        entityId: id,
        oldValue: question,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar pergunta:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar pergunta' },
      { status: 500 }
    )
  }
}
