"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarCheck, Eye, Download, X, Clock, IndianRupee, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from '@/lib/axios'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function OwnerBookingsPage() {
   
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
        if (!token) throw new Error("No authorization token found")

        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/bookings', {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.data && response.data.success) {
          // Assume response.data.data contains the list, and maybe meta info
          setBookings(response.data.data || response.data.bookings || [])
          
          // Industry standard pagination usually returns total items or pages in meta
          if (response.data.meta) {
            setTotalPages(response.data.meta.total_pages || response.data.meta.totalPages || Math.ceil((response.data.meta.total || 0) / limit))
            setTotalBookings(response.data.meta.total || 0)
          } else if (response.data.total) {
            setTotalPages(Math.ceil(response.data.total / limit))
            setTotalBookings(response.data.total)
          }
        } else if (Array.isArray(response.data)) {
          // Fallback if it just returns an array
          setBookings(response.data)
        } else {
          setBookings([])
        }
      } catch (err: any) {
        console.error("Failed to fetch bookings", err)
        toast.error(err.response?.data?.message || "Failed to load bookings.")
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [page, limit])

  return (
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground mt-1">View and manage all customer reservations.</p>
        </div>
        <Button variant="outline" className="bg-card border-border/50">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-mint" /> All Reservations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-muted/50 rounded-md"></div>
                  ))}
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No bookings found for your turfs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Turf</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking, idx) => (
                      <TableRow key={booking.booking_id || booking.id || idx} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{(booking.booking_id || booking.id || '').substring(0, 8) || `#${idx + 1}`}</TableCell>
                        <TableCell className="font-medium">{booking.customer_name || 'N/A'}</TableCell>
                        <TableCell>{booking.turf_name || 'N/A'}</TableCell>
                        <TableCell>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : booking.date || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.start_time && booking.end_time 
                            ? `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}` 
                            : booking.time_slot || booking.time || 'N/A'}
                        </TableCell>
                        <TableCell className="font-semibold text-brand-mint">
                          {((booking.status || '').toUpperCase() === 'CONFIRMED' || (booking.status || '').toUpperCase() === 'CONNFIRMED') 
                            ? `₹${parseFloat(booking.amount || booking.total_price || '0').toLocaleString('en-IN')}` 
                            : <span className="text-muted-foreground/50 font-normal">-</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                            (booking.status || '').toUpperCase() === 'CONFIRMED' || (booking.status || '').toUpperCase() === 'CONNFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            (booking.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            (booking.status || '').toUpperCase().includes('PENDING') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {booking.status === 'CONNFIRMED' ? 'CONFIRMED' : booking.status || 'PENDING'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="w-8 h-8 hover:text-brand-mint" onClick={() => { setSelectedBooking(booking); setDetailsModalOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination Controls */}
            {!loading && bookings.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/5">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{bookings.length}</span> results
                  {totalBookings > 0 && <span> of <span className="font-medium text-foreground">{totalBookings}</span></span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm px-2 text-muted-foreground">
                    Page <span className="font-medium text-foreground">{page}</span> {totalPages > 1 && <span>of {totalPages}</span>}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={bookings.length < limit && totalPages <= page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setDetailsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/10">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Booking Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">ID: {selectedBooking.booking_id || selectedBooking.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDetailsModalOpen(false)} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Status & Price Row */}
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Total Amount</p>
                    <div className="flex items-center gap-1.5 text-2xl font-bold text-brand-mint">
                      {((selectedBooking.status || '').toUpperCase() === 'CONFIRMED' || (selectedBooking.status || '').toUpperCase() === 'CONNFIRMED') ? (
                        <>
                          <IndianRupee className="w-5 h-5" />
                          {parseFloat(selectedBooking.amount || selectedBooking.total_price || '0').toLocaleString('en-IN')}
                        </>
                      ) : (
                        <span className="text-muted-foreground/50 font-normal">-</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Status</p>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                      (selectedBooking.status || '').toUpperCase() === 'CONFIRMED' || (selectedBooking.status || '').toUpperCase() === 'CONNFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      (selectedBooking.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      (selectedBooking.status || '').toUpperCase().includes('PENDING') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {selectedBooking.status === 'CONNFIRMED' ? 'CONFIRMED' : selectedBooking.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Main Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" /> Reservation Info
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-card border border-border/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="font-medium text-sm">{selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString() : selectedBooking.date || 'N/A'}</p>
                      </div>
                      <div className="bg-card border border-border/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Time Slot</p>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-mint" /> 
                          {selectedBooking.start_time && selectedBooking.end_time 
                            ? `${selectedBooking.start_time.slice(0, 5)} - ${selectedBooking.end_time.slice(0, 5)}` 
                            : selectedBooking.time_slot || selectedBooking.time || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Customer & Turf
                    </h3>
                    <div className="space-y-3 bg-card border border-border/50 rounded-xl p-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Customer Name</span>
                        <span className="font-medium">{selectedBooking.customer_name || 'N/A'}</span>
                      </div>
                      {selectedBooking.customer_email && (
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="font-medium">{selectedBooking.customer_email}</span>
                        </div>
                      )}
                      {selectedBooking.customer_phone && (
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="font-medium">{selectedBooking.customer_phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Turf Name</span>
                        <span className="font-medium text-brand-mint">{selectedBooking.turf_name || 'N/A'}</span>
                      </div>
                      {selectedBooking.sport_name && (
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Sport</span>
                          <span className="font-medium">{selectedBooking.sport_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Turf ID</span>
                        <span className="font-mono text-xs">{selectedBooking.turf_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBooking.createdAt && (
                    <div className="pt-2 text-center text-xs text-muted-foreground">
                      Booking created on {new Date(selectedBooking.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
