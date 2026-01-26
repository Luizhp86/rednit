'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Sparkles, Tag, Loader2 } from 'lucide-react'

type CreditPackage = 'SINGLE' | 'PACK_3' | 'PACK_5'

interface CreditPackagesProps {
  onSelect: (packageType: CreditPackage, couponCode?: string) => void
  loading?: boolean
  prices: {
    single: number // em centavos
    pack3: number
    pack5: number
  }
}

export function CreditPackages({ onSelect, loading = false, prices }: CreditPackagesProps) {
  const [selected, setSelected] = useState<CreditPackage | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; percentOff: number } | null>(null)

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
  }

  const handleBuy = () => {
    if (selected) {
      onSelect(selected, appliedCoupon ? appliedCoupon.id : undefined)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')
    setCouponValid(null)

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setCouponValid(true)
        setAppliedCoupon({
          id: data.coupon.id,
          percentOff: data.coupon.percentOff,
        })
      } else {
        setCouponValid(false)
        setCouponError(data.error || 'Cupom inválido')
        setAppliedCoupon(null)
      }
    } catch {
      setCouponValid(false)
      setCouponError('Erro ao validar cupom')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponValid(null)
    setCouponError('')
    setAppliedCoupon(null)
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

      {/* Campo de Cupom */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Tem um cupom de desconto?</span>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={couponLoading || !!appliedCoupon}
            className="flex-1"
          />
          {!appliedCoupon ? (
            <Button
              onClick={validateCoupon}
              disabled={couponLoading || !couponCode.trim()}
              variant="outline"
              className="shrink-0"
            >
              {couponLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Aplicar'
              )}
            </Button>
          ) : (
            <Button
              onClick={removeCoupon}
              variant="outline"
              className="shrink-0 text-red-600 hover:text-red-700"
            >
              Remover
            </Button>
          )}
        </div>

        {couponError && (
          <p className="text-sm text-red-600 mt-2">{couponError}</p>
        )}

        {appliedCoupon && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {appliedCoupon.percentOff === 100 
                ? 'Cupom aplicado: 1 mês de PRO grátis!'
                : `Cupom aplicado: ${appliedCoupon.percentOff}% de desconto`}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleBuy}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {loading ? 'Processando...' : appliedCoupon?.percentOff === 100 
              ? 'Ativar 1 Mês PRO GRÁTIS'
              : `Comprar ${packages.find((p) => p.id === selected)?.label}`}
          </Button>
          {appliedCoupon?.percentOff === 100 && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Cupom válido! Você receberá 1 mês de acesso PRO ilimitado!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
