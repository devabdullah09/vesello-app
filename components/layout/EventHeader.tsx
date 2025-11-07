'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/language-context'

interface EventHeaderProps {
  eventId: string
  galleryEnabled?: boolean
  rsvpEnabled?: boolean
  currentPage?: 'home' | 'gallery' | 'rsvp'
}

export default function EventHeader({ 
  eventId, 
  galleryEnabled = false, 
  rsvpEnabled = false, 
  currentPage = 'home' 
}: EventHeaderProps) {
  const { t } = useLanguage()
  const homeUrl = `/${eventId}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always links to the event page */}
          <Link href={homeUrl} className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="Vesello Logo" className="h-8 sm:h-10 md:h-12 w-auto" style={{objectFit: 'contain'}} />
          </Link>
          
          {/* Navigation Links */}
          <nav className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
            {/* Home Link - Always present, links to event page */}
            {currentPage === 'home' ? (
              <span className="text-[#E5B574] font-medium text-sm sm:text-base">{t.navigation.home}</span>
            ) : (
              <Link href={homeUrl} className="text-gray-600 hover:text-[#E5B574] transition-colors text-sm sm:text-base">
                {t.navigation.home}
              </Link>
            )}
            
            {/* Gallery Link - Conditional based on galleryEnabled */}
            {galleryEnabled && (
              currentPage === 'gallery' ? (
                <span className="text-[#E5B574] font-medium text-sm sm:text-base">{t.navigation.gallery}</span>
              ) : (
                <Link href={`${homeUrl}/gallery`} className="text-gray-600 hover:text-[#E5B574] transition-colors text-sm sm:text-base">
                  {t.navigation.gallery}
                </Link>
              )
            )}
            
            {/* RSVP Link - Conditional based on rsvpEnabled */}
            {rsvpEnabled && (
              currentPage === 'rsvp' ? (
                <span className="text-[#E5B574] font-medium text-sm sm:text-base">{t.navigation.rsvp}</span>
              ) : (
                <Link href={`${homeUrl}/invitation`} className="text-gray-600 hover:text-[#E5B574] transition-colors text-sm sm:text-base">
                  {t.navigation.rsvp}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
