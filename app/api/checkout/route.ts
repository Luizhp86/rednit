import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Asaas API integration
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY!

async function createAsaasPayment(
  customerId: string,
  amount: number,
  description: string,
  type: 'ONE_TIME' | 'SUBSCRIPTION'
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
      ...(type === 'SUBSCRIPTION' && {
        cycle: 'MONTHLY',
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
    const { analysisId, type } = body // type: 'UNLOCK' | 'SUBSCRIPTION'

    if (type === 'UNLOCK' && analysisId) {
      // Unlock single analysis
      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
      })

      if (!analysis || analysis.userId !== dbUser.id) {
        return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
      }

      if (analysis.isPaid) {
        return NextResponse.json({ error: 'Análise já desbloqueada' }, { status: 400 })
      }

      // In development, unlock directly without payment
      if (process.env.NODE_ENV === 'development') {
        console.log('[CHECKOUT] Modo desenvolvimento: desbloqueando análise sem pagamento')
        await prisma.analysis.update({
          where: { id: analysisId },
          data: { isPaid: true },
        })
        return NextResponse.json({
          success: true,
          message: 'Análise desbloqueada (modo desenvolvimento)',
          unlocked: true,
        })
      }

      const customerId = await getOrCreateAsaasCustomer(
        dbUser.email,
        dbUser.name || dbUser.email
      )

      const payment = await createAsaasPayment(
        customerId,
        9.90, // R$ 9.90 to unlock
        `Desbloquear análise ${analysisId}`,
        'ONE_TIME'
      )

      // Save payment record
      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'asaas',
          externalId: payment.id,
          status: 'PENDING',
          amountCents: 990,
          currency: 'BRL',
          type: 'ONE_TIME',
        },
      })

      return NextResponse.json({
        checkoutUrl: payment.invoiceUrl,
        paymentId: payment.id,
      })
    } else if (type === 'SUBSCRIPTION') {
      // Monthly subscription
      
      // In development, upgrade directly without payment
      if (process.env.NODE_ENV === 'development') {
        console.log('[CHECKOUT] Modo desenvolvimento: upgrade para PRO sem pagamento')
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            plan: 'PRO',
            proUntil: nextMonth,
          },
        })
        
        return NextResponse.json({
          success: true,
          message: 'Upgrade para PRO realizado (modo desenvolvimento)',
          upgraded: true,
        })
      }

      const customerId = await getOrCreateAsaasCustomer(
        dbUser.email,
        dbUser.name || dbUser.email
      )

      const payment = await createAsaasPayment(
        customerId,
        29.90, // R$ 29.90/month
        'Assinatura rednit PRO',
        'SUBSCRIPTION'
      )

      await prisma.payment.create({
        data: {
          userId: dbUser.id,
          provider: 'asaas',
          externalId: payment.id,
          status: 'PENDING',
          amountCents: 2990,
          currency: 'BRL',
          type: 'SUBSCRIPTION',
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
