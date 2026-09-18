"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Megaphone, Trash2, Send, Clock, Users, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marketingService } from '@/services/marketing'
import { turfsService } from '@/services/turfs'
import { usersService } from '@/services/users'
import { toast } from 'sonner'

export default function BroadcastsPage() {
  const queryClient = useQueryClient()
  const [turfId, setTurfId] = useState('')
  const [radiusKm, setRadiusKm] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersService.getUsers
  })

  const { data: turfs = [], isLoading: isLoadingTurfs } = useQuery({
    queryKey: ['admin-turfs'],
    queryFn: turfsService.getTurfs
  })

  const { data: broadcasts = [], isLoading: isLoadingBroadcasts } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: marketingService.getBroadcasts
  })

  const sendBroadcastMutation = useMutation({
    mutationFn: marketingService.sendBroadcast,
    onSuccess: () => {
      toast.success('Broadcast sent successfully!')
      setTurfId('')
      setRadiusKm('')
      setTitle('')
      setBody('')
      setSelectedCustomerIds([])
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send broadcast')
    }
  })

  const deleteBroadcastMutation = useMutation({
    mutationFn: marketingService.deleteBroadcast,
    onSuccess: () => {
      toast.success('Broadcast deleted')
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete broadcast')
    }
  })

  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!turfId || !title || !body) {
      toast.error('Please fill in turf, title and message')
      return
    }

    if (!radiusKm && selectedCustomerIds.length === 0) {
      toast.error('Please provide at least a radius or select specific customers')
      return
    }

    sendBroadcastMutation.mutate({
      turf_id: turfId,
      radius_km: radiusKm ? Number(radiusKm) : undefined,
      title,
      body,
      customer_ids: selectedCustomerIds.length > 0 ? selectedCustomerIds : undefined
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-brand-mint" />
            Broadcasts
          </h2>
          <p className="text-muted-foreground mt-1">Send promotional notifications to nearby customers.</p>
        </div>
      </div>

      <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'send'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          Send Broadcast
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          History
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'send' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-brand-pistachio/50 max-w-2xl">
              <CardHeader className="bg-muted/10 border-b border-border">
                <CardTitle className="text-lg">New Broadcast</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSend} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Turf</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={turfId}
                      onChange={(e) => setTurfId(e.target.value)}
                      disabled={isLoadingTurfs}
                    >
                      <option value="" disabled>-- Choose a Turf --</option>
                      {turfs.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </div>

                  {turfId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Specific Customers (Optional)</label>
                      <p className="text-xs text-muted-foreground">If none selected, the broadcast is sent to all customers within the radius.</p>
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-3 border border-input rounded-md bg-background custom-scrollbar">
                        {isLoadingUsers ? (
                          <div className="text-sm text-muted-foreground text-center py-4">Loading customers...</div>
                        ) : users.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">No customers found.</div>
                        ) : (
                          users.map((user: any) => (
                            <label key={user.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-input text-brand-mint focus:ring-brand-mint/50 bg-background"
                                checked={selectedCustomerIds.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCustomerIds([...selectedCustomerIds, user.id])
                                  } else {
                                    setSelectedCustomerIds(selectedCustomerIds.filter(id => id !== user.id))
                                  }
                                }}
                              />
                              <span className="font-medium text-foreground/90">{user.name}</span>
                              <span className="text-muted-foreground text-xs">{user.phone}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Radius in km (Optional)</label>
                    <p className="text-xs text-muted-foreground">Leave blank if you only want to message specific customers, regardless of distance.</p>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 50% Off Today! 🎉"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Come play at our turf today..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">{body.length}/500</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 flex items-center justify-center gap-2 font-semibold h-11"
                    disabled={sendBroadcastMutation.isPending}
                  >
                    {sendBroadcastMutation.isPending ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Broadcast
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-brand-pistachio/50">
              <CardHeader className="bg-muted/10 border-b border-border">
                <CardTitle className="text-lg">Broadcast History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingBroadcasts ? (
                  <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full" />
                    Loading broadcasts...
                  </div>
                ) : broadcasts.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No broadcasts sent yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence>
                      {broadcasts.map((broadcast) => {
                        const timeDisplay = new Date(broadcast.created_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true
                        })

                        return (
                          <motion.div
                            key={broadcast.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-5 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 space-y-2">
                                <h4 className="text-base font-bold text-foreground">
                                  {broadcast.title}
                                </h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                  {broadcast.message}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50">
                                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand-caribbean bg-brand-caribbean/10 px-2.5 py-1 rounded-full">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {broadcast.turf_name}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-xs truncate" title={broadcast.targeted_names}>
                                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                      {broadcast.users_targeted} targeted {broadcast.targeted_names ? `(${broadcast.targeted_names})` : ''}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-mint"></span>
                                    {broadcast.radius_km}km radius
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeDisplay}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                onClick={() => deleteBroadcastMutation.mutate(broadcast.id)}
                                disabled={deleteBroadcastMutation.isPending}
                                title="Delete Broadcast Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
