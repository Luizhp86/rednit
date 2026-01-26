import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendDemoScheduledEmailToAdmins } from '@/lib/email'

const createDemoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  company: z.string().optional(),
  scheduledAt: z.string().transform(str => new Date(str)),
})

// POST - Criar nova demonstração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createDemoSchema.parse(body)
    
    // Verificar se já não existe uma demonstração para o mesmo email no mesmo dia
    const startOfDay = new Date(validatedData.scheduledAt)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(validatedData.scheduledAt)
    endOfDay.setHours(23, 59, 59, 999)
    
    const existingDemo = await prisma.demo.findFirst({
      where: {
        email: validatedData.email,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      }
    })
    
    if (existingDemo) {
      return NextResponse.json(
        { error: 'Você já tem uma demonstração agendada para este dia' },
        { status: 400 }
      )
    }
    
    // Criar demonstração
    const demo = await prisma.demo.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company || null,
        scheduledAt: validatedData.scheduledAt,
        status: 'PENDING',
      }
    })
    
    // Enviar email para os admins
    await sendDemoScheduledEmailToAdmins({
      demo: {
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        company: demo.company,
        scheduledAt: demo.scheduledAt,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Demonstração agendada com sucesso!',
      demo: {
        id: demo.id,
        name: demo.name,
        scheduledAt: demo.scheduledAt,
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar demonstração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar horários disponíveis para agendamento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }
    
    const date = new Date(dateStr)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Buscar demos já agendadas para o dia
    const bookedDemos = await prisma.demo.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        scheduledAt: true,
      }
    })
    
    // Horários disponíveis (9h às 18h, de 30 em 30 minutos)
    const allSlots = []
    for (let hour = 9; hour <= 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    allSlots.push('18:00')
    
    // Horários já ocupados
    const bookedSlots = bookedDemos.map(demo => {
      const d = new Date(demo.scheduledAt)
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    })
    
    // Horários disponíveis
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot))
    
    return NextResponse.json({
      date: dateStr,
      availableSlots,
      bookedSlots,
    })
    
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
