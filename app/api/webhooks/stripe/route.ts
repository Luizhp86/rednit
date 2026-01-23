import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Desabilitar o body parser do Next.js para webhooks
export const runtime = 'nodejs'

// Types estendidos para compatibilidade com webhooks do Stripe
type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription
}

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number
  current_period_start: number
}

// Helper para extrair subscription ID de forma segura
function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  // Em webhooks, o Stripe pode incluir subscription mesmo que o tipo não declare
  const invoiceWithSub = invoice as InvoiceWithSubscription
  const subscription = invoiceWithSub.subscription
  
  if (!subscription) return null
  
  // subscription pode ser string (ID) ou objeto expandido Stripe.Subscription
  if (typeof subscription === 'string') {
    return subscription
  }
  
  // Se for objeto Stripe.Subscription, tem propriedade id
  if (typeof subscription === 'object' && 'id' in subscription) {
    return subscription.id
  }
  
  return null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    console.error('Stripe webhook: Missing signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verificar a assinatura do webhook
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET não configurado')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`Stripe webhook received: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  const metadata = session.metadata
  if (!metadata || !metadata.userId) {
    console.error('Missing metadata in session:', session.id)
    return
  }

  const { userId, type } = metadata

  // Buscar pagamento no banco
  const payment = await prisma.payment.findFirst({
    where: { externalId: session.id },
  })

  if (!payment) {
    console.error('Payment not found for session:', session.id)
    return
  }

  // Atualizar status do pagamento
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'CONFIRMED' },
  })

  if (type === 'ONE_TIME') {
    // Pagamento de créditos
    const creditsGranted = parseInt(metadata.creditsGranted || '1')
    const analysisId = metadata.analysisId

    // Adicionar créditos ao usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        creditsPaid: {
          increment: creditsGranted,
        },
      },
    })

    // Se for para análise específica (compatibilidade), desbloquear
    if (analysisId) {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { isPaid: true },
      })
    }

    console.log(`Adicionados ${creditsGranted} créditos ao usuário ${userId}`)
  } else if (type === 'SUBSCRIPTION') {
    // Assinatura
    const subscriptionPeriod = metadata.subscriptionPeriod || 'MONTHLY'
    let proUntil = new Date()

    if (subscriptionPeriod === 'MONTHLY') {
      proUntil.setMonth(proUntil.getMonth() + 1)
    } else if (subscriptionPeriod === 'QUARTERLY') {
      proUntil.setMonth(proUntil.getMonth() + 3)
    } else if (subscriptionPeriod === 'YEARLY') {
      proUntil.setFullYear(proUntil.getFullYear() + 1)
    }

    // Atualizar usuário para PRO
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'PRO',
        proUntil,
      },
    })

    // Criar ou atualizar Entitlement
    await prisma.entitlement.upsert({
      where: { userId },
      create: {
        userId,
        proUntil,
      },
      update: {
        proUntil,
      },
    })

    console.log(`Usuário ${userId} atualizado para PRO até ${proUntil}`)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Processing invoice.paid:', invoice.id)

  // Renovação de assinatura - extrair subscription ID de forma segura
  const subscriptionId = getSubscriptionId(invoice)
  
  if (!subscriptionId) {
    console.log('Invoice não está associado a uma subscription, ignorando')
    return
  }

  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
  // Na versão 20 do Stripe SDK, retrieve retorna Response<Subscription>
  const subscription = subscriptionResponse as unknown as SubscriptionWithPeriod

  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Calcular nova data de expiração baseado no período do Stripe (Unix timestamp)
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'PRO',
      proUntil: currentPeriodEnd,
    },
  })

  await prisma.entitlement.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      proUntil: currentPeriodEnd,
    },
    update: {
      proUntil: currentPeriodEnd,
    },
  })

  console.log(`Assinatura renovada para usuário ${user.id} até ${currentPeriodEnd}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id)

  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Fazer downgrade para FREE
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE',
      proUntil: null,
    },
  })

  await prisma.entitlement.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      proUntil: null,
    },
    update: {
      proUntil: null,
    },
  })

  console.log(`Usuário ${user.id} foi downgrade para FREE`)
}

async function handleSubscriptionUpdated(subscriptionData: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscriptionData.id)

  // Garantir que temos o tipo correto de Subscription com período
  const subscription = subscriptionData as SubscriptionWithPeriod

  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Atualizar data de expiração baseado no período do Stripe (Unix timestamp)
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  if (subscription.status === 'active') {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'PRO',
        proUntil: currentPeriodEnd,
      },
    })

    await prisma.entitlement.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        proUntil: currentPeriodEnd,
      },
      update: {
        proUntil: currentPeriodEnd,
      },
    })

    console.log(`Assinatura atualizada para usuário ${user.id}`)
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    // Downgrade para FREE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        proUntil: null,
      },
    })

    console.log(`Usuário ${user.id} foi downgrade para FREE (status: ${subscription.status})`)
  }
}
