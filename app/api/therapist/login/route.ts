import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'therapist-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = loginSchema.parse(body)
    
    // Buscar terapeuta
    const therapist = await prisma.therapist.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!therapist || !therapist.password) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(validatedData.password, therapist.password)
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }
    
    // Verificar status
    if (therapist.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Seu cadastro ainda está aguardando aprovação' },
        { status: 403 }
      )
    }
    
    if (therapist.status === 'BLOCKED') {
      return NextResponse.json(
        { error: 'Sua conta foi bloqueada. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }
    
    if (therapist.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Sua conta está temporariamente suspensa' },
        { status: 403 }
      )
    }
    
    // Criar JWT token
    const token = await new SignJWT({ 
      therapistId: therapist.id,
      email: therapist.email,
      type: 'therapist'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    // Setar cookie
    const cookieStore = await cookies()
    cookieStore.set('therapist-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    
    return NextResponse.json({
      success: true,
      therapist: {
        id: therapist.id,
        email: therapist.email,
        name: therapist.name,
        type: therapist.type,
        plan: therapist.plan,
        status: therapist.status,
        active: therapist.active,
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
