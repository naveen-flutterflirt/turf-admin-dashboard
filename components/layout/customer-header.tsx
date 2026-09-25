"use client"
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '../ui/button'
import { ThemeToggle } from '../theme-toggle'

export function CustomerHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [customerInitial, setCustomerInitial] = useState('C')

  useEffect(() => {
    const customerData = localStorage.getItem('customer_user')
    if (customerData) {
      try {
        const parsed = JSON.parse(customerData)
        if (parsed.name) {
          setCustomerInitial(parsed.name.charAt(0).toUpperCase())
        }
      } catch {
        console.error("Could not parse customer user data")
      }
    }
  }, [])

  const generateBreadcrumb = () => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0 || (paths.length === 1 && paths[0] === 'customer')) return 'Dashboard'
    const lastPath = paths[paths.length - 1]
    return lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace('-', ' ')
  }

  return (
    <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg md:text-xl font-semibold hidden sm:block">{generateBreadcrumb()}</h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <div 
          className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-caribbean to-brand-mint flex items-center justify-center text-brand-dark-green font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow border-2 border-background ring-2 ring-transparent hover:ring-brand-caribbean/30" 
          onClick={() => router.push('/customer/profile')}
        >
          {customerInitial}
        </div>
      </div>
    </header>
  )
}
