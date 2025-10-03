"use client"

import React from 'react'
import { Check, X } from 'lucide-react'

interface Feature {
  name: string
  description?: string
  basic: boolean | string
  premium: boolean | string
  luxury: boolean | string
}

interface FeatureComparisonProps {
  features: Feature[]
  className?: string
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({
  features,
  className = ''
}) => {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mx-auto" />
      )
    }
    return <span className="text-sm text-gray-700 text-center">{value}</span>
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Features
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">
                Basic
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-amber-600">
                Premium
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-purple-600">
                Luxury
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features.map((feature, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{feature.name}</div>
                    {feature.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {feature.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {renderFeatureValue(feature.basic)}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderFeatureValue(feature.premium)}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderFeatureValue(feature.luxury)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FeatureComparison
