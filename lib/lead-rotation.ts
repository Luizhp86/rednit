import { prisma } from '@/lib/prisma'
import { TherapistPlan, LeadType } from '@prisma/client'

/**
 * Seleciona o próximo terapeuta para receber um lead usando round-robin
 * baseado em quem recebeu lead há mais tempo
 */
export async function getNextTherapist(leadType: LeadType): Promise<string | null> {
  // Definir quais planos podem receber este tipo de lead
  let eligiblePlans: TherapistPlan[]
  
  if (leadType === 'SIGNUP') {
    // Lead de cadastro: todos os planos recebem
    eligiblePlans = ['BASIC', 'INTERMEDIATE', 'PRO']
  } else {
    // Lead CTA: apenas INTERMEDIATE e PRO
    eligiblePlans = ['INTERMEDIATE', 'PRO']
  }
  
  // Buscar terapeutas elegíveis
  // - Status: APPROVED
  // - Ativo no pool: true
  // - Assinatura: active
  // - Plano compatível
  const therapist = await prisma.therapist.findFirst({
    where: {
      status: 'APPROVED',
      active: true,
      subscriptionStatus: 'active',
      plan: { in: eligiblePlans },
    },
    orderBy: [
      // Prioriza quem recebeu lead há mais tempo (ou nunca recebeu)
      { lastLeadAt: 'asc' },
      // Em caso de empate, usa quem tem menos leads
      { leadsThisMonth: 'asc' },
    ],
    select: {
      id: true,
    }
  })
  
  return therapist?.id || null
}

/**
 * Verifica se o terapeuta pode receber leads CTA com WhatsApp direto
 */
export function canReceiveWhatsappDirect(plan: TherapistPlan): boolean {
  return plan === 'PRO'
}

/**
 * Verifica se o terapeuta pode receber leads CTA
 */
export function canReceiveCtaLeads(plan: TherapistPlan): boolean {
  return plan === 'INTERMEDIATE' || plan === 'PRO'
}

/**
 * Gera um lead e atribui a um terapeuta
 */
export async function generateLead(params: {
  type: LeadType
  userId?: string
  userName?: string
  userEmail: string
  userPhone: string
  analysisId?: string
  matchName?: string
  analysisData?: any
}): Promise<{ leadId: string; therapistId: string } | null> {
  // Buscar próximo terapeuta
  const therapistId = await getNextTherapist(params.type)
  
  if (!therapistId) {
    console.log('Nenhum terapeuta disponível para receber lead')
    return null
  }
  
  // Criar lead
  const lead = await prisma.lead.create({
    data: {
      type: params.type,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      userPhone: params.userPhone,
      analysisId: params.analysisId,
      matchName: params.matchName,
      analysisData: params.analysisData,
      therapistId: therapistId,
    }
  })
  
  // Atualizar contadores do terapeuta
  const updateData: any = {
    lastLeadAt: new Date(),
    leadsReceived: { increment: 1 },
    leadsThisMonth: { increment: 1 },
  }
  
  if (params.type === 'SIGNUP') {
    updateData.leadsSignup = { increment: 1 }
  } else {
    updateData.leadsCta = { increment: 1 }
  }
  
  await prisma.therapist.update({
    where: { id: therapistId },
    data: updateData,
  })
  
  return {
    leadId: lead.id,
    therapistId: therapistId,
  }
}

/**
 * Busca dados do terapeuta para envio de notificação/WhatsApp
 */
export async function getTherapistForLead(therapistId: string) {
  return prisma.therapist.findUnique({
    where: { id: therapistId },
    select: {
      id: true,
      name: true,
      email: true,
      whatsapp: true,
      plan: true,
    }
  })
}
