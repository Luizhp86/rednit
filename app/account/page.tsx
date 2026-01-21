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
  plan: string
  creditsFreeDaily: number
  creditsPaid: number
  proUntil: string | null
  stats: {
    totalAnalyses: number
    totalPayments: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [downgrading, setDowngrading] = useState(false)

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

  const handleDowngradePlan = async () => {
    if (!confirm('Tem certeza que deseja voltar ao plano FREE?')) {
      return
    }

    setDowngrading(true)
    try {
      const res = await fetch('/api/downgrade-plan', { method: 'POST' })
      if (res.ok) {
        const userRes = await fetch('/api/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        alert('Seu plano foi alterado para FREE.')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao atualizar plano')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar plano')
    } finally {
      setDowngrading(false)
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
          <Link href="/dashboard">
            <Logo size="lg" />
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
              <p>
                <span className="font-semibold">Plano:</span>{' '}
                <span
                  className={`px-2 py-1 rounded ${
                    user.plan === 'PRO' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.plan}
                </span>
              </p>
              {user.proUntil && (
                <p>
                  <span className="font-semibold">PRO até:</span>{' '}
                  {new Date(user.proUntil).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Estatísticas</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Análises totais:</span> {user.stats.totalAnalyses}
              </p>
              <p>
                <span className="font-semibold">Créditos gratuitos restantes hoje:</span>{' '}
                {user.creditsFreeDaily}
              </p>
              <p>
                <span className="font-semibold">Créditos pagos:</span> {user.creditsPaid}
              </p>
            </div>
          </div>

          {user.plan === 'FREE' && (
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Upgrade para PRO</h3>
              <p className="text-gray-700 mb-4">
                Acesso ilimitado a análises completas e todos os recursos.
              </p>
              <button
                onClick={async () => {
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'SUBSCRIPTION' }),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    window.location.href = data.checkoutUrl
                  }
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Assinar PRO por R$ 29,90/mês
              </button>
            </div>
          )}

          {user.plan === 'PRO' && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Plano PRO ativo</h3>
              <p className="text-gray-700 mb-4">
                Se quiser, voce pode voltar ao plano FREE a qualquer momento.
              </p>
              <button
                onClick={handleDowngradePlan}
                disabled={downgrading}
                className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
              >
                {downgrading ? 'Atualizando...' : 'Voltar ao plano FREE'}
              </button>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Privacidade</h2>
            <div className="space-y-4">
              <button
                onClick={handleDeleteAnalyses}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
              >
                Excluir Todas as Análises
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 block"
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
