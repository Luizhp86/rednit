// Carregar .env primeiro
import { config } from 'dotenv'
config()

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Criar Prisma Client diretamente com adapter
const databaseUrl = process.env.DATABASE_URL || ''
if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
  throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida')
}

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30000,
  max: 2,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedSystemConfig() {
  console.log('🌱 Populando system_config com valores padrão...')

  try {
    const config = await prisma.systemConfig.upsert({
      where: { id: 'default' },
      update: {
        // Limites da jornada do lead
        leadMaxAnalysesPerDay: 50,
        leadMaxRouteCorrectionPerDay: 3,
        minAnalysesFirstTime: 3,
        minNewAnalysesForUnlock: 4,
        
        // Configurações de créditos (legado)
        freeCreditsDaily: 10,
        
        // Controle de gastos Gemini
        geminiDailyLimit: 100,
        geminiMonthlyBudgetCents: 50000,
        geminiCallsToday: 0,
        geminiLastResetDate: null,
        
        // Modelos Gemini configuráveis
        geminiModelAnalysis: 'gemini-1.5-flash',
        geminiModelRouteCorrection: 'gemini-2.0-flash',
        
        // Configurações de preços - Assinaturas Usuario (legado)
        proPriceMonthly: 2990,
        proPriceQuarterly: 7990,
        proPriceYearly: 29900,
        
        // Configurações de preços - Pacotes de créditos (legado)
        creditPriceSingle: 799,
        creditPricePack3: 2490,
        creditPricePack5: 3990,
        
        // CONFIGURAÇÕES B2B - TERAPEUTAS
        therapistPriceBasic: 7900,
        therapistPriceIntermediate: 14900,
        therapistPricePro: 24900,
        therapistLeadsPerDay: 10,
        
        // Feature flags B2B
        enableLeadSignup: true,
        enableLeadAnalysis: true,
        enableLeadCta: true,
        
        // Regras de geração de leads (configuráveis)
        leadSignupPlans: '["BASIC","INTERMEDIATE","PRO"]',
        leadAnalysisPlans: '["INTERMEDIATE","PRO"]',
        leadCtaPlans: '["PRO"]',
        leadCooldownHours: 24,
        leadMaxSignupPerDay: 20,
        leadMaxAnalysisPerDay: 10,
        leadMaxCtaPerDay: 5,
        
        // Feature flags gerais
        maintenanceMode: false,
        allowNewRegistrations: true,
      },
      create: {
        id: 'default',
        // Limites da jornada do lead
        leadMaxAnalysesPerDay: 50,
        leadMaxRouteCorrectionPerDay: 3,
        minAnalysesFirstTime: 3,
        minNewAnalysesForUnlock: 4,
        
        // Configurações de créditos (legado)
        freeCreditsDaily: 10,
        
        // Controle de gastos Gemini
        geminiDailyLimit: 100,
        geminiMonthlyBudgetCents: 50000,
        geminiCallsToday: 0,
        geminiLastResetDate: null,
        
        // Modelos Gemini configuráveis
        geminiModelAnalysis: 'gemini-1.5-flash',
        geminiModelRouteCorrection: 'gemini-2.0-flash',
        
        // Configurações de preços - Assinaturas Usuario (legado)
        proPriceMonthly: 2990,
        proPriceQuarterly: 7990,
        proPriceYearly: 29900,
        
        // Configurações de preços - Pacotes de créditos (legado)
        creditPriceSingle: 799,
        creditPricePack3: 2490,
        creditPricePack5: 3990,
        
        // CONFIGURAÇÕES B2B - TERAPEUTAS
        therapistPriceBasic: 7900,
        therapistPriceIntermediate: 14900,
        therapistPricePro: 24900,
        therapistLeadsPerDay: 10,
        
        // Feature flags B2B
        enableLeadSignup: true,
        enableLeadAnalysis: true,
        enableLeadCta: true,
        
        // Regras de geração de leads (configuráveis)
        leadSignupPlans: '["BASIC","INTERMEDIATE","PRO"]',
        leadAnalysisPlans: '["INTERMEDIATE","PRO"]',
        leadCtaPlans: '["PRO"]',
        leadCooldownHours: 24,
        leadMaxSignupPerDay: 20,
        leadMaxAnalysisPerDay: 10,
        leadMaxCtaPerDay: 5,
        
        // Feature flags gerais
        maintenanceMode: false,
        allowNewRegistrations: true,
      },
    })

    console.log('✅ system_config populado com sucesso!')
    console.log('📊 Configuração:', JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('❌ Erro ao popular system_config:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedSystemConfig()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
