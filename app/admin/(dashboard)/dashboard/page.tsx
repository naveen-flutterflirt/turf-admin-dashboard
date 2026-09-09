"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserSquare2, TentTree, Clock, CalendarCheck, IndianRupee, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services/users'
import { ownersService } from '@/services/owners'
import { turfsService } from '@/services/turfs'
import { bookingsService } from '@/services/bookings'
import { paymentsService } from '@/services/payments'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  // Fetch from ALL available APIs
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: usersService.getUsers })
  const { data: owners } = useQuery({ queryKey: ['owners'], queryFn: ownersService.getOwners })
  const { data: turfs } = useQuery({ queryKey: ['turfs'], queryFn: turfsService.getTurfs })
  const { data: bookings } = useQuery({ queryKey: ['bookings'], queryFn: bookingsService.getBookings })
  const { data: paymentsData } = useQuery({ queryKey: ['payments'], queryFn: paymentsService.getPayments })

  // 1. Calculate strictly from explicit API endpoints
  const totalCustomers = customers?.length || 0
  const totalOwners = owners?.length || 0
  const activeTurfs = turfs?.filter(t => String(t.status).toLowerCase() === 'approved' || String(t.status).toLowerCase() === 'active').length || 0
  const pendingTurfs = turfs?.filter(t => String(t.status).toLowerCase() === 'pending').length || 0
  const totalBookings = bookings?.length || 0
  
  const today = new Date().toISOString().split('T')[0]
  const todaysActivity = bookings?.filter(b => {
    try { return new Date(b.booking_date).toISOString().split('T')[0] === today } catch { return false }
  }).length || 0

  const totalRevenue = paymentsData?.stats?.total_revenue || 0
  const successfulPayments = paymentsData?.stats?.successful_payments || 0

  const summaryData = [
    { title: 'Total Customers', value: totalCustomers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Registered users' },
    { title: 'Total Owners', value: totalOwners.toLocaleString(), icon: UserSquare2, color: 'text-brand-mint', bg: 'bg-brand-mint/10', trend: 'Partnered businesses' },
    { title: 'Active Turfs', value: activeTurfs.toLocaleString(), icon: TentTree, color: 'text-primary', bg: 'bg-primary/10', trend: 'Live on platform' },
    { title: 'Pending Turfs', value: pendingTurfs.toLocaleString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: 'Requires approval' },
    
    { title: 'Total Bookings', value: totalBookings.toLocaleString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'All-time reservations' },
    { title: "Today's Activity", value: todaysActivity.toLocaleString(), icon: Activity, color: 'text-accent', bg: 'bg-accent/10', trend: 'Matches scheduled today' },
    { title: 'Total Revenue', value: '₹' + totalRevenue.toLocaleString('en-IN'), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'Total collected' },
    { title: 'Successful Pymts', value: successfulPayments.toLocaleString(), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Completed transactions' },
  ]

  // Extract recent lists directly from the API response arrays
  const recentBookings = [...(bookings || [])].reverse().slice(0, 5)
  const recentPayments = [...(paymentsData?.data || [])].reverse().slice(0, 5)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Live metrics strictly driven by active APIs.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4"
      >
        {summaryData.map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Card className="hover:border-primary/40 transition-all duration-300 h-full shadow-sm bg-card/40 backdrop-blur-xl border-border/50 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  {item.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Bookings Feed directly from Bookings API */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live from Bookings API</p>
            </div>
            <Link href="/admin/bookings">
              <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-background transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No bookings found.</div>
              ) : recentBookings.map((booking, i) => (
                <div key={booking.booking_id || i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border">
                  <div>
                    <p className="font-semibold text-sm">{booking.turf_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{booking.customer_name} • {booking.booking_date.split('T')[0]}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary text-sm">₹{parseFloat(booking.total_price || '0').toLocaleString('en-IN')}</div>
                    <div className={`text-xs mt-0.5 font-medium px-2 py-0.5 rounded-full inline-block ${
                      booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments Feed directly from Payments API */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live from Payments API</p>
            </div>
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-background transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No transactions found.</div>
              ) : recentPayments.map((payment, i) => (
                <div key={`${payment.booking_id || 'payment'}-${i}`} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border">
                  <div>
                    <p className="font-semibold text-sm">{payment.turf_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{payment.customer_name} • {new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary text-sm">₹{parseFloat(payment.amount || '0').toLocaleString('en-IN')}</div>
                    <div className={`text-xs mt-0.5 font-medium px-2 py-0.5 rounded-full inline-block ${
                      payment.payment_status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                      payment.payment_status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {payment.payment_status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
