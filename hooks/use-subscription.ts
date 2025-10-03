import { useState, useEffect } from 'react'
import { subscriptionService, SubscriptionFeatures, UserSubscription } from '@/lib/subscription-service'

interface UseSubscriptionReturn {
  subscription: UserSubscription | null
  features: SubscriptionFeatures
  isLoading: boolean
  hasFeature: (feature: string) => boolean
  hasAccess: boolean
  planName: string
  error: string | null
  refreshSubscription: () => Promise<void>
}

export function useSubscription(userId?: string): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [features, setFeatures] = useState<SubscriptionFeatures>({
    event_info: false,
    gallery: false,
    rsvp: false,
    timeline: false,
    menu: false,
    seating: false,
    analytics: false,
    custom_domain: false,
    white_label: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSubscription = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [subscriptionData, featuresData] = await Promise.all([
        subscriptionService.getUserSubscription(userId),
        subscriptionService.getUserFeatures(userId)
      ])

      setSubscription(subscriptionData)
      setFeatures(featuresData)
    } catch (err) {
      console.error('Error loading subscription:', err)
      setError('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscription()
  }, [userId])

  const hasFeature = (feature: string): boolean => {
    return features[feature as keyof SubscriptionFeatures] || false
  }

  const hasAccess = subscription?.status === 'active'

  const planName = subscription?.planName || 'none'

  const refreshSubscription = async () => {
    await loadSubscription()
  }

  return {
    subscription,
    features,
    isLoading,
    hasFeature,
    hasAccess,
    planName,
    error,
    refreshSubscription
  }
}

interface UseFeatureAccessReturn {
  hasAccess: boolean
  isLoading: boolean
  error: string | null
  checkAccess: () => Promise<boolean>
}

export function useFeatureAccess(userId?: string, feature?: string): UseFeatureAccessReturn {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAccess = async (): Promise<boolean> => {
    if (!userId || !feature) {
      setHasAccess(false)
      setIsLoading(false)
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      const access = await subscriptionService.hasFeatureAccess(userId, feature)
      setHasAccess(access)
      return access
    } catch (err) {
      console.error('Error checking feature access:', err)
      setError('Failed to check feature access')
      setHasAccess(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAccess()
  }, [userId, feature])

  return {
    hasAccess,
    isLoading,
    error,
    checkAccess
  }
}
