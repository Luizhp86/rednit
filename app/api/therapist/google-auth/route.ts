import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTherapistWelcomeEmail } from '@/lib/email'

/**
 * API para autenticação de terapeutas via Google
 * Recebe os dados do usuário Google e cria/atualiza o terapeuta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, googleId, photoUrl } = body
    
    if (!email || !googleId) {
      return NextResponse.json(
        { error: 'Email e Google ID são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar se terapeuta já existe
    let therapist = await prisma.therapist.findUnique({
      where: { email }
    })
    
    if (therapist) {
      // Atualiza o Google ID se ainda não tiver
      if (!therapist.googleId) {
        therapist = await prisma.therapist.update({
          where: { email },
          data: { 
            googleId,
            photoUrl: photoUrl || therapist.photoUrl 
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        isNewUser: false,
        profileCompleted: therapist.profileCompleted,
        therapist: {
          id: therapist.id,
          email: therapist.email,
          name: therapist.name,
          status: therapist.status,
          profileCompleted: therapist.profileCompleted,
        }
      })
    }
    
    // Criar novo terapeuta com Google
    therapist = await prisma.therapist.create({
      data: {
        email,
        name: name || email.split('@')[0],
        googleId,
        photoUrl,
        status: 'PENDING',
        profileCompleted: false,
      }
    })
    
    return NextResponse.json({
      success: true,
      isNewUser: true,
      profileCompleted: false,
      therapist: {
        id: therapist.id,
        email: therapist.email,
        name: therapist.name,
        status: therapist.status,
        profileCompleted: therapist.profileCompleted,
      }
    })
    
  } catch (error) {
    console.error('Erro na autenticação Google do terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
