'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionPlans } from '@/components/subscription-plans'
import { CreditPackages } from '@/components/credit-packages'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function TestCheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    checkoutUrl?: string
  } | null>(null)

  // Preços padrão para teste
  const prices = {
    subscription: {
      monthly: 2990,
      quarterly: 7990,
      yearly: 29900,
    },
    credits: {
      single: 799,
      pack3: 2490,
      pack5: 3990,
    },
  }

  const handleSubscription = async (period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUBSCRIPTION',
          subscriptionPeriod: period,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.success) {
          // Modo desenvolvimento - sucesso imediato
          setResult({
            success: true,
            message: data.message || 'Assinatura ativada com sucesso!',
          })
        } else if (data.checkoutUrl) {
          // Modo produção - redirecionar para Stripe
          setResult({
            success: true,
            message: 'Redirecionando para o checkout...',
            checkoutUrl: data.checkoutUrl,
          })
          setTimeout(() => {
            window.location.href = data.checkoutUrl
          }, 1500)
        }
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao criar checkout',
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      setResult({
        success: false,
        message: 'Erro ao processar pagamento',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCredits = async (creditPackage: 'SINGLE' | 'PACK_3' | 'PACK_5') => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ONE_TIME',
          creditPackage,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.success) {
          // Modo desenvolvimento - sucesso imediato
          setResult({
            success: true,
            message: data.message || 'Créditos adicionados com sucesso!',
          })
        } else if (data.checkoutUrl) {
          // Modo produção - redirecionar para Stripe
          setResult({
            success: true,
            message: 'Redirecionando para o checkout...',
            checkoutUrl: data.checkoutUrl,
          })
          setTimeout(() => {
            window.location.href = data.checkoutUrl
          }, 1500)
        }
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao criar checkout',
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      setResult({
        success: false,
        message: 'Erro ao processar pagamento',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Teste de Checkout Stripe
          </h1>
          <p className="text-gray-600">
            Página para testar o fluxo de pagamento completo
          </p>
          <div className="mt-4 inline-block bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
            <p className="text-sm text-yellow-800">
              <strong>Modo:</strong> {process.env.NODE_ENV === 'development' ? 'Desenvolvimento (Bypass)' : 'Produção (Stripe Real)'}
            </p>
          </div>
        </div>

        {/* Resultado */}
        {result && (
          <Card className="mb-6 p-6">
            <div className="flex items-center gap-4">
              {result.success ? (
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
                {result.checkoutUrl && (
                  <p className="text-sm text-gray-600 mt-1">
                    URL: <a href={result.checkoutUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {result.checkoutUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <p className="text-gray-700">Processando...</p>
            </div>
          </Card>
        )}

        {/* Assinaturas */}
        <div className="mb-8">
          <SubscriptionPlans
            onSelect={handleSubscription}
            loading={loading}
            prices={prices.subscription}
          />
        </div>

        {/* Créditos */}
        <div className="mb-8">
          <CreditPackages
            onSelect={handleCredits}
            loading={loading}
            prices={prices.credits}
          />
        </div>

        {/* Informações de Teste */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📝 Como Testar
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">Modo Desenvolvimento (Atual)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Clique em qualquer plano ou pacote</li>
                <li>O sistema adiciona créditos/assinatura automaticamente</li>
                <li>Não há cobrança real</li>
                <li>Perfeito para testar a lógica de negócio</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Modo Produção (Stripe Real)</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Mude <code className="bg-gray-200 px-1 rounded">NODE_ENV=production</code> no .env</li>
                <li>Reinicie o servidor</li>
                <li>Clique em qualquer plano</li>
                <li>Você será redirecionado para o Stripe Checkout</li>
                <li>Use cartão de teste: <code className="bg-gray-200 px-1 rounded">4242 4242 4242 4242</code></li>
              </ol>
            </div>

            <div className="bg-white p-4 rounded border border-blue-300">
              <h4 className="font-semibold mb-2">🔗 Links Úteis</h4>
              <ul className="space-y-1">
                <li>
                  <a href="/account" className="text-blue-600 hover:underline">
                    → Página de Conta (produção)
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-blue-600 hover:underline">
                    → Dashboard
                  </a>
                </li>
                <li>
                  <a href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    → Stripe Dashboard (teste) ↗
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
              <h4 className="font-semibold mb-2">⚠️ Webhook Local</h4>
              <p className="mb-2">Para testar webhooks localmente, rode:</p>
              <code className="block bg-gray-800 text-white p-2 rounded text-xs">
                stripe listen --forward-to localhost:3000/api/webhooks/stripe
              </code>
              <p className="mt-2 text-xs text-gray-600">
                Isso encaminha eventos do Stripe para seu servidor local
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
