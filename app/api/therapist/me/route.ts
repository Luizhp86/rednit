import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'therapist-secret-key-change-in-production'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('therapist-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (payload.type !== 'therapist' || !payload.therapistId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    // Buscar terapeuta
    const therapist = await prisma.therapist.findUnique({
      where: { id: payload.therapistId as string },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        plan: true,
        whatsapp: true,
        bio: true,
        photoUrl: true,
        instagram: true,
        website: true,
        crp: true,
        status: true,
        active: true,
        subscriptionStatus: true,
        leadsReceived: true,
        leadsThisMonth: true,
        leadsSignup: true,
        leadsCta: true,
        createdAt: true,
        approvedAt: true,
      }
    })
    
    if (!therapist) {
      return NextResponse.json(
        { error: 'Terapeuta não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ therapist })
    
  } catch (error) {
    console.error('Erro ao buscar terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
