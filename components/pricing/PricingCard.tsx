"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface PricingCardProps {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice?: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
  buttonText: string
  buttonVariant?: 'default' | 'secondary' | 'outline'
  onSelect?: (planId: string) => void
  isYearly?: boolean
  className?: string
}

const PricingCard: React.FC<PricingCardProps> = ({
  id,
  name,
  description,
  price,
  yearlyPrice,
  features,
  popular = false,
  icon,
  color,
  buttonText,
  buttonVariant = 'outline',
  onSelect,
  isYearly = false,
  className = ''
}) => {
  const currentPrice = isYearly && yearlyPrice ? yearlyPrice : price

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        popular 
          ? 'border-amber-500 ring-4 ring-amber-100' 
          : 'border-gray-200 hover:border-amber-300'
      } ${className}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}
      
      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${color} text-white mb-4`}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-gray-900">
              ${currentPrice}
            </span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>
          {isYearly && yearlyPrice && (
            <p className="text-sm text-gray-500 mt-1">
              Billed annually (${yearlyPrice * 12}/year)
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mb-8">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          className={`w-full py-3 text-base font-medium ${
            popular
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              : buttonVariant === 'outline'
              ? 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          size="lg"
          onClick={() => onSelect?.(id)}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

export default PricingCard
