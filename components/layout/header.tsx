"use client"
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { notificationsService, AppNotification } from '@/services/notifications'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)

  const { data } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: notificationsService.getNotifications 
  })

  const notifications = data || []
  const unreadCount = notifications.filter(n => {
    const isRead = n.isRead || n.is_read || false
    return !isRead
  }).length

  // Only show top 5 in dropdown
  const displayNotifications = notifications.slice(0, 5)

  const generateBreadcrumb = () => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0) return 'Dashboard'
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
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-full h-10 w-10 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-[2px] border-card animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-40 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <h3 className="font-semibold">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotifications(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {displayNotifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        You have no notifications.
                      </div>
                    ) : (
                      displayNotifications.map((notif: AppNotification, idx: number) => {
                        const id = notif.id || notif.notification_id || String(idx)
                        const isRead = notif.isRead || notif.is_read || false
                        const timeRaw = notif.time || notif.created_at || 'Just now'
                        
                        let timeDisplay = timeRaw
                        if (timeRaw !== 'Just now' && !isNaN(Date.parse(timeRaw))) {
                          timeDisplay = new Date(timeRaw).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true
                          })
                        }

                        return (
                          <div key={id} className={`p-4 border-b border-border hover:bg-muted/10 cursor-pointer transition-colors ${!isRead ? 'bg-primary/5' : ''}`}>
                            <div className="flex items-center justify-between">
                              <p className={`text-sm ${!isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{notif.title}</p>
                              {!isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-primary mt-2">{timeDisplay}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="p-2 border-t border-border text-center bg-muted/20">
                    <button 
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        router.push('/admin/notifications');
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>


        <div 
          className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-mint to-brand-caribbean flex items-center justify-center text-brand-dark-green font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow border-2 border-background ring-2 ring-transparent hover:ring-brand-mint/30" 
          onClick={() => router.push('/admin/profile')}
        >
          A
        </div>
      </div>
    </header>
  )
}
