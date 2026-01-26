import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendTherapistWelcomeEmail } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  type: z.enum(['TAROLOGO', 'COACH', 'HOLISTICO', 'ASTROLOGO', 'TERAPEUTA_FLORAL', 'CONSTELADOR', 'PSICOLOGO', 'OUTRO']),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  crp: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = registerSchema.parse(body)
    
    // Verificar se email já existe
    const existingTherapist = await prisma.therapist.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingTherapist) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Criar terapeuta
    const therapist = await prisma.therapist.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        whatsapp: validatedData.whatsapp,
        type: validatedData.type,
        bio: validatedData.bio || null,
        instagram: validatedData.instagram || null,
        website: validatedData.website || null,
        crp: validatedData.crp || null,
        status: 'PENDING', // Aguardando aprovação do admin
      }
    })
    
    // Enviar email de boas-vindas
    await sendTherapistWelcomeEmail({
      email: therapist.email,
      name: therapist.name,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
      therapist: {
        id: therapist.id,
        email: therapist.email,
        name: therapist.name,
        status: therapist.status,
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao cadastrar terapeuta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
