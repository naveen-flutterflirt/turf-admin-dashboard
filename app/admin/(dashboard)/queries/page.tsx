"use client"
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Reply, MessageSquare, Star, User } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queriesService, QueryType } from '@/services/queries'
import { Modal } from '@/components/ui/modal'

import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

import { Pagination } from '@/components/ui/pagination'

export default function QueriesPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'owner' | 'customer'>('owner')
  
  // Owner Queries
  const { data: queries, isLoading: isQueriesLoading, isError: isQueriesError } = useQuery({ queryKey: ['queries'], queryFn: queriesService.getQueries })
  
  // Customer Feedbacks
  const { data: customerFeedbacks, isLoading: isFeedbacksLoading, isError: isFeedbacksError } = useQuery({
    queryKey: ['admin_feedbacks'],
    queryFn: queriesService.getAdminFeedbacks,
    enabled: activeTab === 'customer'
  })
  
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<QueryType | null>(null)
  
  const [replyText, setReplyText] = useState('')
  const [status, setStatus] = useState('CLOSED')

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  const replyMutation = useMutation({
    mutationFn: (data: { id: string, admin_reply: string, status: string }) => queriesService.replyQuery(data.id, data.admin_reply, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      setIsReplyModalOpen(false)
      setSelectedQuery(null)
      setReplyText('')
      toast.success("Replied to query successfully")
    },
     
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while replying to the query")
    }
  })

  // Derived state for filtering and pagination (Owner Queries)
  const filteredQueries = useMemo(() => {
    if (!queries) return []
    return queries.filter(q => {
      const subjectMatch = (q.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
      const messageMatch = (q.message || '').toLowerCase().includes(searchTerm.toLowerCase())
      return subjectMatch || messageMatch
    })
  }, [queries, searchTerm])

  const totalQueryPages = Math.ceil(filteredQueries.length / ITEMS_PER_PAGE)
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalQueryPages))
  const paginatedQueries = filteredQueries.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE)

  // Derived state for filtering and pagination (Customer Feedbacks)
  const filteredFeedbacks = useMemo(() => {
    if (!customerFeedbacks) return []
    return customerFeedbacks.filter((f: any) => {
      const commentMatch = (f.comment || '').toLowerCase().includes(searchTerm.toLowerCase())
      const customerMatch = (f.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const turfMatch = (f.turf_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      return commentMatch || customerMatch || turfMatch
    })
  }, [customerFeedbacks, searchTerm])
  
  const totalFeedbackPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE)
  const validFeedbackPage = Math.min(currentPage, Math.max(1, totalFeedbackPages))
  const paginatedFeedbacks = filteredFeedbacks.slice((validFeedbackPage - 1) * ITEMS_PER_PAGE, validFeedbackPage * ITEMS_PER_PAGE)

  const handleReplySubmit = () => {
    if (!selectedQuery) return
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty")
      return
    }
    replyMutation.mutate({
      id: selectedQuery.id,
      admin_reply: replyText,
      status: status
    })
  }
  
  const isLoading = activeTab === 'owner' ? isQueriesLoading : isFeedbacksLoading
  const isError = activeTab === 'owner' ? isQueriesError : isFeedbacksError
  const totalPages = activeTab === 'owner' ? totalQueryPages : totalFeedbackPages
  const isEmpty = activeTab === 'owner' ? filteredQueries.length === 0 : filteredFeedbacks.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support & Feedback</h2>
          <p className="text-muted-foreground mt-1">Manage owner queries and view customer feedbacks.</p>
        </div>
      </div>
      
      {/* Elegant Tabs */}
      <div className="flex p-1 bg-secondary/30 rounded-2xl w-max border border-border/50 shadow-inner">
        <button
          onClick={() => { setActiveTab('owner'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'owner' ? 'bg-background shadow-md text-brand-mint border border-border/40' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Owner Queries
        </button>
        <button
          onClick={() => { setActiveTab('customer'); setCurrentPage(1); setSearchTerm(''); }}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'customer' ? 'bg-background shadow-md text-brand-caribbean border border-border/40' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
        >
          <Star className="w-4 h-4" />
          Customer Feedback
        </button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={activeTab === 'owner' ? "Search queries..." : "Search feedbacks..."}
              className="pl-9 bg-secondary/20 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 flex flex-col min-h-[400px]">
          <div className="flex-1 w-full overflow-hidden">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground flex justify-center items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-brand-mint/20 border-t-brand-mint" />
                Loading {activeTab === 'owner' ? 'queries' : 'feedbacks'}...
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">Failed to load {activeTab === 'owner' ? 'queries' : 'feedbacks'}.</div>
            ) : isEmpty ? (
              <EmptyState 
                icon={activeTab === 'owner' ? MessageSquare : Star} 
                title={activeTab === 'owner' ? "No queries found" : "No feedbacks found"}
                description="We couldn't find any results matching your current search filters."
                action={<Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>}
              />
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    {activeTab === 'owner' ? (
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Turf</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {activeTab === 'owner' && paginatedQueries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell className="font-medium max-w-[200px] truncate" title={query.subject}>{query.subject}</TableCell>
                          <TableCell className="max-w-[300px] truncate" title={query.message}>{query.message}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              query.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 
                              query.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {query.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(query.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full px-4 border-brand-mint/30 text-brand-mint hover:bg-brand-mint hover:text-white transition-all shadow-sm group"
                              onClick={() => {
                                setSelectedQuery(query)
                                setReplyText(query.admin_reply || '')
                                setStatus(query.status === 'OPEN' ? 'CLOSED' : query.status)
                                setIsReplyModalOpen(true)
                              }}
                            >
                              <Reply className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                              Reply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {activeTab === 'customer' && paginatedFeedbacks.map((feedback: any) => (
                        <TableRow key={feedback.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-medium truncate max-w-[150px]" title={feedback.customer_name}>{feedback.customer_name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-[150px]" title={feedback.turf_name}>{feedback.turf_name || 'Unknown Turf'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate" title={feedback.comment}>
                            {feedback.comment || <span className="text-muted-foreground italic text-xs">No comment</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(feedback.created_at || new Date()).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {!isLoading && !isError && !isEmpty && (
            <div className="mt-auto pt-4 border-t">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} title="Reply to Query">
        {selectedQuery && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-mint/20 to-brand-caribbean/10 p-5 rounded-xl border border-brand-mint/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <MessageSquare className="w-16 h-16 text-brand-mint" />
              </div>
              <p className="font-semibold text-brand-mint mb-2 text-lg relative z-10">Subject: {selectedQuery.subject}</p>
              <p className="text-foreground/90 text-sm leading-relaxed relative z-10">{selectedQuery.message}</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Reply className="w-4 h-4 text-brand-mint" />
                Your Reply
              </label>
              <textarea 
                className="w-full min-h-[140px] p-4 rounded-xl border border-border/50 bg-secondary/10 text-sm shadow-inner placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint focus-visible:border-brand-mint transition-all resize-none"
                placeholder="Type your thoughtful reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Update Status</label>
              <select 
                className="w-full p-3 rounded-xl border border-border/50 bg-secondary/10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint focus-visible:border-brand-mint transition-all appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">🟡 Mark as Open</option>
                <option value="CLOSED">🟢 Mark as Closed</option>
              </select>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-border/50">
              <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setIsReplyModalOpen(false)}>Cancel</Button>
              <Button 
                type="button" 
                className="rounded-xl px-6 bg-gradient-to-r from-brand-mint to-brand-caribbean text-white hover:opacity-90 shadow-lg shadow-brand-mint/20 transition-all font-medium"
                disabled={replyMutation.isPending}
                onClick={handleReplySubmit}
              >
                {replyMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Reply className="w-4 h-4" />
                    Send Reply
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

