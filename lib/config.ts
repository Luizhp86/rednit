import { prisma } from './prisma'

// Configurações padrão (usadas se não houver no banco)
const DEFAULT_CONFIG = {
  minAnalysesFirstTime: 3,
  minNewAnalysesForUnlock: 4,
  freeCreditsDaily: 10,
  geminiDailyLimit: 100,
  geminiMonthlyBudgetCents: 50000,
  proPriceMonthly: 2990,
  proPriceYearly: 29900,
  maintenanceMode: false,
  allowNewRegistrations: true,
}

export type SystemConfig = typeof DEFAULT_CONFIG

// Cache simples em memória (1 minuto)
let cachedConfig: SystemConfig | null = null
let cacheTime: number = 0
const CACHE_TTL = 60 * 1000 // 1 minuto

export async function getSystemConfig(): Promise<SystemConfig> {
  // Retornar do cache se ainda válido
  if (cachedConfig && Date.now() - cacheTime < CACHE_TTL) {
    return cachedConfig
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })

    if (config) {
      cachedConfig = {
        minAnalysesFirstTime: config.minAnalysesFirstTime,
        minNewAnalysesForUnlock: config.minNewAnalysesForUnlock,
        freeCreditsDaily: config.freeCreditsDaily,
        geminiDailyLimit: config.geminiDailyLimit,
        geminiMonthlyBudgetCents: config.geminiMonthlyBudgetCents,
        proPriceMonthly: config.proPriceMonthly,
        proPriceYearly: config.proPriceYearly,
        maintenanceMode: config.maintenanceMode,
        allowNewRegistrations: config.allowNewRegistrations,
      }
    } else {
      cachedConfig = DEFAULT_CONFIG
    }

    cacheTime = Date.now()
    return cachedConfig
  } catch (error) {
    // Se houver erro (tabela não existe, etc), usar padrão
    console.warn('[CONFIG] Erro ao buscar configurações, usando padrão:', error)
    return DEFAULT_CONFIG
  }
}

// Invalida o cache (chamar após atualizar configurações)
export function invalidateConfigCache() {
  cachedConfig = null
  cacheTime = 0
}
