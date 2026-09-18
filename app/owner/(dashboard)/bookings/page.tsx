"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarCheck, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { Toaster, toast } from 'sonner'
import { motion } from 'framer-motion'

export default function OwnerBookingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

        const response = await axios.get('https://turf-booking-1-mns7.onrender.com/owner/bookings', {
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
            setTotalPages(response.data.meta.totalPages || Math.ceil((response.data.meta.total || 0) / limit))
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
        <Button variant="outline" className="bg-card hover:bg-muted border-border/50">
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
                      <TableRow key={booking.id || idx} className="border-border/50 hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{booking.id?.substring(0, 8) || `#${idx + 1}`}</TableCell>
                        <TableCell className="font-medium">{booking.customer_name || 'N/A'}</TableCell>
                        <TableCell>{booking.turf_name || 'N/A'}</TableCell>
                        <TableCell>{booking.booking_date || booking.date || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{booking.time_slot || booking.time || 'N/A'}</TableCell>
                        <TableCell className="font-semibold text-brand-mint">
                          ₹{parseFloat(booking.amount || booking.total_price || '0').toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            (booking.status || '').toUpperCase() === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                            (booking.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {booking.status || 'PENDING'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="w-8 h-8 hover:text-brand-mint">
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
    </div>
  )
}
