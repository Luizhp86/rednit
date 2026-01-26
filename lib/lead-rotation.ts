import { prisma } from '@/lib/prisma'
import { TherapistPlan, LeadType } from '@prisma/client'

// Cache das configurações (recarrega a cada 5 minutos)
let configCache: any = null
let configCacheTime = 0
const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

async function getLeadConfig() {
  const now = Date.now()
  if (configCache && now - configCacheTime < CONFIG_CACHE_TTL) {
    return configCache
  }
  
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })
    
    configCache = {
      leadSignupPlans: config?.leadSignupPlans ? JSON.parse(config.leadSignupPlans) : ['BASIC', 'INTERMEDIATE', 'PRO'],
      leadAnalysisPlans: config?.leadAnalysisPlans ? JSON.parse(config.leadAnalysisPlans) : ['INTERMEDIATE', 'PRO'],
      leadCtaPlans: config?.leadCtaPlans ? JSON.parse(config.leadCtaPlans) : ['PRO'],
      leadCooldownHours: config?.leadCooldownHours ?? 24,
      leadMaxSignupPerDay: config?.leadMaxSignupPerDay ?? 20,
      leadMaxAnalysisPerDay: config?.leadMaxAnalysisPerDay ?? 10,
      leadMaxCtaPerDay: config?.leadMaxCtaPerDay ?? 5,
    }
    configCacheTime = now
    
    return configCache
  } catch (e) {
    // Retornar defaults se der erro
    return {
      leadSignupPlans: ['BASIC', 'INTERMEDIATE', 'PRO'],
      leadAnalysisPlans: ['INTERMEDIATE', 'PRO'],
      leadCtaPlans: ['PRO'],
      leadCooldownHours: 24,
      leadMaxSignupPerDay: 20,
      leadMaxAnalysisPerDay: 10,
      leadMaxCtaPerDay: 5,
    }
  }
}

/**
 * Seleciona o próximo terapeuta para receber um lead usando round-robin
 * baseado em quem recebeu lead há mais tempo
 */
export async function getNextTherapist(leadType: LeadType): Promise<string | null> {
  const config = await getLeadConfig()
  
  // Definir quais planos podem receber este tipo de lead (usando configurações)
  let eligiblePlans: TherapistPlan[]
  
  if (leadType === 'SIGNUP') {
    eligiblePlans = config.leadSignupPlans as TherapistPlan[]
  } else if (leadType === 'ANALYSIS') {
    eligiblePlans = config.leadAnalysisPlans as TherapistPlan[]
  } else {
    eligiblePlans = config.leadCtaPlans as TherapistPlan[]
  }
  
  // Verificar se há planos elegíveis configurados
  if (!eligiblePlans || eligiblePlans.length === 0) {
    console.log(`[LEAD] Nenhum plano configurado para receber leads do tipo ${leadType}`)
    return null
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
 * Verifica se o terapeuta pode receber leads CTA (quentes)
 * Apenas PRO recebe leads CTA
 */
export function canReceiveCtaLeads(plan: TherapistPlan): boolean {
  return plan === 'PRO'
}

/**
 * Verifica se o terapeuta pode receber leads de análise (mornos)
 * INTERMEDIATE e PRO recebem leads de análise
 */
export function canReceiveAnalysisLeads(plan: TherapistPlan): boolean {
  return plan === 'INTERMEDIATE' || plan === 'PRO'
}

/**
 * Verifica se deve gerar um novo lead baseado na regra de cooldown configurável
 * Para ANALYSIS e CTA: só gera novo lead se passaram N horas desde o último do mesmo tipo
 */
async function shouldGenerateLead(params: {
  type: LeadType
  userId?: string
  userEmail: string
}): Promise<boolean> {
  // SIGNUP: sempre gera apenas 1x (controlado pelo chamador)
  if (params.type === 'SIGNUP') {
    return true
  }
  
  // Buscar cooldown configurado
  const config = await getLeadConfig()
  const cooldownHours = config.leadCooldownHours || 24
  const cooldownMs = cooldownHours * 60 * 60 * 1000
  
  // Para ANALYSIS e CTA: verificar último lead do mesmo tipo
  const cooldownAgo = new Date(Date.now() - cooldownMs)
  
  // Construir condições de busca
  const orConditions: any[] = [{ userEmail: params.userEmail }]
  if (params.userId) {
    orConditions.push({ userId: params.userId })
  }
  
  const recentLead = await prisma.lead.findFirst({
    where: {
      type: params.type,
      OR: orConditions,
      createdAt: { gte: cooldownAgo }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  if (recentLead) {
    console.log(`[LEAD] Lead ${params.type} recente encontrado (${recentLead.id}) - cooldown ${cooldownHours}h - ignorando duplicata`)
    return false
  }
  
  return true
}

/**
 * Gera um lead e atribui a um terapeuta (se disponível)
 * IMPORTANTE: Leads são SEMPRE criados, mesmo sem terapeuta disponível
 * REGRA 24H: Para ANALYSIS e CTA, só gera se passaram 24h desde o último do mesmo tipo
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
}): Promise<{ leadId: string; therapistId: string | null; skipped?: boolean }> {
  // Verificar regra de 24h
  const shouldGenerate = await shouldGenerateLead({
    type: params.type,
    userId: params.userId,
    userEmail: params.userEmail
  })
  
  if (!shouldGenerate) {
    return { leadId: '', therapistId: null, skipped: true }
  }
  
  // Buscar próximo terapeuta (pode ser null)
  const therapistId = await getNextTherapist(params.type)
  
  if (!therapistId) {
    console.log('[LEAD] Nenhum terapeuta disponível - lead será criado sem atribuição')
  }
  
  // Criar lead (SEMPRE, mesmo sem terapeuta)
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
      therapistId: therapistId, // Pode ser null
    }
  })
  
  console.log(`[LEAD] Lead ${lead.id} criado (tipo: ${params.type}, terapeuta: ${therapistId || 'NÃO ATRIBUÍDO'})`)
  
  // Atualizar contadores do terapeuta (se houver)
  if (therapistId) {
    const updateData: any = {
      lastLeadAt: new Date(),
      leadsReceived: { increment: 1 },
      leadsThisMonth: { increment: 1 },
    }
    
    if (params.type === 'SIGNUP') {
      updateData.leadsSignup = { increment: 1 }
    } else if (params.type === 'ANALYSIS') {
      updateData.leadsAnalysis = { increment: 1 }
    } else {
      updateData.leadsCta = { increment: 1 }
    }
    
    await prisma.therapist.update({
      where: { id: therapistId },
      data: updateData,
    })
  }
  
  return {
    leadId: lead.id,
    therapistId: therapistId,
  }
}

/**
 * Atribui ou troca o terapeuta de um lead existente
 */
export async function assignTherapistToLead(leadId: string, newTherapistId: string): Promise<boolean> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, type: true, therapistId: true }
  })
  
  if (!lead) {
    console.log(`[LEAD] Lead ${leadId} não encontrado`)
    return false
  }
  
  const oldTherapistId = lead.therapistId
  
  // Atualizar lead com novo terapeuta
  await prisma.lead.update({
    where: { id: leadId },
    data: { therapistId: newTherapistId }
  })
  
  // Decrementar contadores do terapeuta antigo (se houver)
  if (oldTherapistId) {
    const decrementData: any = {
      leadsReceived: { decrement: 1 },
      leadsThisMonth: { decrement: 1 },
    }
    
    if (lead.type === 'SIGNUP') {
      decrementData.leadsSignup = { decrement: 1 }
    } else if (lead.type === 'ANALYSIS') {
      decrementData.leadsAnalysis = { decrement: 1 }
    } else {
      decrementData.leadsCta = { decrement: 1 }
    }
    
    await prisma.therapist.update({
      where: { id: oldTherapistId },
      data: decrementData,
    })
  }
  
  // Incrementar contadores do novo terapeuta
  const incrementData: any = {
    lastLeadAt: new Date(),
    leadsReceived: { increment: 1 },
    leadsThisMonth: { increment: 1 },
  }
  
  if (lead.type === 'SIGNUP') {
    incrementData.leadsSignup = { increment: 1 }
  } else if (lead.type === 'ANALYSIS') {
    incrementData.leadsAnalysis = { increment: 1 }
  } else {
    incrementData.leadsCta = { increment: 1 }
  }
  
  await prisma.therapist.update({
    where: { id: newTherapistId },
    data: incrementData,
  })
  
  console.log(`[LEAD] Lead ${leadId} reatribuído: ${oldTherapistId || 'NENHUM'} -> ${newTherapistId}`)
  
  return true
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
