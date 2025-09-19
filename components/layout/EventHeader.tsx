'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  const homeUrl = `/event-id/${eventId}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always links to the event page */}
          <Link href={homeUrl} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src="/images/logo.png" alt="Vesello Logo" className="h-12 w-auto mr-2" style={{objectFit: 'contain'}} />
           
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Home Link - Always present, links to event page */}
            {currentPage === 'home' ? (
              <span className="text-[#E5B574] font-medium">Home</span>
            ) : (
              <Link href={homeUrl} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                Home
              </Link>
            )}
            
            {/* Gallery Link - Conditional based on galleryEnabled */}
            {galleryEnabled && (
              currentPage === 'gallery' ? (
                <span className="text-[#E5B574] font-medium">Gallery</span>
              ) : (
                <Link href={`${homeUrl}/gallery`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Gallery
                </Link>
              )
            )}
            
            {/* RSVP Link - Conditional based on rsvpEnabled */}
            {rsvpEnabled && (
              currentPage === 'rsvp' ? (
                <span className="text-[#E5B574] font-medium">Reply to Invitation</span>
              ) : (
                <Link href={`${homeUrl}/invitation`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Reply to Invitation
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
