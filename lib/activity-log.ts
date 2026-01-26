import { prisma } from '@/lib/prisma'
import { UserJourneyType } from '@prisma/client'

// ============================================
// TIPOS DE EVENTOS
// ============================================

// Eventos da jornada do LEAD
export const LeadEvents = {
  // Aquisição
  LANDING_VIEW: 'LANDING_VIEW',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  SIGNUP_COMPLETE: 'SIGNUP_COMPLETE',
  
  // Engajamento
  FORM_START: 'FORM_START',
  FORM_STEP: 'FORM_STEP',
  FORM_COMPLETE: 'FORM_COMPLETE',
  ANALYSIS_VIEW: 'ANALYSIS_VIEW',
  
  // Conversão
  CTA_CLICK: 'CTA_CLICK',
  PHONE_SUBMIT: 'PHONE_SUBMIT',
  WHATSAPP_OPEN: 'WHATSAPP_OPEN',
  
  // Retenção
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  ANALYSIS_HISTORY: 'ANALYSIS_HISTORY',
  ROUTE_CORRECTION: 'ROUTE_CORRECTION',
  
  // Outros
  LOGOUT: 'LOGOUT',
  ACCOUNT_DELETE: 'ACCOUNT_DELETE',
} as const

// Eventos da jornada do TERAPEUTA
export const TherapistEvents = {
  // Aquisição
  LANDING_VIEW: 'LANDING_VIEW',
  REGISTER_START: 'REGISTER_START',
  REGISTER_COMPLETE: 'REGISTER_COMPLETE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  
  // Ativação
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  SUBSCRIPTION_START: 'SUBSCRIPTION_START',
  SUBSCRIPTION_ACTIVE: 'SUBSCRIPTION_ACTIVE',
  
  // Engajamento
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  LEAD_VIEW: 'LEAD_VIEW',
  LEAD_CONTACT: 'LEAD_CONTACT',
  LEAD_CONVERT: 'LEAD_CONVERT',
  
  // Receita
  PLAN_UPGRADE: 'PLAN_UPGRADE',
  PLAN_DOWNGRADE: 'PLAN_DOWNGRADE',
  
  // Outros
  LOGOUT: 'LOGOUT',
} as const

export type LeadEventType = typeof LeadEvents[keyof typeof LeadEvents]
export type TherapistEventType = typeof TherapistEvents[keyof typeof TherapistEvents]

// ============================================
// FUNÇÕES DE LOG
// ============================================

type LogLeadActivityParams = {
  eventType: LeadEventType
  userId?: string
  sessionId: string
  eventData?: Record<string, any>
  page?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  duration?: number
}

type LogTherapistActivityParams = {
  eventType: TherapistEventType
  therapistId?: string
  sessionId: string
  eventData?: Record<string, any>
  page?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  duration?: number
}

/**
 * Registra atividade de um LEAD (usuário comum)
 */
export async function logLeadActivity(params: LogLeadActivityParams) {
  try {
    await prisma.userActivityLog.create({
      data: {
        journeyType: 'LEAD',
        userId: params.userId,
        sessionId: params.sessionId,
        eventType: params.eventType,
        eventData: params.eventData,
        page: params.page,
        referrer: params.referrer,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        duration: params.duration,
      }
    })
  } catch (error) {
    console.error('[ACTIVITY_LOG] Erro ao registrar atividade de lead:', error)
  }
}

/**
 * Registra atividade de um TERAPEUTA
 */
export async function logTherapistActivity(params: LogTherapistActivityParams) {
  try {
    await prisma.userActivityLog.create({
      data: {
        journeyType: 'THERAPIST',
        therapistId: params.therapistId,
        sessionId: params.sessionId,
        eventType: params.eventType,
        eventData: params.eventData,
        page: params.page,
        referrer: params.referrer,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        duration: params.duration,
      }
    })
  } catch (error) {
    console.error('[ACTIVITY_LOG] Erro ao registrar atividade de terapeuta:', error)
  }
}

/**
 * Registra atividade de ADMIN
 */
export async function logAdminActivity(params: {
  adminEmail: string
  sessionId: string
  eventType: string
  eventData?: Record<string, any>
  page?: string
}) {
  try {
    await prisma.userActivityLog.create({
      data: {
        journeyType: 'ADMIN',
        sessionId: params.sessionId,
        eventType: params.eventType,
        eventData: {
          ...params.eventData,
          adminEmail: params.adminEmail,
        },
        page: params.page,
      }
    })
  } catch (error) {
    console.error('[ACTIVITY_LOG] Erro ao registrar atividade de admin:', error)
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Gera um session ID único
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extrai informações do request para logging
 */
export function extractRequestInfo(request: Request): {
  userAgent?: string
  ipAddress?: string
  referrer?: string
} {
  const headers = request.headers
  
  return {
    userAgent: headers.get('user-agent') || undefined,
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               headers.get('x-real-ip') || 
               undefined,
    referrer: headers.get('referer') || undefined,
  }
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Busca estatísticas de jornada de leads
 */
export async function getLeadJourneyStats(startDate: Date, endDate: Date) {
  const stats = await prisma.userActivityLog.groupBy({
    by: ['eventType'],
    where: {
      journeyType: 'LEAD',
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    },
    _count: {
      id: true,
    }
  })
  
  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = stat._count.id
    return acc
  }, {} as Record<string, number>)
}

/**
 * Busca estatísticas de jornada de terapeutas
 */
export async function getTherapistJourneyStats(startDate: Date, endDate: Date) {
  const stats = await prisma.userActivityLog.groupBy({
    by: ['eventType'],
    where: {
      journeyType: 'THERAPIST',
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    },
    _count: {
      id: true,
    }
  })
  
  return stats.reduce((acc, stat) => {
    acc[stat.eventType] = stat._count.id
    return acc
  }, {} as Record<string, number>)
}

/**
 * Busca funil de conversão de leads
 */
export async function getLeadConversionFunnel(startDate: Date, endDate: Date) {
  const funnelSteps = [
    'LANDING_VIEW',
    'LOGIN_SUCCESS',
    'FORM_START',
    'FORM_COMPLETE',
    'ANALYSIS_VIEW',
    'CTA_CLICK',
    'WHATSAPP_OPEN',
  ]
  
  const stats = await getLeadJourneyStats(startDate, endDate)
  
  return funnelSteps.map(step => ({
    step,
    count: stats[step] || 0,
  }))
}
