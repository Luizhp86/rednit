import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
  cleanupRegistered: boolean | undefined
}

// Só logar uma vez por inicialização
if (!globalForPrisma.prisma) {
  console.log('[PRISMA] Inicializando Prisma Client...')
  console.log('[PRISMA] DATABASE_URL existe:', !!process.env.DATABASE_URL)
}

// Get database URL
let databaseUrl = process.env.DATABASE_URL || ''

// Extract actual PostgreSQL URL from prisma+postgres:// format if needed
if (databaseUrl.startsWith('prisma+postgres://')) {
  console.log('[PRISMA] Detectado formato prisma+postgres://, tentando extrair URL...')
  try {
    // Try to extract the postgres URL from the api_key parameter
    const url = new URL(databaseUrl)
    const apiKey = url.searchParams.get('api_key')
    
    if (apiKey) {
      console.log('[PRISMA] API key encontrada, tentando decodificar...')
      // Decode the base64-like encoded URL
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString())
        console.log('[PRISMA] Decodificado com sucesso, keys:', Object.keys(decoded))
        if (decoded.databaseUrl) {
          databaseUrl = decoded.databaseUrl
          console.log('[PRISMA] URL PostgreSQL extraída com sucesso')
        } else {
          console.error('[PRISMA] decoded.databaseUrl não encontrado no objeto decodificado')
          console.error('[PRISMA] Objeto decodificado:', JSON.stringify(decoded, null, 2))
        }
      } catch (e: any) {
        console.error('[PRISMA] Erro ao decodificar API key:', e.message)
        console.error('[PRISMA] Stack:', e.stack)
        throw new Error('Invalid prisma+postgres URL format. Please use direct PostgreSQL connection string.')
      }
    } else {
      console.error('[PRISMA] API key não encontrada na URL')
    }
  } catch (error: any) {
    console.error('[PRISMA] Erro ao fazer parse da URL prisma+postgres:', error.message)
    console.error('[PRISMA] Stack:', error.stack)
    throw new Error('Please configure DATABASE_URL with direct Supabase PostgreSQL connection string')
  }
}

// Create PostgreSQL adapter
let adapter: PrismaPg | undefined

if (databaseUrl && databaseUrl.startsWith('postgres')) {
  try {
    // Em desenvolvimento, usar menos conexões para evitar "max clients reached"
    const isDev = process.env.NODE_ENV === 'development'
    
    // Reutilizar pool existente para evitar criar múltiplos pools durante hot reload
    let pool: Pool
    
    if (globalForPrisma.pgPool) {
      pool = globalForPrisma.pgPool
      console.log('[PRISMA] Reutilizando pool existente')
    } else {
      // Usar pool mínimo para evitar "max clients reached" no Supabase Session mode
      // Recomendação: usar Supabase Pooler (porta 6543) para melhor performance
      pool = new Pool({
        connectionString: databaseUrl,

        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 1000, // Liberar conexões idle em 1 segundo
        max: 1, // Apenas 1 conexão por instância serverless
        min: 0, // Não manter conexões ociosas
        allowExitOnIdle: true, // Permite que o processo encerre quando idle
      })
      
      globalForPrisma.pgPool = pool

      console.log('[PRISMA] Novo pool criado (max:', isDev ? 1 : 2, ')')



      
      // Registrar cleanup para quando o processo encerrar
      if (!globalForPrisma.cleanupRegistered) {
        globalForPrisma.cleanupRegistered = true
        
        const cleanup = async () => {
          console.log('[PRISMA] Encerrando pool de conexões...')
          if (globalForPrisma.pgPool) {
            await globalForPrisma.pgPool.end()
            globalForPrisma.pgPool = undefined
          }
          if (globalForPrisma.prisma) {
            await globalForPrisma.prisma.$disconnect()
            globalForPrisma.prisma = undefined
          }
        }
        
        process.on('beforeExit', cleanup)
        process.on('SIGINT', () => { cleanup().then(() => process.exit(0)) })
        process.on('SIGTERM', () => { cleanup().then(() => process.exit(0)) })
      }
    }
    
    adapter = new PrismaPg(pool)
    
    // Testar conexão apenas na primeira inicialização
    if (!globalForPrisma.prisma) {
      pool.query('SELECT 1').then(() => {
        console.log('[PRISMA] Conexão com banco OK')
      }).catch((err) => {
        console.warn('[PRISMA] Banco indisponível:', err.message)
      })
    }
  } catch (error: any) {
    console.error('[PRISMA] Erro ao criar adapter PostgreSQL:', error.message)
    console.error('[PRISMA] Stack:', error.stack)
    
    // Em desenvolvimento, não quebra a aplicação se o banco não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PRISMA] Modo desenvolvimento: continuando sem banco (algumas funcionalidades podem não funcionar)')
    } else {
      throw error
    }
  }
} else {
  console.error('[PRISMA] DATABASE_URL não é uma URL PostgreSQL válida')
  console.error('[PRISMA] URL atual:', databaseUrl.substring(0, 100))
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('[PRISMA] Modo desenvolvimento: continuando sem banco configurado')
  } else {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL connection string.\n' +
      'Get it from Supabase: Settings > Database > Connection string (URI)\n' +
      'Format: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres'
    )
  }
}

console.log('[PRISMA] Criando PrismaClient...')
let prismaInstance: PrismaClient

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  // Sempre reutilizar instância para evitar criar múltiplas conexões
  globalForPrisma.prisma = prismaInstance
  
  console.log('[PRISMA] PrismaClient criado com sucesso')
} catch (error: any) {
  console.error('[PRISMA] ERRO CRÍTICO na inicialização:', error.message)
  console.error('[PRISMA] Stack completo:', error.stack)
  console.error('[PRISMA] Tipo do erro:', error.constructor.name)
  throw error
}

export const prisma = prismaInstance
