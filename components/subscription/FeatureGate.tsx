"use client"

import React from 'react'
import { useFeatureAccess } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Star, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

interface FeatureGateProps {
  children: React.ReactNode
  feature: string
  userId?: string
  fallback?: React.ReactNode
  showUpgrade?: boolean
  requiredPlan?: 'basic' | 'gold' | 'premium'
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  userId,
  fallback,
  showUpgrade = true,
  requiredPlan
}) => {
  const { hasAccess, isLoading, error } = useFeatureAccess(userId, feature)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">Error checking feature access: {error}</p>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgrade) {
    return null
  }

  return <UpgradePrompt feature={feature} requiredPlan={requiredPlan} />
}

interface UpgradePromptProps {
  feature: string
  requiredPlan?: 'basic' | 'gold' | 'premium'
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, requiredPlan }) => {
  const getFeatureInfo = (feature: string) => {
    const featureMap: Record<string, { name: string; description: string; icon: React.ReactNode; plan: string }> = {
      gallery: {
        name: 'Photo Gallery',
        description: 'Upload and share wedding photos with your guests',
        icon: <Star className="w-6 h-6" />,
        plan: 'Gold Plan'
      },
      rsvp: {
        name: 'RSVP Management',
        description: 'Collect guest responses and manage attendance',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      },
      timeline: {
        name: 'Wedding Timeline',
        description: 'Create and share your wedding day schedule',
        icon: <Star className="w-6 h-6" />,
        plan: 'Gold Plan'
      },
      menu: {
        name: 'Menu Management',
        description: 'Display wedding menu and collect meal preferences',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      },
      seating: {
        name: 'Seating Chart',
        description: 'Create interactive seating arrangements',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      },
      analytics: {
        name: 'Advanced Analytics',
        description: 'Track engagement and get detailed insights',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      },
      custom_domain: {
        name: 'Custom Domain',
        description: 'Use your own domain for your wedding website',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      },
      white_label: {
        name: 'White Label',
        description: 'Remove branding and customize completely',
        icon: <Crown className="w-6 h-6" />,
        plan: 'Premium Plan'
      }
    }

    return featureMap[feature] || {
      name: 'Premium Feature',
      description: 'This feature requires a premium subscription',
      icon: <Lock className="w-6 h-6" />,
      plan: requiredPlan ? `${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan` : 'Premium Plan'
    }
  }

  const featureInfo = getFeatureInfo(feature)

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white mb-4">
          {featureInfo.icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">{featureInfo.name}</CardTitle>
        <CardDescription className="text-gray-600">
          {featureInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-amber-100 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 font-medium">
            Available with {featureInfo.plan}
          </p>
        </div>
        
        <div className="space-y-2">
          <Link href="/pricing">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
              Upgrade Now
            </Button>
          </Link>
          <p className="text-xs text-gray-500">
            Unlock this feature and many more
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeatureGate
