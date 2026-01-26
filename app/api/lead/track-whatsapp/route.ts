import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json()
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId é obrigatório' },
        { status: 400 }
      )
    }
    
    // Atualizar lead com timestamp do clique no WhatsApp
    await prisma.lead.update({
      where: { id: leadId },
      data: { whatsappOpenedAt: new Date() }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao registrar clique no WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
