"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '@/services/bookings'
import { motion, AnimatePresence } from 'framer-motion'
import { Pagination } from '@/components/ui/pagination'
import { Modal } from '@/components/ui/modal'
import { Booking } from '@/services/bookings'
import { exportToCsv } from '@/lib/export'
import { EmptyState } from '@/components/ui/empty-state'
export default function BookingsPage() {
  const { data: bookings, isLoading, isError } = useQuery({ queryKey: ['bookings'], queryFn: bookingsService.getBookings })

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Derived state for filtering and pagination
  const filteredBookings = React.useMemo(() => {
    if (!bookings) return []
    return bookings.filter(booking => {
      const matchesSearch = booking.turf_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExport = () => {
    const exportData = filteredBookings.map(b => ({
      booking_id: b.booking_id,
      turf_name: b.turf_name,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      booking_date: new Date(b.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}),
      time: `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`,
      total_price: b.total_price,
      status: b.status
    }));
    
    exportToCsv(exportData, 'bookings_export', [
      { key: 'booking_id', label: 'Booking ID' },
      { key: 'turf_name', label: 'Turf Name' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'customer_phone', label: 'Customer Phone' },
      { key: 'booking_date', label: 'Booking Date' },
      { key: 'time', label: 'Time' },
      { key: 'total_price', label: 'Total Price' },
      { key: 'status', label: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Bookings</h2>
          <p className="text-muted-foreground mt-1">Monitor reservation activity across all turfs.</p>
        </div>
      </div>

      <Card className="border-brand-pistachio/50">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by turf or user..." 
              className="pl-9 bg-secondary/20 w-full focus:bg-background"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex gap-2 relative flex-shrink-0">
            <Button 
              variant="outline" 
              className="border-brand-pistachio hover:bg-brand-pistachio/20 text-brand-dark-green dark:text-white"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filter {statusFilter !== 'ALL' && `(${statusFilter})`}
            </Button>

            <AnimatePresence>
              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 w-48 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {['ALL', 'CONFIRMED', 'PAYMENT_PENDING', 'CANCELLED'].map(status => (
                        <div 
                          key={status}
                          className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${statusFilter === status ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted'}`}
                          onClick={() => { 
                            setStatusFilter(status)
                            setCurrentPage(1)
                            setShowFilterDropdown(false) 
                          }}
                        >
                          {status === 'ALL' ? 'All Statuses' : status}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <Button variant="outline" className="flex-1 sm:flex-none border-brand-pistachio/50 hover:bg-brand-pistachio/20" onClick={handleExport}>Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 flex flex-col min-h-[400px]">
          <div className="flex-1 w-full overflow-hidden">
            {isLoading ? (
              <div className="py-10 flex justify-center items-center text-brand-mint">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full" />
                <span className="ml-3">Loading bookings...</span>
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">Failed to load bookings.</div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState 
                icon={Search} 
                title="No bookings found" 
                description="We couldn't find any bookings matching your current search or status filters."
                action={<Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>Clear Filters</Button>}
              />
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/5">
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Turf Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedBookings.map((booking) => (
                        <TableRow key={booking.booking_id} className="hover:bg-brand-pistachio/5 transition-colors">
                          <TableCell className="font-mono text-xs text-muted-foreground" title={booking.booking_id}>
                            #{booking.booking_id.substring(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium text-brand-bangladesh dark:text-brand-anti-flash">
                            {booking.turf_name}
                          </TableCell>
                          <TableCell>
                            <div>{booking.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{booking.customer_phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</div>
                              <div className="text-xs text-muted-foreground">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-brand-forest dark:text-brand-forest">
                            ₹{parseFloat(booking.total_price).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              booking.status === 'CONFIRMED' ? 'text-green-600 bg-green-500/10' : 
                              booking.status === 'CANCELLED' ? 'text-red-600 bg-red-500/10' :
                              'text-yellow-600 bg-yellow-500/10'
                            }`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-brand-mint hover:bg-brand-pistachio/20"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
          {!isLoading && !isError && filteredBookings.length > 0 && (
            <div className="mt-auto">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredBookings.length}
                onItemsPerPageChange={(num) => { setItemsPerPage(num);  
    setCurrentPage(1); }}
                itemsPerPageOptions={[5, 8, 10, 20, 50]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        description={`Detailed information for booking #${selectedBooking?.booking_id.substring(0, 8)}`}
      >
        {selectedBooking && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Turf Name</span>
                <p className="font-medium text-brand-pine dark:text-brand-mint">{selectedBooking.turf_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedBooking.status === 'CONFIRMED' ? 'text-green-600 bg-green-500/10' : 
                    selectedBooking.status === 'CANCELLED' ? 'text-red-600 bg-red-500/10' :
                    'text-yellow-600 bg-yellow-500/10'
                  }`}>
                    {selectedBooking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Name</span>
                  <span className="font-medium">{selectedBooking.customer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Phone</span>
                  <span className="font-medium">{selectedBooking.customer_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Email</span>
                  <span className="font-medium">{selectedBooking.customer_email}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Turf & Business Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Owner Business Name</span>
                  <span className="font-medium">{selectedBooking.owner_business_name}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Booking Schedule</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Date</span>
                  <span className="font-medium">{new Date(selectedBooking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Time</span>
                  <span className="font-medium">{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Booking ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{selectedBooking.booking_id}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Total Price</span>
                  <span className="font-bold text-brand-forest dark:text-brand-forest text-base">₹{parseFloat(selectedBooking.total_price).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Order ID</span>
                  <span className="font-mono text-xs">{selectedBooking.razorpay_order_id || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Payment ID</span>
                  <span className="font-mono text-xs">{selectedBooking.razorpay_payment_id || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-border mt-4">
               <Button onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
