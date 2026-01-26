import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendTherapistWelcomeEmail } from '@/lib/email'

const completeProfileSchema = z.object({
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  type: z.enum(['TAROLOGO', 'COACH', 'HOLISTICO', 'ASTROLOGO', 'TERAPEUTA_FLORAL', 'CONSTELADOR', 'PSICOLOGO', 'OUTRO']),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  crp: z.string().optional(),
})

/**
 * API para completar o perfil do terapeuta após login com Google
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = completeProfileSchema.parse(body)
    
    // Buscar terapeuta
    const existingTherapist = await prisma.therapist.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!existingTherapist) {
      return NextResponse.json(
        { error: 'Terapeuta não encontrado' },
        { status: 404 }
      )
    }
    
    // Se já completou o perfil, não permite alterar por aqui
    if (existingTherapist.profileCompleted) {
      return NextResponse.json(
        { error: 'Perfil já foi completado. Use a área de configurações para editar.' },
        { status: 400 }
      )
    }
    
    // Atualizar terapeuta
    const therapist = await prisma.therapist.update({
      where: { email: validatedData.email },
      data: {
        whatsapp: validatedData.whatsapp,
        type: validatedData.type,
        bio: validatedData.bio || null,
        instagram: validatedData.instagram || null,
        website: validatedData.website || null,
        crp: validatedData.crp || null,
        profileCompleted: true,
      }
    })
    
    // Enviar email de boas-vindas
    await sendTherapistWelcomeEmail({
      email: therapist.email,
      name: therapist.name,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Perfil completado com sucesso! Aguarde a aprovação do administrador.',
      therapist: {
        id: therapist.id,
        email: therapist.email,
        name: therapist.name,
        status: therapist.status,
        profileCompleted: therapist.profileCompleted,
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao completar perfil do terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
