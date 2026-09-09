"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, AppNotification } from '@/services/notifications'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: notificationsService.getNotifications 
  })

  const notifications = data || []

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const clearAllMutation = useMutation({
    mutationFn: notificationsService.clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">Stay updated on platform activity.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || notifications.length === 0}
          >
            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
          </Button>
          <Button 
            variant="danger" 
            onClick={() => clearAllMutation.mutate()}
            disabled={clearAllMutation.isPending || notifications.length === 0}
          >
            {clearAllMutation.isPending ? 'Clearing...' : 'Clear all'}
          </Button>
        </div>
      </div>

      <Card className="border-brand-pistachio/50">
        <CardHeader className="bg-muted/10 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full" />
                Loading notifications...
             </div>
          ) : isError ? (
             <div className="py-20 text-center text-red-500">
                Failed to load notifications.
             </div>
          ) : (
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif: AppNotification, idx: number) => {
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
                      <motion.div 
                        key={id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors ${!isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="pt-1">
                          {isRead ? (
                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Circle className="w-5 h-5 text-primary fill-primary/20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-semibold ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                              {timeDisplay}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${!isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                            {notif.message}
                          </p>
                          
                          {!isRead && (
                            <button 
                              className="mt-3 px-3 py-1.5 text-xs font-medium rounded-full bg-brand-mint/10 text-brand-mint border border-brand-mint/20 hover:bg-brand-mint hover:text-brand-dark-green transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => markReadMutation.mutate(id)}
                              disabled={markReadMutation.isPending}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {markReadMutation.isPending ? 'Marking...' : 'Mark as read'}
                            </button>
                          )}
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                            onClick={() => deleteMutation.mutate(id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
