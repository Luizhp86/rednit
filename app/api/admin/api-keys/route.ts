import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email autorizado para acessar o painel admin
const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return user
}

// Função para mascarar uma chave/valor sensível
function maskValue(value: string | undefined): { configured: boolean; masked: string } {
  if (!value || value.trim() === '') {
    return { configured: false, masked: '' }
  }
  
  // Se for muito curta, mascara completamente
  if (value.length <= 8) {
    return { configured: true, masked: '*'.repeat(value.length) }
  }
  
  // Mostra os primeiros 4 e últimos 4 caracteres
  const start = value.substring(0, 4)
  const end = value.substring(value.length - 4)
  const middleLength = Math.min(value.length - 8, 20) // Limita o tamanho do meio
  
  return {
    configured: true,
    masked: `${start}${'*'.repeat(middleLength)}${end}`
  }
}

// GET - Obter status das API keys
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Coletar informações das variáveis de ambiente
    const apiKeys = {
      supabase: {
        name: 'Supabase',
        description: 'Autenticação e banco de dados',
        keys: {
          url: {
            label: 'URL',
            envVar: 'NEXT_PUBLIC_SUPABASE_URL',
            ...maskValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
          },
          anonKey: {
            label: 'Anon Key',
            envVar: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            ...maskValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
          }
        }
      },
      database: {
        name: 'Database',
        description: 'Conexão PostgreSQL',
        keys: {
          url: {
            label: 'Connection String',
            envVar: 'DATABASE_URL',
            ...maskValue(process.env.DATABASE_URL)
          }
        }
      },
      asaas: {
        name: 'Asaas',
        description: 'Gateway de pagamentos',
        keys: {
          apiUrl: {
            label: 'API URL',
            envVar: 'ASAAS_API_URL',
            ...maskValue(process.env.ASAAS_API_URL)
          },
          apiKey: {
            label: 'API Key',
            envVar: 'ASAAS_API_KEY',
            ...maskValue(process.env.ASAAS_API_KEY)
          },
          webhookToken: {
            label: 'Webhook Token',
            envVar: 'ASAAS_WEBHOOK_TOKEN',
            ...maskValue(process.env.ASAAS_WEBHOOK_TOKEN)
          }
        }
      },
      gemini: {
        name: 'Google Gemini',
        description: 'IA para análises',
        keys: {
          apiKey: {
            label: 'API Key',
            envVar: 'GEMINI_API_KEY',
            ...maskValue(process.env.GEMINI_API_KEY)
          }
        }
      },
      sentry: {
        name: 'Sentry',
        description: 'Monitoramento de erros (opcional)',
        optional: true,
        keys: {
          dsn: {
            label: 'DSN',
            envVar: 'NEXT_PUBLIC_SENTRY_DSN',
            ...maskValue(process.env.NEXT_PUBLIC_SENTRY_DSN)
          }
        }
      },
      resend: {
        name: 'Resend',
        description: 'E-mails transacionais (opcional)',
        optional: true,
        keys: {
          apiKey: {
            label: 'API Key',
            envVar: 'RESEND_API_KEY',
            ...maskValue(process.env.RESEND_API_KEY)
          }
        }
      }
    }

    // Calcular resumo
    const services = Object.values(apiKeys)
    const requiredServices = services.filter((s: any) => !s.optional)
    const optionalServices = services.filter((s: any) => s.optional)
    
    const configuredRequired = requiredServices.filter((s: any) => 
      Object.values(s.keys).every((k: any) => k.configured)
    ).length
    
    const configuredOptional = optionalServices.filter((s: any) => 
      Object.values(s.keys).some((k: any) => k.configured)
    ).length

    return NextResponse.json({
      apiKeys,
      summary: {
        required: {
          total: requiredServices.length,
          configured: configuredRequired
        },
        optional: {
          total: optionalServices.length,
          configured: configuredOptional
        }
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/api-keys:', error)
    return NextResponse.json({ error: 'Erro ao buscar API keys', details: error.message }, { status: 500 })
  }
}
