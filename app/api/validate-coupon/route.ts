import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode } = body

    if (!couponCode) {
      return NextResponse.json(
        { error: 'Código do cupom é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar cupom no Stripe
    try {
      const coupon = await stripe.coupons.retrieve(couponCode.toLowerCase())

      if (!coupon.valid) {
        return NextResponse.json(
          { error: 'Cupom expirado ou inválido' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        valid: true,
        coupon: {
          id: coupon.id,
          percentOff: coupon.percent_off,
          amountOff: coupon.amount_off,
          name: coupon.name,
        },
      })
    } catch {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { error: 'Erro ao validar cupom', details: error.message },
      { status: 500 }
    )
  }
}
