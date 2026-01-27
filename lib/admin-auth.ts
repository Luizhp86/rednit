import { prisma } from '@/lib/prisma'

// Email do super admin (fallback)
const SUPER_ADMIN_EMAIL = 'luizhenrique.pinotti@gmail.com'

/**
 * Verifica se um email é de um admin ativo
 * Inclui fallback para super admin hardcoded
 */
export async function isAdminEmail(email: string | undefined | null): Promise<boolean> {
  if (!email) return false

  // Verificar na tabela Admin
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin && admin.active) {
      return true
    }
  } catch {
    // Tabela pode não existir
  }

  // Fallback: super admin
  if (email === SUPER_ADMIN_EMAIL) {
    return true
  }

  return false
}

/**
 * Retorna informações do admin se for um admin ativo
 */
export async function getAdminInfo(email: string | undefined | null): Promise<{
  isAdmin: boolean
  role: string
  email: string
} | null> {
  if (!email) return null

  // Verificar na tabela Admin
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin && admin.active) {
      return {
        isAdmin: true,
        role: admin.role,
        email: admin.email
      }
    }
  } catch {
    // Tabela pode não existir
  }

  // Fallback: super admin
  if (email === SUPER_ADMIN_EMAIL) {
    return {
      isAdmin: true,
      role: 'SUPER_ADMIN',
      email
    }
  }

  return null
}
