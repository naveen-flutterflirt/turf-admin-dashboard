"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MessageSquareText, Plus, Eye, X, Loader2, MessageSquareReply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queriesService, QueryType } from '@/services/queries'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function OwnerQueriesPage() {
  const queryClient = useQueryClient()
  
  const { data: queries, isLoading, isError } = useQuery({ 
    queryKey: ['owner_queries'], 
    queryFn: queriesService.getOwnerQueries 
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<QueryType | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Form State
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const submitMutation = useMutation({
    mutationFn: () => queriesService.sendOwnerQuery(subject, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner_queries'] })
      setIsModalOpen(false)
      setSubject('')
      setMessage('')
      toast.success('Support query submitted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit query.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.")
      return
    }
    submitMutation.mutate()
  }

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase()
    if (s === 'RESOLVED') return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  }

  const sortedQueries = [...(queries || [])].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" theme="system" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Queries</h2>
          <p className="text-muted-foreground mt-1">Need help? Send a message to the platform administrators.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all px-6">
          <Plus className="w-4 h-4 mr-2" /> New Query
        </Button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-primary" /> Past Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-48 text-red-500">
                  Failed to load queries. Please try again.
                </div>
              ) : sortedQueries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <MessageSquareText className="w-12 h-12 mb-3 opacity-20" />
                  <p>You haven&apos;t submitted any support queries yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedQueries.map((query, idx) => (
                        <TableRow key={query.id || idx} className="border-border/50 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {(query.id || '').substring(0, 8) || `#${idx + 1}`}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{query.subject}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(query.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(query.status)}`}>
                              {(query.status || 'PENDING').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => { setSelectedQuery(query); setIsViewModalOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Submit Query Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/5">
                <h2 className="text-xl font-bold tracking-tight">Send a Query</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-semibold">Subject</label>
                  <Input 
                    id="subject"
                    placeholder="E.g., Issue with booking payment" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-muted/20 border-border/50 focus:border-primary transition-colors h-11"
                    maxLength={100}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-semibold">Message</label>
                  <textarea 
                    id="message"
                    placeholder="Describe your issue in detail..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-muted/20 border-border/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors min-h-[150px] resize-none"
                    maxLength={1000}
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">{message.length}/1000</div>
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitMutation.isPending} className="min-w-[120px] rounded-full">
                    {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Query'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Query Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsViewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight truncate max-w-[300px]">{selectedQuery.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Submitted on {new Date(selectedQuery.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsViewModalOpen(false)} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/50">
                  <span className="text-sm font-semibold text-muted-foreground">Current Status</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedQuery.status)}`}>
                    {(selectedQuery.status || 'PENDING').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm leading-none">
                    <MessageSquareText className="w-4 h-4" /> Your Message
                  </div>
                  <div className="bg-muted/10 p-4 rounded-xl border border-border/50 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedQuery.message}
                  </div>
                </div>

                {selectedQuery.admin_reply && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm leading-none">
                      <MessageSquareReply className="w-4 h-4" /> Admin Reply
                    </div>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {selectedQuery.admin_reply}
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
