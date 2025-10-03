"use client"

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface UsageIndicatorProps {
  label: string
  used: number
  limit: number | -1 // -1 means unlimited
  unit?: string
  warningThreshold?: number // Percentage at which to show warning
  className?: string
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  label,
  used,
  limit,
  unit = '',
  warningThreshold = 80,
  className = ''
}) => {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : (used / limit) * 100
  const isNearLimit = percentage >= warningThreshold && !isUnlimited
  const isOverLimit = percentage > 100 && !isUnlimited

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = () => {
    if (isOverLimit) return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (isNearLimit) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const formatValue = (value: number) => {
    if (unit === 'GB' && value >= 1) {
      return `${value.toFixed(1)}GB`
    }
    return `${value}${unit}`
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm text-gray-600">
          {formatValue(used)}
          {!isUnlimited && (
            <>
              {' / '}
              <span className={isOverLimit ? 'text-red-600 font-medium' : ''}>
                {formatValue(limit)}
              </span>
            </>
          )}
        </span>
      </div>
      
      {!isUnlimited && (
        <div className="space-y-1">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
          {isOverLimit && (
            <p className="text-xs text-red-600 font-medium">
              Over limit by {formatValue(used - limit)}
            </p>
          )}
          {isNearLimit && !isOverLimit && (
            <p className="text-xs text-yellow-600">
              {Math.round(100 - percentage)}% remaining
            </p>
          )}
        </div>
      )}
      
      {isUnlimited && (
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full w-1/4"></div>
        </div>
      )}
    </div>
  )
}

export default UsageIndicator
