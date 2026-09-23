"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, UserSquare2, TentTree, CalendarCheck, CreditCard, PieChart, Dumbbell, LogOut, MessageSquare, Megaphone, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/admin/users', icon: Users },
  { name: 'Owners', href: '/admin/owners', icon: UserSquare2 },
  { name: 'Turfs', href: '/admin/turfs', icon: TentTree },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Reports', href: '/admin/reports', icon: PieChart },
  { name: 'Sports', href: '/admin/sports', icon: Dumbbell },
  { name: 'Queries', href: '/admin/queries', icon: MessageSquare },
  { name: 'Broadcasts', href: '/admin/broadcasts', icon: Megaphone },
  { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar({ onNavigate, hideCollapseButton = false }: { onNavigate?: () => void, hideCollapseButton?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate() // Close the sidebar first to trigger smooth animation
      setTimeout(() => {
        router.push(href)
      }, 400) // Ensure the exit animation fully completes before navigating
    }
  }

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="flex flex-col h-screen border-r border-border/40 bg-card/40 backdrop-blur-2xl z-50 relative"
    >
      {!hideCollapseButton && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")}
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}

      <div className="flex items-center justify-center h-16 border-b border-border py-2 overflow-hidden">
        <motion.img 
          src="/Logo.png" 
          alt="Turf Admin Logo" 
          className="h-full object-contain" 
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
            className="w-8 h-8 rounded-lg bg-brand-mint/20 flex items-center justify-center text-brand-dark-green font-bold text-xl"
          >
            T
          </motion.div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar overflow-x-hidden">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl py-3 text-sm font-medium transition-all relative cursor-pointer group",
                    isCollapsed ? "justify-center px-0" : "gap-3.5 px-4",
                    isActive ? "text-brand-dark-green" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-brand-mint to-brand-caribbean rounded-xl shadow-[0_4px_15px_rgba(42,161,152,0.25)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-muted/0 group-hover:bg-muted/60 rounded-xl transition-colors duration-300 z-0" />
                  )}
                  <item.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110 flex-shrink-0", isActive ? "drop-shadow-sm" : "")} />
                  
                  <motion.span 
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                      display: isCollapsed ? "none" : "block"
                    }}
                    className="relative z-10 font-semibold tracking-wide whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="border-t border-border/40 p-4 bg-gradient-to-b from-transparent to-background/50 overflow-hidden">
        <Link
          href="/admin/login"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center rounded-xl py-3 text-sm font-semibold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer group",
            isCollapsed ? "justify-center px-0" : "gap-3.5 px-4"
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
