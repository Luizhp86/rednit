import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSystemConfig } from '@/lib/config'
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe'

type SubscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
type CreditPackage = 'SINGLE' | 'PACK_3' | 'PACK_5'

// Quantidade de créditos por pacote
const CREDITS_BY_PACKAGE: Record<CreditPackage, number> = {
  SINGLE: 1,
  PACK_3: 3,
  PACK_5: 5,
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

    // Obter ou criar cliente Stripe
    const customerId = await getOrCreateStripeCustomer(
      dbUser.email,
      dbUser.name || dbUser.email,
      dbUser.id
    )

    if (type === 'ONE_TIME') {
      // Pagamento avulso - pacote de créditos
      let amountCents: number
      let description: string
      let packageType: CreditPackage
      let credits: number

      if (analysisId) {
        // Desbloquear análise específica (compatibilidade com código antigo)
        amountCents = config.creditPriceSingle
        description = `Desbloquear análise ${analysisId}`
        packageType = 'SINGLE'
        credits = 1
      } else if (creditPackage && ['SINGLE', 'PACK_3', 'PACK_5'].includes(creditPackage)) {
        // Novo sistema de pacotes
        packageType = creditPackage as CreditPackage
        credits = CREDITS_BY_PACKAGE[packageType]
        
        if (packageType === 'SINGLE') {
          amountCents = config.creditPriceSingle
          description = '1 crédito - Desbloquear análise'
        } else if (packageType === 'PACK_3') {
          amountCents = config.creditPricePack3
          description = 'Pacote 3 créditos - Desbloquear análises'
        } else {
          amountCents = config.creditPricePack5
          description = 'Pacote 5 créditos - Desbloquear análises'
        }
      } else {
        return NextResponse.json(
          { error: 'Pacote inválido. Use SINGLE, PACK_3 ou PACK_5' },
          { status: 400 }
        )
      }

      // Criar Stripe Checkout Session para pagamento único
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: description,
                description: `${credits} crédito${credits > 1 ? 's' : ''} para desbloquear análises`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}/dashboard?payment=success`,
        cancel_url: `${appUrl}/account?payment=cancelled`,
        metadata: {
          userId: dbUser.id,
          type: 'ONE_TIME',
          creditPackage: packageType,
          creditsGranted: credits.toString(),
          analysisId: analysisId || '',
        },
      })

      // Salvar registro de pagamento
      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'stripe',
          externalId: session.id,
          status: 'PENDING',
          amountCents: amountCents,
          currency: 'BRL',
          type: 'ONE_TIME',
          creditPackage: packageType,
          creditsGranted: credits,
        },
      })

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      })
    } else if (type === 'SUBSCRIPTION') {
      // Assinatura recorrente
      const period = (subscriptionPeriod || 'MONTHLY') as SubscriptionPeriod
      
      let amountCents: number
      let description: string
      let interval: 'month' | 'year'
      let intervalCount: number

      if (period === 'MONTHLY') {
        amountCents = config.proPriceMonthly
        description = 'Assinatura PRO Mensal'
        interval = 'month'
        intervalCount = 1
      } else if (period === 'QUARTERLY') {
        amountCents = config.proPriceQuarterly
        description = 'Assinatura PRO Trimestral'
        interval = 'month'
        intervalCount = 3
      } else if (period === 'YEARLY') {
        amountCents = config.proPriceYearly
        description = 'Assinatura PRO Anual'
        interval = 'year'
        intervalCount = 1
      } else {
        return NextResponse.json(
          { error: 'Período inválido. Use MONTHLY, QUARTERLY ou YEARLY' },
          { status: 400 }
        )
      }

      // Criar Stripe Checkout Session para assinatura
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: description,
                description: 'Acesso ilimitado a todas as análises',
              },
              unit_amount: amountCents,
              recurring: {
                interval,
                interval_count: intervalCount,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/dashboard?payment=success`,
        cancel_url: `${appUrl}/account?payment=cancelled`,
        metadata: {
          userId: dbUser.id,
          type: 'SUBSCRIPTION',
          subscriptionPeriod: period,
        },
      })

      // Salvar registro de pagamento
      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'stripe',
          externalId: session.id,
          status: 'PENDING',
          amountCents: amountCents,
          currency: 'BRL',
          type: 'SUBSCRIPTION',
          subscriptionPeriod: period,
        },
      })

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
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
