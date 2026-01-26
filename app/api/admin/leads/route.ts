import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { assignTherapistToLead } from '@/lib/lead-rotation'
import { sendLeadSignupNotification, sendLeadAnalysisNotification, sendLeadCtaNotification } from '@/lib/email'

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

async function getAdminEmail() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const therapistId = searchParams.get('therapistId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Construir filtro
    const where: any = {}
    
    if (type && ['SIGNUP', 'ANALYSIS', 'CTA'].includes(type)) {
      where.type = type
    }
    
    if (status && ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status)) {
      where.status = status
    }
    
    if (therapistId === 'unassigned') {
      // Filtrar leads sem terapeuta
      where.therapistId = null
    } else if (therapistId) {
      where.therapistId = therapistId
    }
    
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }
    
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate + 'T23:59:59') }
    }
    
    // Buscar leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          therapist: {
            select: {
              id: true,
              name: true,
              email: true,
              plan: true,
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])
    
    // Estatísticas gerais
    const stats = await prisma.lead.groupBy({
      by: ['type'],
      _count: true,
    })
    
    const statusStats = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    })
    
    // Leads por terapeuta (top 10)
    const leadsByTherapist = await prisma.lead.groupBy({
      by: ['therapistId'],
      _count: true,
      orderBy: { _count: { therapistId: 'desc' } },
      take: 10,
    })
    
    // Buscar nomes dos terapeutas (filtrando nulls)
    const therapistIds = leadsByTherapist
      .map(l => l.therapistId)
      .filter((id): id is string => id !== null)
    
    const therapists = therapistIds.length > 0 
      ? await prisma.therapist.findMany({
          where: { id: { in: therapistIds } },
          select: { id: true, name: true }
        })
      : []
    
    const therapistMap = new Map(therapists.map(t => [t.id, t.name]))
    
    const leadsByTherapistWithNames = leadsByTherapist.map(l => ({
      therapistId: l.therapistId,
      therapistName: l.therapistId ? therapistMap.get(l.therapistId) || 'Desconhecido' : 'Não atribuído',
      count: l._count,
    }))
    
    // Leads hoje, semana, mês
    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [leadsToday, leadsWeek, leadsMonth, leadsUnassigned] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { therapistId: null } }),
    ])
    
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
        today: leadsToday,
        week: leadsWeek,
        month: leadsMonth,
        unassigned: leadsUnassigned,
        byType: stats,
        byStatus: statusStats,
        byTherapist: leadsByTherapistWithNames,
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

// PATCH - Atribuir/trocar terapeuta de um lead ou atualizar status
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    const body = await request.json()
    const { leadId, therapistId, status, sendNotification } = body
    
    if (!leadId) {
      return NextResponse.json({ error: 'leadId é obrigatório' }, { status: 400 })
    }
    
    // Buscar lead atual
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        therapist: { select: { id: true, name: true } }
      }
    })
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }
    
    const oldTherapistId = lead.therapistId
    const oldStatus = lead.status
    let updated = false
    
    // Atribuir/trocar terapeuta
    if (therapistId !== undefined) {
      // Verificar se o terapeuta existe
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId },
        select: { id: true, name: true, email: true, plan: true }
      })
      
      if (!therapist) {
        return NextResponse.json({ error: 'Terapeuta não encontrado' }, { status: 404 })
      }
      
      // Usar a função de atribuição que gerencia contadores
      const success = await assignTherapistToLead(leadId, therapistId)
      
      if (!success) {
        return NextResponse.json({ error: 'Erro ao atribuir terapeuta' }, { status: 500 })
      }
      
      updated = true
      
      // Enviar notificação se solicitado
      if (sendNotification) {
        try {
          if (lead.type === 'SIGNUP') {
            await sendLeadSignupNotification({
              therapist: { email: therapist.email, name: therapist.name },
              lead: {
                userName: lead.userName,
                userEmail: lead.userEmail,
                userPhone: lead.userPhone,
              }
            })
          } else if (lead.type === 'ANALYSIS') {
            await sendLeadAnalysisNotification({
              therapist: { email: therapist.email, name: therapist.name, plan: therapist.plan },
              lead: {
                userName: lead.userName,
                userEmail: lead.userEmail,
                userPhone: lead.userPhone,
                matchName: lead.matchName,
                analysisData: lead.analysisData,
              }
            })
          } else if (lead.type === 'CTA') {
            await sendLeadCtaNotification({
              therapist: { email: therapist.email, name: therapist.name, plan: therapist.plan },
              lead: {
                userName: lead.userName,
                userEmail: lead.userEmail,
                userPhone: lead.userPhone,
                matchName: lead.matchName,
                analysisData: lead.analysisData,
              }
            })
          }
          
          // Marcar email como enviado
          await prisma.lead.update({
            where: { id: leadId },
            data: { emailSentAt: new Date() }
          })
        } catch (emailError) {
          console.error('Erro ao enviar notificação:', emailError)
        }
      }
      
      console.log(`[ADMIN] Lead ${leadId} atribuído: ${oldTherapistId || 'NENHUM'} -> ${therapistId}`)
    }
    
    // Atualizar status
    if (status && ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status)) {
      const updateData: any = { status }
      
      if (status === 'CONTACTED' && oldStatus !== 'CONTACTED') {
        updateData.contactedAt = new Date()
      }
      if (status === 'CONVERTED' && oldStatus !== 'CONVERTED') {
        updateData.convertedAt = new Date()
      }
      
      await prisma.lead.update({
        where: { id: leadId },
        data: updateData
      })
      
      updated = true
      console.log(`[ADMIN] Lead ${leadId} status: ${oldStatus} -> ${status}`)
    }
    
    if (!updated) {
      return NextResponse.json({ error: 'Nenhuma alteração solicitada' }, { status: 400 })
    }
    
    // Registrar no log de auditoria
    const adminEmail = await getAdminEmail()
    await prisma.adminLog.create({
      data: {
        adminEmail: adminEmail || 'unknown',
        action: 'LEAD_UPDATE',
        entity: 'Lead',
        entityId: leadId,
        oldValue: { therapistId: oldTherapistId, status: oldStatus },
        newValue: { therapistId, status },
      }
    })
    
    // Buscar lead atualizado
    const updatedLead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        therapist: {
          select: { id: true, name: true, email: true, plan: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })
    
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
