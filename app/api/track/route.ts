import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Gerar ou recuperar sessionId de cookie
function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get('session_id')
  if (sessionCookie) {
    return sessionCookie.value
  }
  // Gerar novo sessionId
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, eventData, page, duration, journeyType } = body

    if (!eventType) {
      return NextResponse.json({ error: 'eventType é obrigatório' }, { status: 400 })
    }

    // Obter usuário autenticado (se houver)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true }
        })
        userId = dbUser?.id || null
      }
    } catch (error) {
      // Usuário não autenticado ou erro - continua sem userId
    }

    const sessionId = getSessionId(request)

    // Extrair informações do request
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      request.headers.get('x-real-ip') || 
                      undefined
    const referrer = request.headers.get('referer') || undefined

    // Registrar evento com o novo modelo
    await prisma.userActivityLog.create({
      data: {
        journeyType: journeyType || 'LEAD', // Default para LEAD se não especificado
        userId,
        sessionId,
        eventType,
        eventData: eventData || null,
        page: page || null,
        referrer,
        userAgent,
        ipAddress,
        duration: duration || null,
      },
    })

    const response = NextResponse.json({ success: true })
    
    // Definir cookie de sessão se não existir
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 ano
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return response
  } catch (error: any) {
    console.error('Error in /api/track:', error)
    // Não retornar erro para o cliente - tracking falha silenciosamente
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
