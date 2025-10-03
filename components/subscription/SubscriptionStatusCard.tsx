"use client"

import React from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Crown, 
  Zap,
  ExternalLink,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface SubscriptionStatusCardProps {
  userId?: string
  className?: string
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  userId,
  className = ''
}) => {
  const { subscription, features, isLoading, hasAccess, planName, error } = useSubscription(userId)

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-2" />
            Subscription Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic': return <Zap className="w-5 h-5" />
      case 'gold': return <Star className="w-5 h-5" />
      case 'premium': return <Crown className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'from-blue-500 to-blue-600'
      case 'gold': return 'from-amber-500 to-amber-600'
      case 'premium': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'expired': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getActiveFeatures = () => {
    const activeFeatures = []
    if (features.event_info) activeFeatures.push('Event Info')
    if (features.gallery) activeFeatures.push('Photo Gallery')
    if (features.rsvp) activeFeatures.push('RSVP Management')
    if (features.timeline) activeFeatures.push('Wedding Timeline')
    if (features.menu) activeFeatures.push('Menu Management')
    if (features.seating) activeFeatures.push('Seating Chart')
    if (features.analytics) activeFeatures.push('Analytics')
    if (features.custom_domain) activeFeatures.push('Custom Domain')
    if (features.white_label) activeFeatures.push('White Label')
    return activeFeatures
  }

  if (!subscription || !hasAccess) {
    return (
      <Card className={`border-amber-200 bg-gradient-to-br from-amber-50 to-white ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Zap className="w-5 h-5 mr-2 text-amber-600" />
            No Active Subscription
          </CardTitle>
          <CardDescription>
            Unlock the full potential of your wedding app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-100 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm font-medium">
              Choose a plan to access all features
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                View Plans & Pricing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className={`bg-gradient-to-r ${getPlanColor(planName)} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-white/20">
              {getPlanIcon(planName)}
            </div>
            <div>
              <CardTitle className="text-white text-xl capitalize">
                {planName} Plan
              </CardTitle>
              <CardDescription className="text-white/80">
                Active subscription
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(subscription.status)}
              <span className="capitalize">{subscription.status}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Active Features */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Active Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {getActiveFeatures().map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Activated</p>
                <p className="font-medium text-gray-900">
                  {new Date(subscription.activatedAt).toLocaleDateString()}
                </p>
              </div>
              {subscription.expiresAt && (
                <div>
                  <p className="text-gray-500">Expires</p>
                  <p className="font-medium text-gray-900">
                    {new Date(subscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            {planName !== 'premium' && (
              <Link href="/pricing">
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                  Upgrade Plan
                </Button>
              </Link>
            )}
            <Link href="/dashboard/subscription">
              <Button variant="outline" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionStatusCard
