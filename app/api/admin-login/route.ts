import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email autorizado para acessar o painel admin
const ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é o admin
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ 
      isAdmin: true,
      email: user.email 
    })
  } catch (error) {
    console.error('Error in /api/admin-login:', error)
    return NextResponse.json({ error: 'Erro ao verificar acesso' }, { status: 500 })
  }
}
