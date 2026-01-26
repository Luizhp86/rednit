'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Crown, Zap } from 'lucide-react'

type SubscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

interface SubscriptionPlansProps {
  onSelect: (period: SubscriptionPeriod) => void
  loading?: boolean
  prices: {
    monthly: number // em centavos
    quarterly: number
    yearly: number
  }
}

export function SubscriptionPlans({ onSelect, loading = false, prices }: SubscriptionPlansProps) {
  const [selected, setSelected] = useState<SubscriptionPeriod | null>(null)

  const plans = [
    {
      id: 'MONTHLY' as SubscriptionPeriod,
      label: 'Mensal',
      period: 'mês',
      price: prices.monthly,
      pricePerMonth: prices.monthly,
      description: 'Renovação mensal',
      popular: false,
    },
    {
      id: 'QUARTERLY' as SubscriptionPeriod,
      label: 'Trimestral',
      period: 'trimestre',
      price: prices.quarterly,
      pricePerMonth: Math.round(prices.quarterly / 3),
      description: '3 meses de acesso',
      discount: 11,
      popular: true,
    },
    {
      id: 'YEARLY' as SubscriptionPeriod,
      label: 'Anual',
      period: 'ano',
      price: prices.yearly,
      pricePerMonth: Math.round(prices.yearly / 12),
      description: '12 meses de acesso',
      discount: 17,
      popular: false,
    },
  ]

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const handleSelect = (period: SubscriptionPeriod) => {
    setSelected(period)
    onSelect(period)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Escolha seu plano PRO
        </h3>
        <p className="text-gray-600">
          Acesso ilimitado a todas as análises e recursos premium
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = selected === plan.id
          const monthlySavings = plan.discount
            ? formatPrice(prices.monthly - plan.pricePerMonth)
            : null

          return (
            <Card
              key={plan.id}
              className={`relative p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 border-purple-500'
                  : 'hover:border-purple-300'
              } ${plan.popular ? 'border-purple-200 bg-purple-50' : ''}`}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Melhor Valor
                  </span>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              )}

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    {plan.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(plan.pricePerMonth)}/mês
                  </div>
                  {plan.discount && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">
                        {formatPrice(prices.monthly)}
                      </span>
                      <span className="text-green-600 font-semibold ml-2">
                        {plan.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {monthlySavings && (
                  <div className="text-sm text-green-600 font-semibold mb-4">
                    Economize {monthlySavings}/mês
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Análises ilimitadas</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Relatórios completos</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {selected && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => handleSelect(selected)}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {loading ? 'Processando...' : `Assinar ${plans.find((p) => p.id === selected)?.label}`}
          </Button>
        </div>
      )}
    </div>
  )
}
