"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, IndianRupee, Eye, TrendingUp, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { paymentsService, Payment } from '@/services/payments'
import { Pagination } from '@/components/ui/pagination'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

export default function PaymentsPage() {
  const { data: paymentsData, isLoading, isError } = useQuery({ queryKey: ['payments'], queryFn: paymentsService.getPayments })

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const payments = paymentsData?.data || []
  const stats = paymentsData?.stats || { total_revenue: 0, successful_payments: 0, total_transactions: 0 }

  // Derived state for filtering and pagination
  const filteredPayments = React.useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = (payment.razorpay_order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.booking_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || payment.payment_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [payments, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center relative">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Payments</h2>
          <p className="text-muted-foreground mt-1">Track platform revenue and transactions.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <Card className="border-brand-pistachio/30 bg-gradient-to-br from-brand-pistachio/5 to-transparent shadow-sm">
          <CardContent className="p-3 md:p-6 flex flex-col xl:flex-row items-center xl:items-start gap-2 md:gap-4 text-center xl:text-left">
            <div className="p-2 md:p-4 bg-brand-mint/20 text-brand-mint rounded-xl">
              <IndianRupee className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Total Revenue</p>
              <h3 className="text-sm md:text-2xl font-bold tracking-tight text-foreground mt-1">₹{stats.total_revenue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-pistachio/30 bg-gradient-to-br from-brand-pistachio/5 to-transparent shadow-sm">
          <CardContent className="p-3 md:p-6 flex flex-col xl:flex-row items-center xl:items-start gap-2 md:gap-4 text-center xl:text-left">
            <div className="p-2 md:p-4 bg-blue-500/20 text-blue-500 rounded-xl">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Successful Payments</p>
              <h3 className="text-sm md:text-2xl font-bold tracking-tight text-foreground mt-1">{stats.successful_payments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-pistachio/30 bg-gradient-to-br from-brand-pistachio/5 to-transparent shadow-sm">
          <CardContent className="p-3 md:p-6 flex flex-col xl:flex-row items-center xl:items-start gap-2 md:gap-4 text-center xl:text-left">
            <div className="p-2 md:p-4 bg-purple-500/20 text-purple-500 rounded-xl">
              <Activity className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">Total Transactions</p>
              <h3 className="text-sm md:text-2xl font-bold tracking-tight text-foreground mt-1">{stats.total_transactions}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-brand-pistachio/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3 bg-brand-pistachio/10 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Booking ID, User or Order ID..."
              className="pl-9 bg-background/50 border-white/20 focus:bg-background"
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
              Filter {statusFilter !== 'ALL' && `(${statusFilter.replace('_', ' ')})`}
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
                          {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col min-h-[400px]">
          <div className="flex-1 w-full overflow-hidden">
            {isLoading ? (
              <div className="py-10 flex justify-center items-center text-brand-mint">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full" />
                <span className="ml-3">Loading payments...</span>
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">Failed to load payments.</div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No payments found matching your filters.</div>
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/5">
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedPayments.map((payment) => (
                        <TableRow key={payment.booking_id} className="hover:bg-brand-pistachio/5 transition-colors">
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground" title={payment.booking_id}>
                              #{payment.booking_id.substring(0, 8)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>{payment.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{payment.customer_email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center font-bold text-brand-forest dark:text-brand-forest">
                              <IndianRupee className="w-3 h-3 mr-0.5" />
                              {parseFloat(payment.amount).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{payment.razorpay_order_id}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${payment.payment_status === 'CONFIRMED' ? 'text-green-600 bg-green-500/10' :
                                payment.payment_status === 'CANCELLED' ? 'text-red-600 bg-red-500/10' :
                                  'text-yellow-600 bg-yellow-500/10'
                              }`}>
                              {payment.payment_status.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-brand-mint hover:bg-brand-pistachio/20"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {!isLoading && !isError && filteredPayments.length > 0 && (
            <div className="mt-auto px-6 py-2 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPayments.length}
                onItemsPerPageChange={(num) => {
                  setItemsPerPage(num);

                  setCurrentPage(1);
                }}
                itemsPerPageOptions={[5, 8, 10, 20, 50]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
        description={selectedPayment ? `Transaction info for Booking #${selectedPayment.booking_id.substring(0, 8)}` : ""}
      >
        {selectedPayment && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Turf Name</span>
                <p className="font-medium text-brand-pine dark:text-brand-mint">{selectedPayment.turf_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment Status</span>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedPayment.payment_status === 'CONFIRMED' ? 'text-green-600 bg-green-500/10' :
                      selectedPayment.payment_status === 'CANCELLED' ? 'text-red-600 bg-red-500/10' :
                        'text-yellow-600 bg-yellow-500/10'
                    }`}>
                    {selectedPayment.payment_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Name</span>
                  <span className="font-medium">{selectedPayment.customer_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Email</span>
                  <span className="font-medium">{selectedPayment.customer_email}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Business Name</span>
                  <span className="font-medium">{selectedPayment.owner_business_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Personal Name</span>
                  <span className="font-medium">{selectedPayment.owner_personal_name}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Amount</span>
                  <span className="font-bold text-brand-forest dark:text-brand-forest text-base">₹{parseFloat(selectedPayment.amount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Date</span>
                  <span className="font-medium">{new Date(selectedPayment.payment_date).toLocaleString('en-IN')}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Order ID</span>
                  <span className="font-mono text-xs">{selectedPayment.razorpay_order_id}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs mb-1">Payment ID</span>
                  <span className="font-mono text-xs">{selectedPayment.razorpay_payment_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border mt-4">
              <Button onClick={() => setSelectedPayment(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
