import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Verify webhook signature (simplified for MVP)
function verifyWebhook(request: NextRequest): boolean {
  // In production, verify Asaas webhook signature
  // For MVP, we'll rely on HTTPS and webhook token
  const token = request.headers.get('asaas-access-token')
  return token === process.env.ASAAS_WEBHOOK_TOKEN
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyWebhook(request)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const event = await request.json()

    // Asaas webhook events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, etc.
    if (event.event === 'PAYMENT_CONFIRMED' || event.event === 'PAYMENT_RECEIVED') {
      const paymentData = event.payment

      // Find payment in our DB
      const payment = await prisma.payment.findFirst({
        where: { externalId: paymentData.id },
        include: { user: true },
      })

      if (!payment) {
        console.warn(`Payment not found: ${paymentData.id}`)
        return NextResponse.json({ received: true })
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CONFIRMED',
        },
      })

      // Update user entitlements
      if (payment.type === 'SUBSCRIPTION') {
        // Set PRO plan until next month
        const proUntil = new Date()
        proUntil.setMonth(proUntil.getMonth() + 1)

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            plan: 'PRO',
            proUntil,
          },
        })

        // Create or update entitlement
        await prisma.entitlement.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId,
            proUntil,
          },
          update: {
            proUntil,
          },
        })
      } else if (payment.type === 'ONE_TIME') {
        // Unlock specific analysis
        // Payment description should contain analysis ID (format: "Desbloquear análise {id}")
        const description = paymentData.description || ''
        const analysisIdMatch = description.match(/análise\s+([a-f0-9-]+)/i)
        
        if (analysisIdMatch) {
          const analysisId = analysisIdMatch[1]
          await prisma.analysis.updateMany({
            where: {
              id: analysisId,
              userId: payment.userId,
            },
            data: {
              isPaid: true,
            },
          })
        }

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            creditsPaid: {
              increment: 1,
            },
          },
        })
      }
    } else if (event.event === 'PAYMENT_OVERDUE' || event.event === 'PAYMENT_REFUNDED') {
      const paymentData = event.payment

      const payment = await prisma.payment.findFirst({
        where: { externalId: paymentData.id },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: event.event === 'PAYMENT_REFUNDED' ? 'REFUNDED' : 'CANCELED',
          },
        })

        // If subscription payment is refunded/canceled, downgrade user
        if (payment.type === 'SUBSCRIPTION') {
          await prisma.user.update({
            where: { id: payment.userId },
            data: {
              plan: 'FREE',
              proUntil: null,
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Asaas webhook:', error)
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 })
  }
}
