import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

type Body = {
  email?: string
  password?: string
  name?: string
}

export async function POST(request: Request) {
  try {
    const { email, password, name }: Body = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuração de admin não encontrada no servidor' },
        { status: 500 }
      )
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const createResult = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || email,
        role: 'admin',
      },
    })

    let userId = createResult.data.user?.id || null

    if (createResult.error) {
      const message = createResult.error.message || ''
      const alreadyExists =
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('exists') ||
        message.toLowerCase().includes('registered')

      if (!alreadyExists) {
        return NextResponse.json({ error: createResult.error.message }, { status: 400 })
      }

      const listResult = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      if (listResult.error) {
        return NextResponse.json({ error: listResult.error.message }, { status: 400 })
      }

      const existingUser = listResult.data.users.find((u) => u.email === email)
      if (!existingUser) {
        return NextResponse.json({ error: 'Usuário admin não encontrado' }, { status: 404 })
      }

      userId = existingUser.id
      const updateResult = await admin.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          full_name: name || existingUser.user_metadata?.full_name || email,
          role: 'admin',
        },
      })

      if (updateResult.error) {
        return NextResponse.json({ error: updateResult.error.message }, { status: 400 })
      }
    }

    if (userId) {
      await prisma.user.upsert({
        where: { email },
        update: {
          name: name || email,
        },
        create: {
          id: userId,
          email,
          name: name || email,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in /api/admin-login:', error)
    return NextResponse.json({ error: 'Erro ao preparar login admin' }, { status: 500 })
  }
}
