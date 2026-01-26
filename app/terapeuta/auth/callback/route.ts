import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/terapeuta/dashboard'

  if (code) {
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

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      const user = session.user
      
      // Registrar/verificar terapeuta via Google
      try {
        const response = await fetch(`${origin}/api/therapist/google-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            googleId: user.id,
            photoUrl: user.user_metadata?.avatar_url,
          }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          // Se é novo usuário ou não completou o perfil, redireciona para completar
          if (data.isNewUser || !data.profileCompleted) {
            return NextResponse.redirect(`${origin}/terapeuta/completar-cadastro`)
          }
          
          // Usuário existente com perfil completo, vai para dashboard
          return NextResponse.redirect(`${origin}/terapeuta/dashboard`)
        }
      } catch (e) {
        console.error('Erro ao processar terapeuta Google:', e)
      }
    }
  }

  // Fallback - redireciona para login em caso de erro
  return NextResponse.redirect(`${origin}/terapeuta/login?error=auth_failed`)
}
