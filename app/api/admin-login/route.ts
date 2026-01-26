import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Email principal do super admin (fallback)
const SUPER_ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin no banco
    let isAdmin = false
    let role = 'ADMIN'
    
    try {
      const admin = await prisma.admin.findUnique({
        where: { email: user.email!, active: true }
      })
      if (admin) {
        isAdmin = true
        role = admin.role
      }
    } catch (e) {
      // Tabela admin pode não existir ainda
    }

    // Fallback: email hardcoded (SUPER_ADMIN)
    if (!isAdmin && user.email === SUPER_ADMIN_EMAIL) {
      isAdmin = true
      role = 'SUPER_ADMIN'
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ 
      isAdmin: true,
      email: user.email,
      role
    })
  } catch (error) {
    console.error('Error in /api/admin-login:', error)
    return NextResponse.json({ error: 'Erro ao verificar acesso' }, { status: 500 })
  }
}
