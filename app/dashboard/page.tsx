'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { BarChart3, TrendingUp, Brain, Shield, ArrowRight, Sparkles } from 'lucide-react'

type Analysis = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load analyses
      const res = await fetch('/api/analyses')
      if (res.ok) {
        const data = await res.json()
        setAnalyses(data)
      }

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Logo size="lg" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/account"
              className="text-gray-700 hover:text-purple-600"
            >
              Minha Conta
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-purple-600"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Análises</h1>
          <Link
            href="/dashboard/new"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Nova Análise
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-2xl mx-auto border-2 border-transparent bg-clip-padding relative overflow-hidden">
            {/* Gradiente decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
            
            {/* Ícone principal animado */}
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <BarChart3 className="relative h-16 w-16 text-purple-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pare de se enganar
            </h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Ao invés de análises subjetivas e emocionais, faça uma análise <strong className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">objetiva</strong> com base em estudos e dinâmicas sociais atuais do Tinder.
            </p>
            
            {/* Cards informativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Baseado em Estudos</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-pink-50 border border-pink-100">
                <TrendingUp className="h-8 w-8 text-pink-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Dinâmicas Atuais</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">100% Objetivo</p>
              </div>
            </div>
            
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Analisar Agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/dashboard/analysis/${analysis.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Análise {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Estágio: {analysis.stage.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {analysis.isPaid ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Completo
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Prévia
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
