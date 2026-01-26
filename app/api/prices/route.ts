import { NextResponse } from 'next/server'
import { getSystemConfig } from '@/lib/config'

// Endpoint público para buscar preços do sistema
export async function GET() {
  try {
    const config = await getSystemConfig()

    return NextResponse.json({
      subscription: {
        monthly: config.proPriceMonthly,
        quarterly: config.proPriceQuarterly,
        yearly: config.proPriceYearly,
      },
      credits: {
        single: config.creditPriceSingle,
        pack3: config.creditPricePack3,
        pack5: config.creditPricePack5,
      },
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar preços' },
      { status: 500 }
    )
  }
}
