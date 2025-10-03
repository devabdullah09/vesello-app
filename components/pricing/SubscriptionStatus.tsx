"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Calendar,
  CreditCard,
  Crown,
  Star,
  Zap
} from 'lucide-react'

interface SubscriptionStatusProps {
  plan: 'basic' | 'premium' | 'luxury'
  status: 'active' | 'trial' | 'cancelled' | 'past_due'
  currentPeriodEnd: string
  trialEnd?: string
  amount: number
  onUpgrade?: () => void
  onManageBilling?: () => void
  className?: string
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  plan,
  status,
  currentPeriodEnd,
  trialEnd,
  amount,
  onUpgrade,
  onManageBilling,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'trial': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'past_due': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic': return <Zap className="w-5 h-5" />
      case 'premium': return <Star className="w-5 h-5" />
      case 'luxury': return <Crown className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'from-blue-500 to-blue-600'
      case 'premium': return 'from-amber-500 to-amber-600'
      case 'luxury': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const isTrialActive = status === 'trial' && trialEnd
  const daysRemaining = isTrialActive 
    ? Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-white/20`}>
              {getPlanIcon(plan)}
            </div>
            <div>
              <CardTitle className="text-white text-xl capitalize">{plan} Plan</CardTitle>
              <CardDescription className="text-amber-100">
                ${amount}/month
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(status)}
              <span>{getStatusText(status)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Trial Information */}
          {isTrialActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Free Trial Active</p>
                  <p className="text-sm text-blue-700">
                    {daysRemaining && daysRemaining > 0 
                      ? `${daysRemaining} days remaining`
                      : 'Trial ending soon'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Next Billing</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-sm font-medium text-gray-900">${amount}/month</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            {onUpgrade && plan !== 'luxury' && (
              <Button 
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                onClick={onUpgrade}
              >
                Upgrade Plan
              </Button>
            )}
            {onManageBilling && (
              <Button variant="outline" className="flex-1">
                Manage Billing
              </Button>
            )}
          </div>

          {/* Status-specific Messages */}
          {status === 'past_due' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Please update your payment method to continue using the service.
              </p>
            </div>
          )}
          
          {status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Your subscription has been cancelled. Access will end on{' '}
                {new Date(currentPeriodEnd).toLocaleDateString()}.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionStatus
