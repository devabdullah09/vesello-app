"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Crown, Star, Zap, Calendar, CreditCard, Download, Settings, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { subscriptionService } from '@/lib/subscription-service'
import SubscriptionStatusCard from '@/components/subscription/SubscriptionStatusCard'

interface SubscriptionData {
  plan: 'basic' | 'premium' | 'luxury'
  status: 'active' | 'trial' | 'cancelled' | 'past_due'
  currentPeriodEnd: string
  trialEnd?: string
  usage: {
    guests: { used: number; limit: number }
    storage: { used: number; limit: number }
    photos: { used: number; limit: number }
  }
  nextBillingDate: string
  amount: number
}

const SubscriptionDashboard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined) // This should come from auth context

  // Get real subscription data
  const { subscription, features, isLoading: subscriptionLoading, hasAccess, planName, error } = useSubscription(userId)

  const planDetails = {
    basic: {
      name: 'Basic',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      features: ['RSVP System', 'Photo Gallery', 'Basic Customization', 'Email Support']
    },
    premium: {
      name: 'Premium',
      icon: <Star className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      features: ['All Basic Features', 'Video Gallery', 'Timeline', 'Menu Management', 'Seating Chart', 'QR Codes']
    },
    luxury: {
      name: 'Luxury',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      features: ['All Premium Features', 'Custom Domain', 'White Label', 'Analytics', 'API Access', 'Dedicated Support']
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'trial': return 'Trial'
      case 'cancelled': return 'Cancelled'
      case 'past_due': return 'Payment Required'
      default: return 'Unknown'
    }
  }

  const currentPlan = planDetails[subscriptionData.plan]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif-display">
            Subscription Management
          </h1>
          <p className="text-gray-600">
            Manage your wedding app subscription and billing preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentPlan.icon}
                    <div>
                      <CardTitle className="text-white text-xl">{currentPlan.name} Plan</CardTitle>
                      <CardDescription className="text-amber-100">
                        ${subscriptionData.amount}/month
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(subscriptionData.status)}>
                    {getStatusText(subscriptionData.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Plan Features */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Plan Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Next Billing Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(subscriptionData.nextBillingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium text-gray-900">${subscriptionData.amount}/month</p>
                      </div>
                    </div>
                  </div>

                  {/* Trial Information */}
                  {subscriptionData.status === 'trial' && subscriptionData.trialEnd && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Free Trial Active</p>
                          <p className="text-sm text-blue-700">
                            Your trial ends on {new Date(subscriptionData.trialEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage & Actions Sidebar */}
          <div className="space-y-6">
            {/* Usage Statistics */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Usage Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Guests */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Guests</span>
                    <span className="text-gray-900">
                      {subscriptionData.usage.guests.used}/{subscriptionData.usage.guests.limit === -1 ? '∞' : subscriptionData.usage.guests.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(subscriptionData.usage.guests.used / subscriptionData.usage.guests.limit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Storage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Storage</span>
                    <span className="text-gray-900">
                      {subscriptionData.usage.storage.used}GB/{subscriptionData.usage.storage.limit === -1 ? '∞' : `${subscriptionData.usage.storage.limit}GB`}
                    </span>
                  </div>
                  <Progress 
                    value={(subscriptionData.usage.storage.used / subscriptionData.usage.storage.limit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Photos */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Photos</span>
                    <span className="text-gray-900">
                      {subscriptionData.usage.photos.used}/{subscriptionData.usage.photos.limit === -1 ? '∞' : subscriptionData.usage.photos.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(subscriptionData.usage.photos.used / subscriptionData.usage.photos.limit) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoices
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Billing History
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="shadow-lg border-0 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={subscriptionData.status === 'trial'}
                >
                  Cancel Subscription
                </Button>
                {subscriptionData.status === 'trial' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Cannot cancel during trial period
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-center">Need More Features?</CardTitle>
              <CardDescription className="text-center">
                Upgrade to unlock more powerful features for your wedding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(planDetails).map(([planId, plan]) => {
                  if (planId === subscriptionData.plan) return null
                  
                  return (
                    <div key={planId} className="text-center p-6 border border-gray-200 rounded-lg">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}>
                        {plan.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {plan.features.slice(0, 2).join(', ')}...
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                      >
                        {planId === 'luxury' ? 'Upgrade to Luxury' : `Switch to ${plan.name}`}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionDashboard
