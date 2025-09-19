'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Reply to Invitation', href: '/invitation' },
  ]

  return (
    <header className="w-full bg-white fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center select-none hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="Vesello Logo" className="h-12 w-auto mr-2" style={{objectFit: 'contain'}} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-0">
            {navigationItems.map((item, idx) => (
              <React.Fragment key={item.name}>
                <Link
                  href={item.href}
                  className={`text-gray-800 hover:text-amber-500 transition-colors text-base px-4 ${item.name === 'Home' ? 'font-bold' : 'font-normal'}`}
                  style={{ minHeight: '40px', display: 'flex', alignItems: 'center', fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}
                >
                  {item.name}
                </Link>
                {idx < navigationItems.length - 1 && (
                  <div className="h-5 w-px bg-gray-300 mx-0" />
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 mt-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-gray-800 hover:text-amber-500 text-base font-medium py-2 ${item.name === 'Home' ? 'font-bold' : 'font-normal'}`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export const DashboardHeader = () => {
  const router = require('next/navigation').useRouter();
  const { signOutUser } = require('@/lib/supabase-auth');
  
  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  return (
    <header className="w-full bg-white shadow-sm flex items-center justify-between px-8 h-20 fixed top-0 left-0 z-50">
      <div className="flex items-center select-none">
        <img src="/images/logo.png" alt="Vesello Logo" className="h-10 w-auto mr-2" style={{objectFit: 'contain'}} />
    
      </div>
      <button
        className="bg-black text-white px-6 py-2 rounded-md font-semibold text-base hover:bg-[#E5B574] hover:text-black transition-colors"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
};

export default Header