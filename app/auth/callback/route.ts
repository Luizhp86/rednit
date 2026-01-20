import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  console.log('[AUTH CALLBACK] Iniciando callback de autenticação...')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    console.log('[AUTH CALLBACK] Code recebido:', !!code)
    console.log('[AUTH CALLBACK] Next:', next)

    if (code) {
      console.log('[AUTH CALLBACK] Criando cliente Supabase...')
      const supabase = await createClient()
      
      console.log('[AUTH CALLBACK] Trocando code por sessão...')
      const exchangeResult = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeResult.error) {
        console.error('[AUTH CALLBACK] Erro ao trocar code:', exchangeResult.error)
        return NextResponse.json({ error: exchangeResult.error.message }, { status: 400 })
      }

      console.log('[AUTH CALLBACK] Obtendo usuário...')
      // Sync user to our DB
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('[AUTH CALLBACK] Erro ao obter usuário:', userError)
        return NextResponse.json({ error: userError.message }, { status: 400 })
      }

      if (user) {
        console.log('[AUTH CALLBACK] Usuário encontrado:', user.email)
        console.log('[AUTH CALLBACK] Tentando fazer upsert no Prisma...')
        
        try {
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.user_metadata?.full_name || user.email!,
            },
            create: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.email!,
            },
          })
          console.log('[AUTH CALLBACK] Usuário sincronizado com sucesso')
        } catch (prismaError: any) {
          console.error('[AUTH CALLBACK] Erro ao fazer upsert no Prisma:', prismaError.message)
          console.error('[AUTH CALLBACK] Stack:', prismaError.stack)
          console.error('[AUTH CALLBACK] Código do erro:', prismaError.code)
          throw prismaError
        }
      } else {
        console.warn('[AUTH CALLBACK] Usuário não encontrado após autenticação')
      }
    } else {
      console.warn('[AUTH CALLBACK] Nenhum code fornecido')
    }

    console.log('[AUTH CALLBACK] Redirecionando para:', next)
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error: any) {
    console.error('[AUTH CALLBACK] ERRO GERAL:', error.message)
    console.error('[AUTH CALLBACK] Stack:', error.stack)
    console.error('[AUTH CALLBACK] Tipo:', error.constructor.name)
    return NextResponse.json(
      { 
        error: 'Erro ao processar autenticação',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
