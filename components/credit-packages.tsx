'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles } from 'lucide-react'

type CreditPackage = 'SINGLE' | 'PACK_3' | 'PACK_5'

interface CreditPackagesProps {
  onSelect: (packageType: CreditPackage) => void
  loading?: boolean
  prices: {
    single: number // em centavos
    pack3: number
    pack5: number
  }
}

export function CreditPackages({ onSelect, loading = false, prices }: CreditPackagesProps) {
  const [selected, setSelected] = useState<CreditPackage | null>(null)

  const packages = [
    {
      id: 'SINGLE' as CreditPackage,
      credits: 1,
      price: prices.single,
      pricePerCredit: prices.single,
      label: '1 Crédito',
      description: 'Desbloqueie 1 análise',
      popular: false,
    },
    {
      id: 'PACK_3' as CreditPackage,
      credits: 3,
      price: prices.pack3,
      pricePerCredit: Math.round(prices.pack3 / 3),
      label: 'Pacote 3',
      description: 'Desbloqueie 3 análises',
      discount: 16,
      popular: true,
    },
    {
      id: 'PACK_5' as CreditPackage,
      credits: 5,
      price: prices.pack5,
      pricePerCredit: Math.round(prices.pack5 / 5),
      label: 'Pacote 5',
      description: 'Desbloqueie 5 análises',
      discount: 19,
      popular: false,
    },
  ]

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const handleSelect = (packageType: CreditPackage) => {
    setSelected(packageType)
    onSelect(packageType)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Escolha seu pacote de créditos
        </h3>
        <p className="text-gray-600">
          Cada crédito desbloqueia uma análise completa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isSelected = selected === pkg.id
          const savings = pkg.discount
            ? formatPrice(prices.single * pkg.credits - pkg.price)
            : null

          return (
            <Card
              key={pkg.id}
              className={`relative p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 border-purple-500'
                  : 'hover:border-purple-300'
              } ${pkg.popular ? 'border-purple-200 bg-purple-50' : ''}`}
              onClick={() => handleSelect(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Mais Popular
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
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">
                    {pkg.credits}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {pkg.label}
                </h4>

                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(pkg.price)}
                  </div>
                  {pkg.discount && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">
                        {formatPrice(prices.single * pkg.credits)}
                      </span>
                      <span className="text-green-600 font-semibold ml-2">
                        {pkg.discount}% OFF
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPrice(pkg.pricePerCredit)} por crédito
                  </div>
                </div>

                {savings && (
                  <div className="text-sm text-green-600 font-semibold mb-4">
                    Economize {savings}
                  </div>
                )}
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
            {loading ? 'Processando...' : `Comprar ${packages.find((p) => p.id === selected)?.label}`}
          </Button>
        </div>
      )}
    </div>
  )
}
