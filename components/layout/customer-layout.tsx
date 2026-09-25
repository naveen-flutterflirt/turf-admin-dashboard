"use client"
import React, { useState, useEffect } from 'react'
import { CustomerSidebar } from './customer-sidebar'
import { CustomerHeader } from './customer-header'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { CustomerAuthModal } from '../auth/customer-auth-modal'

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null
      
      if (!token) {
        setIsAuthenticated(false)
        setShowAuthModal(true)
      } else {
        setIsAuthenticated(true)
        setShowAuthModal(false)
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [pathname])

  if (isChecking) {
    return <div className="h-screen w-full bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background selection:bg-brand-caribbean/30">
      {/* Premium Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 -top-40 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-caribbean/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] mix-blend-screen"></div>
      </div>

      <CustomerAuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // If they close the modal without logging in, we could redirect them back to home
          if (!isAuthenticated) {
            router.push('/')
          } else {
            setShowAuthModal(false)
          }
        }} 
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-20">
        <CustomerSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] md:hidden"
            >
              <CustomerSidebar onNavigate={() => setIsSidebarOpen(false)} hideCollapseButton={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <CustomerHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
