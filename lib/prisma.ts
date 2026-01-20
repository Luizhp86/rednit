import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log('[PRISMA] Inicializando Prisma Client...')
console.log('[PRISMA] DATABASE_URL existe:', !!process.env.DATABASE_URL)
console.log('[PRISMA] DATABASE_URL formato:', process.env.DATABASE_URL?.substring(0, 50) || 'não definido')

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
  console.log('[PRISMA] Criando adapter PostgreSQL...')
  console.log('[PRISMA] URL (mascarada):', databaseUrl.replace(/:[^:@]+@/, ':****@'))
  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      // Configurações de timeout e retry para melhorar resiliência
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10,
    })
    adapter = new PrismaPg(pool)
    console.log('[PRISMA] Adapter criado com sucesso')
    
    // Testar conexão em modo desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      pool.query('SELECT 1').then(() => {
        console.log('[PRISMA] Conexão com banco testada com sucesso')
      }).catch((err) => {
        console.warn('[PRISMA] AVISO: Não foi possível conectar ao banco:', err.message)
        console.warn('[PRISMA] Se o banco Supabase estiver pausado, vá ao dashboard e reative-o')
        console.warn('[PRISMA] A aplicação continuará funcionando, mas operações de banco falharão')
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

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance
  
  console.log('[PRISMA] PrismaClient criado com sucesso')
} catch (error: any) {
  console.error('[PRISMA] ERRO CRÍTICO na inicialização:', error.message)
  console.error('[PRISMA] Stack completo:', error.stack)
  console.error('[PRISMA] Tipo do erro:', error.constructor.name)
  throw error
}

export const prisma = prismaInstance
