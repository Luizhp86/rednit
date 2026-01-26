import { NextResponse } from 'next/server'
import { getSystemConfig } from '@/lib/config'

// Endpoint público para buscar preços do sistema
// Nota: Monetização agora é somente por assinaturas (mensal, trimestral, anual)
export async function GET() {
  try {
    const config = await getSystemConfig()

    return NextResponse.json({
      subscription: {
        monthly: config.proPriceMonthly,
        quarterly: config.proPriceQuarterly,
        yearly: config.proPriceYearly,
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
