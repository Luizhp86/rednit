import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'therapist-secret-key-change-in-production'
)

async function getTherapistFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('therapist-token')?.value
  
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.type !== 'therapist' || !payload.therapistId) return null
    return payload.therapistId as string
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const therapistId = await getTherapistFromToken()
    
    if (!therapistId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // SIGNUP, CTA
    const status = searchParams.get('status') // NEW, CONTACTED, CONVERTED, LOST
    
    // Construir filtro
    const where: any = { therapistId }
    
    if (type && ['SIGNUP', 'CTA'].includes(type)) {
      where.type = type
    }
    
    if (status && ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status)) {
      where.status = status
    }
    
    // Buscar leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          status: true,
          userName: true,
          userEmail: true,
          userPhone: true,
          matchName: true,
          analysisData: true,
          emailSentAt: true,
          whatsappOpenedAt: true,
          createdAt: true,
          contactedAt: true,
          convertedAt: true,
        }
      }),
      prisma.lead.count({ where })
    ])
    
    // Estatísticas
    const stats = await prisma.lead.groupBy({
      by: ['type', 'status'],
      where: { therapistId },
      _count: true,
    })
    
    // Leads este mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const leadsThisMonth = await prisma.lead.count({
      where: {
        therapistId,
        createdAt: { gte: startOfMonth }
      }
    })
    
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
        thisMonth: leadsThisMonth,
        byTypeAndStatus: stats,
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

// Atualizar status do lead
export async function PATCH(request: NextRequest) {
  try {
    const therapistId = await getTherapistFromToken()
    
    if (!therapistId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { leadId, status } = body
    
    if (!leadId || !status) {
      return NextResponse.json(
        { error: 'leadId e status são obrigatórios' },
        { status: 400 }
      )
    }
    
    if (!['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }
    
    // Verificar se o lead pertence ao terapeuta
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, therapistId }
    })
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }
    
    // Atualizar lead
    const updateData: any = { status }
    
    if (status === 'CONTACTED' && !lead.contactedAt) {
      updateData.contactedAt = new Date()
    }
    
    if (status === 'CONVERTED' && !lead.convertedAt) {
      updateData.convertedAt = new Date()
    }
    
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    })
    
    return NextResponse.json({ lead: updatedLead })
    
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
