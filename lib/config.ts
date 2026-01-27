import { prisma } from './prisma'

// Configurações padrão (usadas se não houver no banco)
const DEFAULT_CONFIG = {
  // Limites da jornada do lead
  leadMaxAnalysesPerDay: 50,
  leadMaxRouteCorrectionPerDay: 3,
  minAnalysesFirstTime: 3,
  minNewAnalysesForUnlock: 4,
  // Legado
  freeCreditsDaily: 10,
  geminiDailyLimit: 100,
  geminiMonthlyBudgetCents: 50000,
  // Modelos Gemini configuráveis
  geminiModelAnalysis: 'gemini-1.5-flash',
  geminiModelRouteCorrection: 'gemini-2.0-flash',
  // Preços de assinatura (legado)
  proPriceMonthly: 2990,
  proPriceQuarterly: 7990,
  proPriceYearly: 29900,
  // Preços de pacotes de créditos (legado)
  creditPriceSingle: 799,
  creditPricePack3: 2490,
  creditPricePack5: 3990,
  maintenanceMode: false,
  allowNewRegistrations: true,
}

export type SystemConfig = typeof DEFAULT_CONFIG

/**
 * Busca as configurações do sistema diretamente do banco de dados.
 * 
 * NOTA: Não usamos cache em memória porque:
 * 1. Em ambiente serverless/múltiplas instâncias, cada processo tem seu próprio cache
 * 2. Em desenvolvimento com hot reload, o cache é perdido frequentemente
 * 3. A query é muito leve (1 registro) e não causa overhead significativo
 * 
 * Se necessário cache no futuro, usar Redis ou outro cache distribuído.
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })

    if (config) {
      return {
        // Limites da jornada do lead
        leadMaxAnalysesPerDay: config.leadMaxAnalysesPerDay,
        leadMaxRouteCorrectionPerDay: config.leadMaxRouteCorrectionPerDay,
        minAnalysesFirstTime: config.minAnalysesFirstTime,
        minNewAnalysesForUnlock: config.minNewAnalysesForUnlock,
        // Legado
        freeCreditsDaily: config.freeCreditsDaily,
        geminiDailyLimit: config.geminiDailyLimit,
        geminiMonthlyBudgetCents: config.geminiMonthlyBudgetCents,
        geminiModelAnalysis: config.geminiModelAnalysis,
        geminiModelRouteCorrection: config.geminiModelRouteCorrection,
        proPriceMonthly: config.proPriceMonthly,
        proPriceQuarterly: config.proPriceQuarterly,
        proPriceYearly: config.proPriceYearly,
        creditPriceSingle: config.creditPriceSingle,
        creditPricePack3: config.creditPricePack3,
        creditPricePack5: config.creditPricePack5,
        maintenanceMode: config.maintenanceMode,
        allowNewRegistrations: config.allowNewRegistrations,
      }
    }
    
    // Se não existe config no banco, criar com valores padrão
    console.log('[CONFIG] Configuração não encontrada, criando com valores padrão')
    try {
      const newConfig = await prisma.systemConfig.create({
        data: { id: 'default' }
      })
      return {
        // Limites da jornada do lead
        leadMaxAnalysesPerDay: newConfig.leadMaxAnalysesPerDay,
        leadMaxRouteCorrectionPerDay: newConfig.leadMaxRouteCorrectionPerDay,
        minAnalysesFirstTime: newConfig.minAnalysesFirstTime,
        minNewAnalysesForUnlock: newConfig.minNewAnalysesForUnlock,
        // Legado
        freeCreditsDaily: newConfig.freeCreditsDaily,
        geminiDailyLimit: newConfig.geminiDailyLimit,
        geminiMonthlyBudgetCents: newConfig.geminiMonthlyBudgetCents,
        geminiModelAnalysis: newConfig.geminiModelAnalysis,
        geminiModelRouteCorrection: newConfig.geminiModelRouteCorrection,
        proPriceMonthly: newConfig.proPriceMonthly,
        proPriceQuarterly: newConfig.proPriceQuarterly,
        proPriceYearly: newConfig.proPriceYearly,
        creditPriceSingle: newConfig.creditPriceSingle,
        creditPricePack3: newConfig.creditPricePack3,
        creditPricePack5: newConfig.creditPricePack5,
        maintenanceMode: newConfig.maintenanceMode,
        allowNewRegistrations: newConfig.allowNewRegistrations,
      }
    } catch (createError) {
      console.warn('[CONFIG] Não foi possível criar config, usando padrão:', createError)
      return DEFAULT_CONFIG
    }
  } catch (error) {
    // Se houver erro (tabela não existe, etc), usar padrão
    console.warn('[CONFIG] Erro ao buscar configurações, usando padrão:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * Função mantida por compatibilidade, mas não faz mais nada
 * já que removemos o cache em memória.
 * @deprecated Não é mais necessário chamar esta função
 */
export function invalidateConfigCache() {
  // Não faz nada - mantido apenas por compatibilidade
  // O sistema agora sempre busca do banco
}
