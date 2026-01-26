import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { z } from 'zod'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'therapist-secret-key-change-in-production'
)

// Schema para atualização do perfil
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  whatsapp: z.string().min(10).optional(),
  type: z.enum(['TAROLOGO', 'COACH', 'HOLISTICO', 'ASTROLOGO', 'TERAPEUTA_FLORAL', 'CONSTELADOR', 'PSICOLOGO', 'OUTRO']).optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  crp: z.string().optional(),
})

// Função auxiliar para verificar token
async function verifyTherapistToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('therapist-token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (payload.type !== 'therapist' || !payload.therapistId) {
      return null
    }
    
    return payload.therapistId as string
  } catch {
    return null
  }
}

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
        leadsAnalysis: true,
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

/**
 * Atualizar dados do terapeuta logado
 */
export async function PATCH(request: NextRequest) {
  try {
    const therapistId = await verifyTherapistToken()
    
    if (!therapistId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validar dados
    const validatedData = updateProfileSchema.parse(body)
    
    // Verificar se terapeuta existe
    const existingTherapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    })
    
    if (!existingTherapist) {
      return NextResponse.json(
        { error: 'Terapeuta não encontrado' },
        { status: 404 }
      )
    }
    
    // Preparar dados para atualização
    const updateData: any = {}
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.whatsapp !== undefined) updateData.whatsapp = validatedData.whatsapp
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio || null
    if (validatedData.instagram !== undefined) updateData.instagram = validatedData.instagram || null
    if (validatedData.website !== undefined) updateData.website = validatedData.website || null
    if (validatedData.crp !== undefined) updateData.crp = validatedData.crp || null
    
    // Atualizar terapeuta
    const therapist = await prisma.therapist.update({
      where: { id: therapistId },
      data: updateData,
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
        leadsAnalysis: true,
        leadsCta: true,
        createdAt: true,
        approvedAt: true,
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Perfil atualizado com sucesso!',
      therapist 
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
