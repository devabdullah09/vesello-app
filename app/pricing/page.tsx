"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Star, Crown, Zap } from 'lucide-react'
import Link from 'next/link'
import { PricingCard } from '@/components/pricing'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice: number
  features: string[]
  limitations: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
  buttonText: string
  buttonVariant: 'default' | 'secondary' | 'outline'
}

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false)

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for intimate weddings and budget-conscious couples',
      price: 49,
      yearlyPrice: 39,
      features: [
        'Basic invitation system (RSVP only)',
        'Standard photo gallery',
        '7 days access after wedding',
        'Basic customization (colors, fonts)',
        'Email support',
        'Up to 50 guests',
        '1 GB storage'
      ],
      limitations: [
        'No video uploads',
        'No advanced features',
        'Limited customization'
      ],
      icon: <Zap className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      buttonText: 'Get Started',
      buttonVariant: 'outline'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Most popular choice for modern weddings with full features',
      price: 99,
      yearlyPrice: 79,
      features: [
        'All Basic features',
        'Full customization (themes, layouts)',
        'Video gallery support',
        'Wedding timeline & schedule',
        'Menu management',
        'Seating chart',
        '30 days access after wedding',
        'QR code generation',
        'Priority support',
        'Up to 200 guests',
        '10 GB storage'
      ],
      limitations: [],
      popular: true,
      icon: <Star className="w-8 h-8" />,
      color: 'from-amber-500 to-amber-600',
      buttonText: 'Choose Premium',
      buttonVariant: 'default'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Premium weddings with white-label options and unlimited features',
      price: 199,
      yearlyPrice: 159,
      features: [
        'All Premium features',
        'Advanced analytics',
        'Custom domain',
        'White-label options',
        '90 days access after wedding',
        'Unlimited storage',
        'Dedicated support',
        'API access',
        'Custom integrations',
        'Unlimited guests',
        'Priority feature requests'
      ],
      limitations: [],
      icon: <Crown className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      buttonText: 'Go Luxury',
      buttonVariant: 'secondary'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 pt-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-responsive-4xl font-bold text-gray-900 mb-6 font-serif-display">
            Choose Your Perfect Plan
          </h1>
          <p className="text-responsive-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Create unforgettable wedding experiences with our comprehensive suite of tools. 
            From intimate gatherings to grand celebrations, we have the perfect plan for your special day.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              id={plan.id}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              yearlyPrice={plan.yearlyPrice}
              features={plan.features}
              popular={plan.popular}
              icon={plan.icon}
              color={plan.color}
              buttonText={plan.buttonText}
              buttonVariant={plan.buttonVariant}
              isYearly={isYearly}
              onSelect={(planId) => {
                // Handle plan selection - will be connected to Stripe later
                console.log('Selected plan:', planId)
              }}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-serif-display">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers through our secure payment system.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Cancel anytime with no penalties. Your data remains accessible until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif-display">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-6">
              Our wedding experts are here to help you find the perfect plan for your special day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                Contact Support
              </Button>
              <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
