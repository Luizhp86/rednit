'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/logo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Lock, Sparkles, TrendingUp, Shield, CheckCircle2, AlertTriangle, Eye, Zap, Heart } from 'lucide-react'

type AnalysisResult = {
  id: string
  stage: string
  isPaid: boolean
  createdAt: string
  free_teaser: any & { nome_match?: string }
  premium: (any & { nome_match?: string }) | null
  has_access: boolean
}

export default function AnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)

  const hypothesisLabels: Record<string, string> = {
    EXPLORANDO: 'Explorando possibilidades',
    BUSCA_FIXO: 'Busca relacionamento sério',
    CARENCIA_VALIDACAO: 'Carência por validação',
    RECEM_SAIU_RELACAO: 'Recém saiu de um relacionamento',
    SEM_DISPONIBILIDADE_REAL: 'Sem disponibilidade real',
  }

  const getHypothesisTitle = (hypothesis: any) => {
    if (!hypothesis) return ''
    if (hypothesis.title) return hypothesis.title
    if (hypothesis.key && hypothesisLabels[hypothesis.key]) return hypothesisLabels[hypothesis.key]
    if (hypothesis.key) return hypothesis.key.replace(/_/g, ' ')
    return ''
  }

  useEffect(() => {
    async function loadAnalysis() {
      const res = await fetch(`/api/analyses/${id}`)
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data)
      }
      setLoading(false)
    }
    loadAnalysis()
  }, [id])

  // Mostrar modal de forma recorrente se não tiver acesso premium
  // Primeira vez: 5 segundos, depois: a cada 45 segundos após fechar
  useEffect(() => {
    if (!loading && analysis && !analysis.has_access) {
      // Timer inicial de 5 segundos
      const initialTimer = setTimeout(() => {
        setShowUnlockModal(true)
      }, 5000)
      
      return () => clearTimeout(initialTimer)
    }
  }, [loading, analysis])

  // Timer recorrente quando o modal é fechado
  useEffect(() => {
    if (!loading && analysis && !analysis.has_access && !showUnlockModal) {
      // Se o modal foi fechado, mostrar novamente após 45 segundos
      const recurringTimer = setTimeout(() => {
        setShowUnlockModal(true)
      }, 45000) // 45 segundos
      
      return () => clearTimeout(recurringTimer)
    }
  }, [loading, analysis, showUnlockModal])

  const handleUnlock = async () => {
    setUnlocking(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, type: 'UNLOCK' }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Erro ao criar checkout')
        return
      }

      const data = await res.json()
      
      // In development, unlock directly and reload
      if (data.unlocked || data.success) {
        alert('Análise desbloqueada! (modo desenvolvimento)')
        window.location.reload()
        return
      }
      
      // In production, redirect to payment
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao criar checkout')
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Análise não encontrada</div>
      </div>
    )
  }

  const { free_teaser, premium, has_access } = analysis

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Logo size="lg" />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-purple-600 hover:text-purple-700 mb-4 inline-block"
          >
            ← Voltar para análises
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
          {(analysis as any).avatar_match && (
            <span className="text-4xl">{(analysis as any).avatar_match}</span>
          )}
          {analysis.premium?.nome_match || analysis.free_teaser?.nome_match 
            ? `Análise de ${analysis.premium?.nome_match || analysis.free_teaser?.nome_match}`
            : 'Resultado da Análise'}
        </h1>

        {!has_access && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Desbloqueie sua análise completa</h2>
              </div>
              <p className="text-white/90 text-base mb-6">
                Veja as hipóteses alternativas, o mapa completo de risco e o plano de ação por estágio.
                É aqui que estão as decisões mais inteligentes.
              </p>
              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-white text-purple-700 hover:text-purple-800 font-extrabold py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-6 h-6 mr-2" />
                {unlocking ? 'Processando...' : 'Quero desbloquear agora • R$ 9,90'}
              </Button>
              <p className="text-xs text-white/80 mt-3 text-center">
                Pix e cartão • Acesso imediato • Compra única
              </p>
            </div>
          </div>
        )}

        {/* Free Teaser - Animado e Viciante */}
        {!has_access && (
          <div className="space-y-6 mb-6">
          {/* Headline Impactante com Animações */}
          {free_teaser.headline && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-8 rounded-3xl shadow-2xl text-center"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              />
              
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 bg-white/10 rounded-3xl"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold relative z-10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                {free_teaser.headline}
              </motion.h2>
              
              {/* Floating hearts/sparkles for positive headlines */}
              {free_teaser.headline.includes('💚') && (
                <>
                  <motion.div
                    className="absolute top-2 left-4"
                    animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                  >
                    <Heart className="w-4 h-4 text-pink-300" />
                  </motion.div>
                  <motion.div
                    className="absolute top-4 right-8"
                    animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-4 left-12"
                    animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
                  >
                    <Heart className="w-3 h-3 text-pink-200" />
                  </motion.div>
                </>
              )}
              
              {/* Warning animation for negative headlines */}
              {(free_teaser.headline.includes('⚠️') || free_teaser.headline.includes('🚨')) && (
                <motion.div
                  className="absolute top-3 right-4"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <AlertTriangle className="w-6 h-6 text-yellow-300" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Grid de Cards Instigantes com Animações */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hipótese Principal - Card Animado */}
            {free_teaser.hypothesis_1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                        >
                          <Sparkles className="w-6 h-6 text-blue-600" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-gray-900">Hipótese Principal</h3>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {getHypothesisTitle(free_teaser.hypothesis_1)}
                      </h4>
                      <motion.div 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-200/50 text-sm font-semibold text-blue-800 mb-3"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-blue-600"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                        {free_teaser.hypothesis_1.confidence === 'HIGH' ? 'Alta confiança' : 
                         free_teaser.hypothesis_1.confidence === 'MEDIUM' ? 'Média confiança' : 'Baixa confiança'}
                      </motion.div>
                    </div>
                  </div>
                  <motion.div 
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mt-4 border border-purple-200"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <p className="text-xs text-gray-700 font-semibold flex items-center">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Lock className="w-4 h-4 inline mr-1" />
                      </motion.span>
                      Hipóteses alternativas e análise completa no premium
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            )}

            {/* Score de Risco - Card Animado */}
            {free_teaser.ONE_risk_score && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900">Risco Detectado</h3>
                  </div>
                  <div className="text-center mb-4">
                    <motion.div 
                      className={`text-5xl font-bold mb-2 ${
                        free_teaser.ONE_risk_score.value > 60 ? 'text-red-600' : 
                        free_teaser.ONE_risk_score.value > 40 ? 'text-orange-600' : 'text-yellow-600'
                      }`}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {free_teaser.ONE_risk_score.value}%
                    </motion.div>
                    <p className="text-sm font-semibold text-gray-700">
                      {free_teaser.ONE_risk_score.label}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <motion.div
                      className={`h-4 rounded-full ${
                        free_teaser.ONE_risk_score.value > 70
                          ? 'bg-red-600'
                          : free_teaser.ONE_risk_score.value > 50
                            ? 'bg-orange-600'
                            : 'bg-yellow-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${free_teaser.ONE_risk_score.value}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    />
                  </div>
                  <motion.div 
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <p className="text-xs text-gray-700 font-semibold flex items-center">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Lock className="w-4 h-4 inline mr-1" />
                      </motion.span>
                      Mapa completo de risco disponível no premium
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Flags - Card Animado */}
          {(free_teaser.red_flag || free_teaser.green_flag) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.01, y: -3 }}
            >
              <Card className={`p-6 rounded-3xl border-2 shadow-lg ${
                free_teaser.red_flag 
                  ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
                  : 'border-green-200 bg-gradient-to-br from-green-50 to-green-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {free_teaser.red_flag ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {free_teaser.red_flag?.title || free_teaser.green_flag?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {free_teaser.red_flag?.impact || free_teaser.green_flag?.benefit}
                    </p>
                  </div>
                </div>
                <motion.div 
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mt-4 border border-purple-200"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <p className="text-xs text-gray-700 font-semibold flex items-center">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Lock className="w-4 h-4 inline mr-1" />
                    </motion.span>
                    Todos os flags e análise detalhada no premium
                  </p>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Observe 48h - Card Animado */}
          {free_teaser.observe_48h && free_teaser.observe_48h.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.01, y: -3 }}
            >
              <Card className="p-6 rounded-3xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Eye className="w-6 h-6 text-yellow-600" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900">Próximos Passos</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {free_teaser.observe_48h.slice(0, 1).map((obs: string, idx: number) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + idx * 0.2 }}
                    >
                      <motion.span 
                        className="text-yellow-600 mt-1 font-bold"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        •
                      </motion.span>
                      <p className="text-gray-700 flex-1">{obs}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.div 
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <p className="text-xs text-gray-700 font-semibold flex items-center">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Lock className="w-4 h-4 inline mr-1" />
                    </motion.span>
                    Checklist completo e plano por estágio no premium
                  </p>
                </motion.div>
              </Card>
            </motion.div>
          )}
          </div>
        )}


        {/* Premium Content */}
        {has_access && premium && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sua Análise Completa</h2>

            {/* Executive Summary - Card principal */}
            {premium.executive_summary && premium.executive_summary.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📋 Resumo da Situação
                </h3>
                <ul className="space-y-3">
                  {premium.executive_summary.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-lg">{item.startsWith('✅') || item.startsWith('⚠️') || item.startsWith('🚨') || item.startsWith('🚩') || item.startsWith('💚') ? '' : '•'}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SEÇÃO 1: Mapa de Risco - O MAIS IMPORTANTE */}
            {premium.full_risk_map && (
              <div className="bg-white border-2 border-orange-200 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  🎯 Mapa de Risco
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Risco de Ghosting */}
                  <div className={`p-5 rounded-2xl ${
                    premium.full_risk_map.risco_ghosting > 60 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : premium.full_risk_map.risco_ghosting > 40 
                        ? 'bg-yellow-50 border-2 border-yellow-200' 
                        : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-800">Risco de Ghosting</span>
                      <span className={`text-3xl font-bold ${
                        premium.full_risk_map.risco_ghosting > 60 
                          ? 'text-red-600' 
                          : premium.full_risk_map.risco_ghosting > 40 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {premium.full_risk_map.risco_ghosting}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          premium.full_risk_map.risco_ghosting > 60
                            ? 'bg-red-500'
                            : premium.full_risk_map.risco_ghosting > 40
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_ghosting}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {premium.full_risk_map.risco_ghosting > 60 
                        ? 'Alto risco de sumiço - não invista demais' 
                        : premium.full_risk_map.risco_ghosting > 40 
                          ? 'Risco moderado - observe os padrões' 
                          : 'Baixo risco - comunicação consistente'}
                    </p>
                  </div>

                  {/* Risco de Enrolação */}
                  <div className={`p-5 rounded-2xl ${
                    premium.full_risk_map.risco_enrolacao > 60 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : premium.full_risk_map.risco_enrolacao > 40 
                        ? 'bg-yellow-50 border-2 border-yellow-200' 
                        : 'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-800">Risco de Enrolação</span>
                      <span className={`text-3xl font-bold ${
                        premium.full_risk_map.risco_enrolacao > 60 
                          ? 'text-red-600' 
                          : premium.full_risk_map.risco_enrolacao > 40 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {premium.full_risk_map.risco_enrolacao}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          premium.full_risk_map.risco_enrolacao > 60
                            ? 'bg-red-500'
                            : premium.full_risk_map.risco_enrolacao > 40
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${premium.full_risk_map.risco_enrolacao}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {premium.full_risk_map.risco_enrolacao > 60 
                        ? 'Alto risco de enrolação - defina prazos' 
                        : premium.full_risk_map.risco_enrolacao > 40 
                          ? 'Risco moderado - observe evolução' 
                          : 'Baixo risco - sinais de comprometimento'}
                    </p>
                  </div>
                </div>

                {/* Explicações */}
                {premium.full_risk_map.explanations && premium.full_risk_map.explanations.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-2xl p-4">
                    <p className="font-semibold mb-3 text-gray-800">O que isso significa:</p>
                    <ul className="space-y-2">
                      {premium.full_risk_map.explanations.map((exp: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <span className="mt-1">→</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 2: Compatibilidade com seu objetivo */}
            {premium.compatibility_explained && (
              <div className={`p-6 rounded-3xl shadow-lg border-2 ${
                premium.compatibility_explained.alignment === 'ALINHADO'
                  ? 'bg-green-50 border-green-300'
                  : premium.compatibility_explained.alignment === 'PARCIAL'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-red-50 border-red-300'
              }`}>
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  {premium.compatibility_explained.alignment === 'ALINHADO' 
                    ? '💚' 
                    : premium.compatibility_explained.alignment === 'PARCIAL' 
                      ? '⚠️' 
                      : '🚨'} Compatibilidade com seu Objetivo
                </h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-4xl font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'text-green-600'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {premium.compatibility_explained.score}%
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    premium.compatibility_explained.alignment === 'ALINHADO'
                      ? 'bg-green-200 text-green-800'
                      : premium.compatibility_explained.alignment === 'PARCIAL'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                  }`}>
                    {premium.compatibility_explained.alignment === 'ALINHADO' 
                      ? '✓ Compatível' 
                      : premium.compatibility_explained.alignment === 'PARCIAL' 
                        ? '~ Parcialmente Compatível' 
                        : '✗ Incompatível'}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  {premium.compatibility_explained.explanation}
                </p>
              </div>
            )}

            {/* SEÇÃO 3: Checklist de Validação - AÇÕES PRÁTICAS */}
            {premium.validation_checklist && premium.validation_checklist.length > 0 && (
              <div className="bg-white border-2 border-blue-200 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  ✅ O Que Fazer Agora
                </h3>
                <p className="text-gray-600 mb-4">Marque cada item conforme for observando nas próximas semanas:</p>
                <ul className="space-y-4">
                  {premium.validation_checklist.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-4 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <input 
                        type="checkbox" 
                        className="mt-1 h-5 w-5 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-gray-800 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SEÇÃO 4: Plano por Estágio */}
            {premium.stage_plan && premium.stage_plan.length > 0 && (
              <div className="bg-white border-2 border-purple-200 p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📍 Plano para seu Momento Atual
                </h3>
                {premium.stage_plan.map((plan: any, idx: number) => {
                  const stageLabels: Record<string, string> = {
                    'FIRST_CHAT': 'Primeira Conversa',
                    'TALKING': 'Conversando Regularmente', 
                    'POST_DATE': 'Após Primeiro Encontro'
                  }
                  return (
                    <div key={idx} className="space-y-4">
                      <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-800 font-semibold mb-4">
                        📍 Você está em: {stageLabels[plan.stage] || plan.stage}
                      </div>
                      
                      {plan.actions && plan.actions.length > 0 && (
                        <div className="bg-purple-50 rounded-2xl p-4">
                          <p className="font-bold mb-3 text-gray-800">🎯 Suas próximas ações:</p>
                          <ul className="space-y-2">
                            {plan.actions.map((action: string, aIdx: number) => (
                              <li key={aIdx} className="flex items-start gap-3 text-gray-700">
                                <span className="text-purple-600 font-bold">{aIdx + 1}.</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {plan.metrics && plan.metrics.length > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="font-bold mb-3 text-gray-800">📊 O que observar:</p>
                          <ul className="space-y-2">
                            {plan.metrics.map((metric: string, mIdx: number) => (
                              <li key={mIdx} className="flex items-start gap-2 text-gray-700">
                                <span>•</span>
                                <span>{metric}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* SEÇÃO 5: Hipóteses - Colapsável/Secundária */}
            {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3].filter(Boolean).length > 0 && (
              <details className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
                <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-xl font-bold text-gray-900">
                    🔍 Ver Hipóteses Detalhadas
                  </span>
                  <span className="text-gray-500 ml-2 text-sm">(clique para expandir)</span>
                </summary>
                <div className="p-6 pt-0 space-y-4">
                  {[premium.hypothesis_1, premium.hypothesis_2, premium.hypothesis_3]
                    .filter(Boolean)
                    .map((hypothesis: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <span className="font-bold text-lg text-gray-900">{hypothesis.title || hypothesis.key}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              hypothesis.confidence === 'HIGH'
                                ? 'bg-green-100 text-green-800'
                                : hypothesis.confidence === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {hypothesis.confidence === 'HIGH' ? 'Alta' : hypothesis.confidence === 'MEDIUM' ? 'Média' : 'Baixa'} Confiança
                          </span>
                        </div>
                        {hypothesis.description && (
                          <p className="text-gray-700 mb-4 leading-relaxed">{hypothesis.description}</p>
                        )}
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {hypothesis.observe_to_confirm && hypothesis.observe_to_confirm.length > 0 && (
                            <div className="bg-white p-3 rounded-xl">
                              <p className="font-semibold mb-2 text-green-700">✓ Para confirmar:</p>
                              <ul className="space-y-1 text-gray-600">
                                {hypothesis.observe_to_confirm.slice(0, 2).map((obs: string, oIdx: number) => (
                                  <li key={oIdx}>• {obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {hypothesis.observe_to_refute && hypothesis.observe_to_refute.length > 0 && (
                            <div className="bg-white p-3 rounded-xl">
                              <p className="font-semibold mb-2 text-red-700">✗ Para descartar:</p>
                              <ul className="space-y-1 text-gray-600">
                                {hypothesis.observe_to_refute.slice(0, 2).map((obs: string, oIdx: number) => (
                                  <li key={oIdx}>• {obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        )}

        {!has_access && (
          <div className="mt-10">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Desbloqueie sua análise completa</h2>
              </div>
              <p className="text-white/90 text-base mb-6">
                Veja as hipóteses alternativas, o mapa completo de risco e o plano de ação por estágio.
                É aqui que estão as decisões mais inteligentes.
              </p>
              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-white text-purple-700 hover:text-purple-800 font-extrabold py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-6 h-6 mr-2" />
                {unlocking ? 'Processando...' : 'Quero desbloquear agora • R$ 9,90'}
              </Button>
              <p className="text-xs text-white/80 mt-3 text-center">
                Pix e cartão • Acesso imediato • Compra única
              </p>
            </div>
          </div>
        )}

        {/* Modal de Desbloqueio - Aparece após alguns segundos */}
        {showUnlockModal && !has_access && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all duration-300 scale-100">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Desbloqueie a Análise Completa
                </h3>
                <p className="text-gray-600">
                  Veja insights detalhados que vão te ajudar a tomar decisões mais inteligentes
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Top 3 Hipóteses Completas</div>
                    <div className="text-sm text-gray-600">Com confiança e validação detalhada</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Mapa Completo de Risco</div>
                    <div className="text-sm text-gray-600">Todos os scores explicados</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Checklist de Validação</div>
                    <div className="text-sm text-gray-600">Plano de ação por estágio</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUnlock}
                disabled={unlocking}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
              >
                <Zap className="w-5 h-5 mr-2" />
                {unlocking ? 'Processando...' : 'Desbloquear Agora - R$ 9,90'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  💳 Pix e cartão • ⚡ Acesso imediato • 🔄 Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
