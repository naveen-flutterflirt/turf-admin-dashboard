"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserSquare2, TentTree, Clock, CalendarCheck, IndianRupee, Activity, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard'
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
  const { data: dashboard, isLoading, isError } = useQuery({ 
    queryKey: ['admin-dashboard'], 
    queryFn: dashboardService.getAdminDashboard 
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-mint animate-spin" />
      </div>
    )
  }

  if (isError || !dashboard) {
    return (
      <div className="text-center text-red-500 py-10 bg-red-500/5 rounded-xl border border-red-500/20 max-w-4xl">
        <h3 className="text-lg font-semibold">Failed to load dashboard data</h3>
        <p className="text-sm opacity-80 mt-1">Please check your connection and try again.</p>
      </div>
    )
  }

  const summaryData = [
    { title: 'Total Customers', value: dashboard.totalCustomers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Registered users' },
    { title: 'Total Owners', value: dashboard.totalOwners.toLocaleString(), icon: UserSquare2, color: 'text-brand-mint', bg: 'bg-brand-mint/10', trend: 'Partnered businesses' },
    { title: 'Active Turfs', value: dashboard.activeTurfs.toLocaleString(), icon: TentTree, color: 'text-primary', bg: 'bg-primary/10', trend: 'Live on platform' },
    { title: 'Pending Turfs', value: dashboard.pendingTurfs.toLocaleString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: 'Requires approval' },
    
    { title: 'Total Bookings', value: dashboard.totalBookings.toLocaleString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'All-time reservations' },
    { title: "Today's Activity", value: dashboard.todaysActivity.toLocaleString(), icon: Activity, color: 'text-accent', bg: 'bg-accent/10', trend: 'Matches scheduled today' },
    { title: 'Total Revenue', value: '₹' + dashboard.totalRevenue.toLocaleString('en-IN'), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'Total collected' },
    { title: 'Successful Pymts', value: dashboard.successfulPayments.toLocaleString(), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'Completed transactions' },
  ]

  const recentBookings = dashboard.recentBookings || []
  const recentPayments = dashboard.recentTransactions || []

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Live metrics strictly driven by active APIs.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryData.map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Card className="hover:border-brand-mint/40 transition-all duration-300 h-full shadow-sm bg-card/40 backdrop-blur-xl border-border/50 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate pr-2">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${item.bg} group-hover:scale-110 transition-transform shrink-0`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1 truncate">
                  {item.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Recent Bookings Feed directly from Bookings API */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live from API</p>
            </div>
            <Link href="/admin/bookings" className="self-end xs:self-auto">
              <Button variant="outline" size="sm" className="rounded-full border-brand-mint/20 bg-brand-mint/5 text-brand-mint hover:bg-brand-mint hover:text-brand-dark-green font-semibold transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No bookings found.</div>
              ) : recentBookings.map((booking: any, i: number) => (
                <div key={booking.id || i} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors border border-transparent hover:border-border gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-foreground">{booking.turf_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{booking.customer_name} • {booking.booking_date?.split('T')[0]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-brand-mint text-sm">₹{parseFloat(booking.total_price || '0').toLocaleString('en-IN')}</div>
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
          <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live from API</p>
            </div>
            <Link href="/admin/payments" className="self-end xs:self-auto">
              <Button variant="outline" size="sm" className="rounded-full border-brand-mint/20 bg-brand-mint/5 text-brand-mint hover:bg-brand-mint hover:text-brand-dark-green font-semibold transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No transactions found.</div>
              ) : recentPayments.map((payment: any, i: number) => (
                <div key={payment.id || i} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors border border-transparent hover:border-border gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-foreground">{payment.turf_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{payment.customer_name} • {payment.booking_date?.split('T')[0]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-brand-mint text-sm">₹{parseFloat(payment.total_price || '0').toLocaleString('en-IN')}</div>
                    <div className={`text-xs mt-0.5 font-medium px-2 py-0.5 rounded-full inline-block ${
                      payment.status === 'CONFIRMED' || payment.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                      payment.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {payment.status?.replace('_', ' ')}
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
