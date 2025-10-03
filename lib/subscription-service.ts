import { createServerClient } from '@/lib/supabase'

export interface SubscriptionFeatures {
  event_info: boolean
  gallery: boolean
  rsvp: boolean
  timeline?: boolean
  menu?: boolean
  seating?: boolean
  analytics?: boolean
  custom_domain?: boolean
  white_label?: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planName: 'basic' | 'gold' | 'premium'
  features: string[]
  status: 'active' | 'cancelled' | 'expired'
  activatedAt: string
  expiresAt?: string
  systemeOrderId?: string
}

export interface SystemeOrder {
  id: string
  systemeOrderId: string
  customerEmail: string
  customerName?: string
  packageName: string
  amount: number
  status: 'active' | 'cancelled' | 'refunded'
  createdAt: string
}

// Package mapping based on client requirements
export const PACKAGE_FEATURES = {
  'basic': {
    features: ['event_info'],
    description: 'Event info page only',
    limits: {
      guests: 50,
      storage: 1, // GB
      photos: 100
    }
  },
  'gold': {
    features: ['event_info', 'gallery'],
    description: 'Event info page + Gallery',
    limits: {
      guests: 200,
      storage: 10, // GB
      photos: 1000
    }
  },
  'premium': {
    features: ['event_info', 'gallery', 'rsvp'],
    description: 'Event info page + Gallery + RSVP',
    limits: {
      guests: 500,
      storage: 50, // GB
      photos: 5000
    }
  }
} as const

export class SubscriptionService {
  private supabase = createServerClient()

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching user subscription:', error)
        return null
      }

      return data as UserSubscription
    } catch (error) {
      console.error('Unexpected error in getUserSubscription:', error)
      return null
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId)
      
      if (!subscription) {
        return false
      }

      return subscription.features.includes(feature)
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  /**
   * Get user's feature access as an object
   */
  async getUserFeatures(userId: string): Promise<SubscriptionFeatures> {
    try {
      const subscription = await this.getUserSubscription(userId)
      
      if (!subscription) {
        return {
          event_info: false,
          gallery: false,
          rsvp: false,
          timeline: false,
          menu: false,
          seating: false,
          analytics: false,
          custom_domain: false,
          white_label: false
        }
      }

      const features = subscription.features
      
      return {
        event_info: features.includes('event_info'),
        gallery: features.includes('gallery'),
        rsvp: features.includes('rsvp'),
        timeline: features.includes('timeline'),
        menu: features.includes('menu'),
        seating: features.includes('seating'),
        analytics: features.includes('analytics'),
        custom_domain: features.includes('custom_domain'),
        white_label: features.includes('white_label')
      }
    } catch (error) {
      console.error('Error getting user features:', error)
      return {
        event_info: false,
        gallery: false,
        rsvp: false,
        timeline: false,
        menu: false,
        seating: false,
        analytics: false,
        custom_domain: false,
        white_label: false
      }
    }
  }

  /**
   * Create or update user subscription from systeme.io order
   */
  async createSubscriptionFromOrder(
    customerEmail: string,
    customerName: string,
    packageName: string,
    orderId: string,
    amount: number
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Map package name to plan
      const planMapping: Record<string, keyof typeof PACKAGE_FEATURES> = {
        'BASIC': 'basic',
        'GOLD': 'gold',
        'PREMIUM': 'premium'
      }

      const planName = planMapping[packageName]
      if (!planName) {
        return { success: false, error: `Unknown package: ${packageName}` }
      }

      const planFeatures = PACKAGE_FEATURES[planName]

      // Find or create user
      const { data: existingUser, error: userError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('email', customerEmail)
        .single()

      let userId = ''

      if (existingUser) {
        userId = existingUser.id
        
        // Update existing user
        const { error: updateError } = await this.supabase
          .from('user_profiles')
          .update({
            display_name: customerName || existingUser.display_name,
            role: 'organizer',
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating user:', updateError)
          return { success: false, error: 'Failed to update user' }
        }
      } else {
        // Create new user profile
        const { data: newUser, error: createError } = await this.supabase
          .from('user_profiles')
          .insert({
            email: customerEmail,
            display_name: customerName,
            role: 'organizer',
            subscription_status: 'active'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          return { success: false, error: 'Failed to create user' }
        }

        userId = newUser.id
      }

      // Create systeme.io order record
      const { error: orderError } = await this.supabase
        .from('systeme_orders')
        .upsert({
          systeme_order_id: orderId,
          customer_email: customerEmail,
          customer_name: customerName,
          package_name: packageName,
          amount: amount,
          status: 'active'
        }, {
          onConflict: 'systeme_order_id'
        })

      if (orderError) {
        console.error('Error creating order record:', orderError)
      }

      // Create or update subscription
      const { error: subscriptionError } = await this.supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          systeme_order_id: orderId,
          plan_name: planName,
          features: planFeatures.features,
          status: 'active'
        }, {
          onConflict: 'user_id'
        })

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        return { success: false, error: 'Failed to create subscription' }
      }

      return { success: true, userId }
    } catch (error) {
      console.error('Unexpected error in createSubscriptionFromOrder:', error)
      return { success: false, error: 'Unexpected error occurred' }
    }
  }

  /**
   * Get systeme.io orders for a user
   */
  async getUserOrders(userEmail: string): Promise<SystemeOrder[]> {
    try {
      const { data, error } = await this.supabase
        .from('systeme_orders')
        .select('*')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user orders:', error)
        return []
      }

      return data as SystemeOrder[]
    } catch (error) {
      console.error('Unexpected error in getUserOrders:', error)
      return []
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, featureName: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('feature_usage')
        .upsert({
          user_id: userId,
          feature_name: featureName,
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'user_id,feature_name',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error tracking feature usage:', error)
      }
    } catch (error) {
      console.error('Unexpected error in trackFeatureUsage:', error)
    }
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsage(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.supabase
        .from('feature_usage')
        .select('feature_name, usage_count')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching feature usage:', error)
        return {}
      }

      const usage: Record<string, number> = {}
      data.forEach(item => {
        usage[item.feature_name] = item.usage_count
      })

      return usage
    } catch (error) {
      console.error('Unexpected error in getFeatureUsage:', error)
      return {}
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) {
        console.error('Error cancelling subscription:', error)
        return { success: false, error: 'Failed to cancel subscription' }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error in cancelSubscription:', error)
      return { success: false, error: 'Unexpected error occurred' }
    }
  }

  /**
   * Get subscription limits for a user
   */
  async getUserLimits(userId: string): Promise<Record<string, number>> {
    try {
      const subscription = await this.getUserSubscription(userId)
      
      if (!subscription) {
        return {
          guests: 0,
          storage: 0,
          photos: 0
        }
      }

      const planFeatures = PACKAGE_FEATURES[subscription.planName]
      return planFeatures.limits
    } catch (error) {
      console.error('Error getting user limits:', error)
      return {
        guests: 0,
        storage: 0,
        photos: 0
      }
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()
