"use client"

import React from 'react'
import { useAuth } from '@/lib/supabase-auth' // Assuming you have this
import { FeatureGate } from '@/components/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Users, Calendar } from 'lucide-react'

/**
 * Example component showing how to use feature gating
 * in your existing wedding app components
 */
const FeatureGatingExample = () => {
  const { user } = useAuth() // Get current user
  const userId = user?.id

  return (
    <div className="space-y-6">
      {/* Example 1: Gallery Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureGate 
            feature="gallery" 
            userId={userId}
            fallback={
              <div className="text-center p-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Photo gallery is not available with your current plan</p>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Upload and share your wedding photos with guests!
              </p>
              <Button className="w-full">
                Upload Photos
              </Button>
            </div>
          </FeatureGate>
        </CardContent>
      </Card>

      {/* Example 2: RSVP Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            RSVP Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureGate 
            feature="rsvp" 
            userId={userId}
            showUpgrade={true}
            requiredPlan="premium"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Collect guest responses and manage your wedding guest list.
              </p>
              <Button className="w-full">
                Manage RSVPs
              </Button>
            </div>
          </FeatureGate>
        </CardContent>
      </Card>

      {/* Example 3: Timeline Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Wedding Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureGate 
            feature="timeline" 
            userId={userId}
            fallback={
              <div className="text-center p-6">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500 mb-4">
                  Wedding timeline feature requires Gold plan or higher
                </p>
                <Button variant="outline" size="sm">
                  Upgrade to Gold
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Create a beautiful timeline for your wedding day.
              </p>
              <Button className="w-full">
                Create Timeline
              </Button>
            </div>
          </FeatureGate>
        </CardContent>
      </Card>
    </div>
  )
}

export default FeatureGatingExample
