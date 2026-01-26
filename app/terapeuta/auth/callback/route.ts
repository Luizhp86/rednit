import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'therapist-secret-key-change-in-production'
)

// Função auxiliar para criar o token JWT do terapeuta
async function createTherapistToken(therapistId: string, email: string) {
  return await new SignJWT({ 
    therapistId,
    email,
    type: 'therapist'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('[TERAPEUTA AUTH CALLBACK] Iniciando callback, code:', !!code)

  if (!code) {
    console.error('[TERAPEUTA AUTH CALLBACK] Código não encontrado')
    return NextResponse.redirect(`${origin}/terapeuta/login?error=no_code`)
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('[TERAPEUTA AUTH CALLBACK] Erro ao trocar código por sessão:', sessionError)
      return NextResponse.redirect(`${origin}/terapeuta/login?error=session_error`)
    }

    if (!session?.user) {
      console.error('[TERAPEUTA AUTH CALLBACK] Sessão ou usuário não encontrado')
      return NextResponse.redirect(`${origin}/terapeuta/login?error=no_session`)
    }

    const user = session.user
    console.log('[TERAPEUTA AUTH CALLBACK] Usuário autenticado:', user.email)

    // Verificar/criar terapeuta diretamente no banco (sem fetch)
    let therapist = await prisma.therapist.findUnique({
      where: { email: user.email! }
    })

    if (therapist) {
      console.log('[TERAPEUTA AUTH CALLBACK] Terapeuta existente encontrado:', therapist.id)
      
      // Atualiza o Google ID se ainda não tiver
      if (!therapist.googleId) {
        therapist = await prisma.therapist.update({
          where: { email: user.email! },
          data: { 
            googleId: user.id,
            photoUrl: user.user_metadata?.avatar_url || therapist.photoUrl 
          }
        })
        console.log('[TERAPEUTA AUTH CALLBACK] Google ID atualizado')
      }
      
      // Verificar se perfil está realmente completo
      // Considera completo se tem whatsapp E tipo preenchidos (campos obrigatórios)
      const isProfileComplete = therapist.profileCompleted || (therapist.whatsapp && therapist.type)
      
      // Atualiza o campo profileCompleted se necessário
      if (isProfileComplete && !therapist.profileCompleted) {
        await prisma.therapist.update({
          where: { id: therapist.id },
          data: { profileCompleted: true }
        })
        console.log('[TERAPEUTA AUTH CALLBACK] profileCompleted atualizado para true')
      }
      
      // Se perfil não está completo, redireciona para completar
      if (!isProfileComplete) {
        console.log('[TERAPEUTA AUTH CALLBACK] Perfil incompleto, redirecionando para completar')
        return NextResponse.redirect(`${origin}/terapeuta/completar-cadastro`)
      }
      
      // Criar token JWT para o terapeuta
      const token = await createTherapistToken(therapist.id, therapist.email)
      
      // Criar resposta de redirecionamento com o cookie
      const response = NextResponse.redirect(`${origin}/terapeuta/dashboard`)
      response.cookies.set('therapist-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      })
      
      console.log('[TERAPEUTA AUTH CALLBACK] Login bem sucedido, token criado, redirecionando para dashboard')
      return response
    }

    // Criar novo terapeuta
    console.log('[TERAPEUTA AUTH CALLBACK] Criando novo terapeuta')
    therapist = await prisma.therapist.create({
      data: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
        googleId: user.id,
        photoUrl: user.user_metadata?.avatar_url,
        status: 'PENDING',
        profileCompleted: false,
      }
    })

    console.log('[TERAPEUTA AUTH CALLBACK] Novo terapeuta criado:', therapist.id)
    return NextResponse.redirect(`${origin}/terapeuta/completar-cadastro`)

  } catch (error: any) {
    console.error('[TERAPEUTA AUTH CALLBACK] Erro:', error.message)
    console.error('[TERAPEUTA AUTH CALLBACK] Stack:', error.stack)
    return NextResponse.redirect(`${origin}/terapeuta/login?error=callback_error`)
  }
}
