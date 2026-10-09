"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, TentTree, CalendarCheck, Users, MessageSquareText, UserSquare2, LogOut, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { customerAuthService } from '@/services/customer-auth'

const navItems = [
  { name: 'Turf', href: '/customer/turf', icon: TentTree },
  { name: 'Events', href: '/customer/events', icon: Flag },
  { name: 'My Booking', href: '/customer/bookings', icon: CalendarCheck },
  { name: 'Community', href: '/customer/community', icon: Users },
  { name: 'Profile', href: '/customer/profile', icon: UserSquare2 },
]

export function CustomerSidebar({ onNavigate, hideCollapseButton = false }: { onNavigate?: () => void, hideCollapseButton?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [customerInitial, setCustomerInitial] = React.useState('C')

  React.useEffect(() => {
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

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate()
      setTimeout(() => {
        router.push(href)
      }, 400)
    }
  }

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    await customerAuthService.logout()
    window.location.href = '/customer/turf'
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="flex flex-col h-screen border-r border-border bg-card dark:bg-gradient-to-b dark:from-card dark:to-[#032221]/40 z-50 relative shadow-2xl md:shadow-lg"
    >
      {!hideCollapseButton && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6 bg-brand-caribbean text-brand-dark-green rounded-full p-1.5 shadow-lg hover:scale-105 transition-transform z-50 ring-4 ring-background"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")}
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}

      <div className="flex items-center justify-center h-20 border-b border-border/50 py-3 overflow-hidden px-4">
        <motion.img 
          src="/images/Logo.png" 
          alt="TurfPlay Logo" 
          className="h-full object-contain cursor-pointer dark:invert-0 dark:hue-rotate-0 invert hue-rotate-180 transition-all duration-300" 
          onClick={() => router.push('/')}
          animate={{ 
            opacity: isCollapsed ? 0 : 1,
            scale: isCollapsed ? 0.5 : 1,
            display: isCollapsed ? "none" : "block"
          }}
          transition={{ duration: 0.2 }}
        />
        {isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-10 h-10 rounded-xl bg-brand-caribbean/20 flex items-center justify-center text-brand-caribbean font-bold text-xl cursor-pointer"
            onClick={() => router.push('/')}
          >
            {customerInitial}
          </motion.div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar overflow-x-hidden">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl py-3.5 text-sm font-semibold transition-all relative cursor-pointer group",
                    isCollapsed ? "justify-center px-0" : "gap-4 px-4",
                    isActive ? "text-brand-dark-green" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-brand-caribbean to-brand-mint rounded-xl shadow-[0_0_15px_rgba(42,161,152,0.3)]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <item.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110 flex-shrink-0", isActive ? "drop-shadow-sm" : "")} />
                  
                  <motion.span 
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                      display: isCollapsed ? "none" : "block"
                    }}
                    className="relative z-10 tracking-wide whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="border-t border-border/50 p-4 overflow-hidden">
        <Link
          href="/"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center rounded-xl py-3.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all cursor-pointer group",
            isCollapsed ? "justify-center px-0" : "gap-4 px-4"
          )}
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 flex-shrink-0" />
          <motion.span 
            animate={{ 
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : "auto",
              display: isCollapsed ? "none" : "block"
            }}
            className="whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>
        </Link>
      </div>
    </motion.div>
  )
}
