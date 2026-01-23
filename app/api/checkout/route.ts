import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSystemConfig } from '@/lib/config'

// Asaas API integration
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY!

type SubscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
type CreditPackage = 'SINGLE' | 'PACK_3' | 'PACK_5'

// Mapeamento de períodos para ciclos do Asaas
const SUBSCRIPTION_CYCLES: Record<SubscriptionPeriod, string> = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
}

// Quantidade de créditos por pacote
const CREDITS_BY_PACKAGE: Record<CreditPackage, number> = {
  SINGLE: 1,
  PACK_3: 3,
  PACK_5: 5,
}

async function createAsaasPayment(
  customerId: string,
  amount: number,
  description: string,
  type: 'ONE_TIME' | 'SUBSCRIPTION',
  subscriptionCycle?: string
) {
  const response = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
    },
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX', // Can be PIX, CREDIT_CARD, etc.
      value: amount,
      description,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
      ...(type === 'SUBSCRIPTION' && subscriptionCycle && {
        cycle: subscriptionCycle,
      }),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Asaas API error: ${error}`)
  }

  return response.json()
}

async function getOrCreateAsaasCustomer(email: string, name: string) {
  // First, try to find existing customer
  const searchResponse = await fetch(
    `${ASAAS_API_URL}/customers?email=${encodeURIComponent(email)}`,
    {
      headers: {
        access_token: ASAAS_API_KEY,
      },
    }
  )

  if (searchResponse.ok) {
    const data = await searchResponse.json()
    if (data.data && data.data.length > 0) {
      return data.data[0].id
    }
  }

  // Create new customer
  const createResponse = await fetch(`${ASAAS_API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
    },
    body: JSON.stringify({
      name,
      email,
    }),
  })

  if (!createResponse.ok) {
    const error = await createResponse.text()
    throw new Error(`Failed to create Asaas customer: ${error}`)
  }

  const customer = await createResponse.json()
  return customer.id
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      analysisId, 
      type, // 'ONE_TIME' | 'SUBSCRIPTION'
      creditPackage, // 'SINGLE' | 'PACK_3' | 'PACK_5' (para ONE_TIME)
      subscriptionPeriod, // 'MONTHLY' | 'QUARTERLY' | 'YEARLY' (para SUBSCRIPTION)
    } = body

    const config = await getSystemConfig()

    // Modo desenvolvimento: desbloquear sem pagamento
    if (process.env.NODE_ENV === 'development') {
      if (type === 'ONE_TIME') {
        if (analysisId) {
          // Desbloquear análise específica
          await prisma.analysis.update({
            where: { id: analysisId },
            data: { isPaid: true },
          })
        } else if (creditPackage) {
          // Adicionar créditos
          const credits = CREDITS_BY_PACKAGE[creditPackage as CreditPackage] || 1
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              creditsPaid: {
                increment: credits,
              },
            },
          })
        }
        return NextResponse.json({
          success: true,
          message: 'Créditos adicionados (modo desenvolvimento)',
          unlocked: true,
        })
      } else if (type === 'SUBSCRIPTION') {
        const period = subscriptionPeriod || 'MONTHLY'
        let proUntil = new Date()
        
        if (period === 'MONTHLY') {
          proUntil.setMonth(proUntil.getMonth() + 1)
        } else if (period === 'QUARTERLY') {
          proUntil.setMonth(proUntil.getMonth() + 3)
        } else if (period === 'YEARLY') {
          proUntil.setFullYear(proUntil.getFullYear() + 1)
        }
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            plan: 'PRO',
            proUntil,
          },
        })
        
        return NextResponse.json({
          success: true,
          message: 'Upgrade para PRO realizado (modo desenvolvimento)',
          upgraded: true,
        })
      }
    }

    const customerId = await getOrCreateAsaasCustomer(
      dbUser.email,
      dbUser.name || dbUser.email
    )

    if (type === 'ONE_TIME') {
      // Pagamento avulso - pacote de créditos
      let amount: number
      let description: string
      let packageType: CreditPackage
      let credits: number

      if (analysisId) {
        // Desbloquear análise específica (compatibilidade com código antigo)
        amount = config.creditPriceSingle / 100
        description = `Desbloquear análise ${analysisId}`
        packageType = 'SINGLE'
        credits = 1
      } else if (creditPackage && ['SINGLE', 'PACK_3', 'PACK_5'].includes(creditPackage)) {
        // Novo sistema de pacotes
        packageType = creditPackage as CreditPackage
        credits = CREDITS_BY_PACKAGE[packageType]
        
        if (packageType === 'SINGLE') {
          amount = config.creditPriceSingle / 100
          description = '1 crédito - Desbloquear análise'
        } else if (packageType === 'PACK_3') {
          amount = config.creditPricePack3 / 100
          description = 'Pacote 3 créditos - Desbloquear análises'
        } else {
          amount = config.creditPricePack5 / 100
          description = 'Pacote 5 créditos - Desbloquear análises'
        }
      } else {
        return NextResponse.json(
          { error: 'Pacote inválido. Use SINGLE, PACK_3 ou PACK_5' },
          { status: 400 }
        )
      }

      const payment = await createAsaasPayment(
        customerId,
        amount,
        description,
        'ONE_TIME'
      )

      // Save payment record
      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'asaas',
          externalId: payment.id,
          status: 'PENDING',
          amountCents: Math.round(amount * 100),
          currency: 'BRL',
          type: 'ONE_TIME',
          creditPackage: packageType,
          creditsGranted: credits,
        },
      })

      return NextResponse.json({
        checkoutUrl: payment.invoiceUrl,
        paymentId: payment.id,
      })
    } else if (type === 'SUBSCRIPTION') {
      // Assinatura recorrente
      const period = (subscriptionPeriod || 'MONTHLY') as SubscriptionPeriod
      
      let amount: number
      let description: string
      let cycle: string

      if (period === 'MONTHLY') {
        amount = config.proPriceMonthly / 100
        description = 'Assinatura PRO Mensal'
        cycle = SUBSCRIPTION_CYCLES.MONTHLY
      } else if (period === 'QUARTERLY') {
        amount = config.proPriceQuarterly / 100
        description = 'Assinatura PRO Trimestral'
        cycle = SUBSCRIPTION_CYCLES.QUARTERLY
      } else if (period === 'YEARLY') {
        amount = config.proPriceYearly / 100
        description = 'Assinatura PRO Anual'
        cycle = SUBSCRIPTION_CYCLES.YEARLY
      } else {
        return NextResponse.json(
          { error: 'Período inválido. Use MONTHLY, QUARTERLY ou YEARLY' },
          { status: 400 }
        )
      }

      const payment = await createAsaasPayment(
        customerId,
        amount,
        description,
        'SUBSCRIPTION',
        cycle
      )

      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'asaas',
          externalId: payment.id,
          status: 'PENDING',
          amountCents: Math.round(amount * 100),
          currency: 'BRL',
          type: 'SUBSCRIPTION',
          subscriptionPeriod: period,
        },
      })

      return NextResponse.json({
        checkoutUrl: payment.invoiceUrl,
        paymentId: payment.id,
      })
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error in /api/checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao criar checkout', details: error.message },
      { status: 500 }
    )
  }
}
