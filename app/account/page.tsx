'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

type UserData = {
  id: string
  email: string
  name: string
  stats: {
    totalAnalyses: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      if (res.ok) {
        router.push('/')
      } else {
        alert('Erro ao excluir conta')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir conta')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAnalyses = async () => {
    if (!confirm('Tem certeza que deseja excluir todas as suas análises? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/analyses', { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        alert(data.message || 'Análises excluídas com sucesso')
        // Reload user data to update the count
        const userRes = await fetch('/api/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        router.push('/dashboard')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao excluir análises')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao excluir análises')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-purple-700">
                Coach de Relacionamentos
              </span>
              <span className="text-xs text-gray-500 hidden md:block">
                Análise objetiva do seu match
              </span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Minha Conta</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nome:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Estatísticas</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Análises realizadas:</span> {user.stats.totalAnalyses}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Privacidade</h2>
            <div className="space-y-4">
              <button
                onClick={handleDeleteAnalyses}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition cursor-pointer"
              >
                Excluir Todas as Análises
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 block cursor-pointer"
              >
                {deleting ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
