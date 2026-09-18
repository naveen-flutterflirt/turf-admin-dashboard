"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TentTree, CalendarCheck, IndianRupee, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from 'axios'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function OwnerDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Mock data since real API is not yet available
        setTimeout(() => {
          setDashboardData({
            totalTurfs: 3,
            activeTurfs: 2,
            totalBookings: 145,
            totalRevenue: 45000,
            recentBookings: [
              { id: '1', turf_name: 'Green Field Arena', customer_name: 'John Doe', date: '2026-09-18', amount: '1500', status: 'CONFIRMED' },
              { id: '2', turf_name: 'Downtown Turf', customer_name: 'Jane Smith', date: '2026-09-17', amount: '2000', status: 'CONFIRMED' },
              { id: '3', turf_name: 'Green Field Arena', customer_name: 'Mike Johnson', date: '2026-09-16', amount: '1500', status: 'PENDING' },
            ]
          })
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // Provide fallback zeroes if data is missing or loading
  const totalTurfs = dashboardData?.totalTurfs || dashboardData?.turfCount || 0
  const activeTurfs = dashboardData?.activeTurfs || 0
  const totalBookings = dashboardData?.totalBookings || dashboardData?.bookingCount || 0
  const totalRevenue = dashboardData?.totalRevenue || dashboardData?.revenue || 0

  const summaryData = [
    { title: 'Total Turfs', value: totalTurfs.toLocaleString(), icon: TentTree, color: 'text-primary', bg: 'bg-primary/10', trend: 'Registered turfs' },
    { title: 'Active Turfs', value: activeTurfs.toLocaleString(), icon: Activity, color: 'text-brand-mint', bg: 'bg-brand-mint/10', trend: 'Live and bookable' },
    { title: 'Total Bookings', value: totalBookings.toLocaleString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'All-time reservations' },
    { title: 'Total Revenue', value: '₹' + totalRevenue.toLocaleString('en-IN'), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'Total earnings' },
  ]

  const recentBookings = dashboardData?.recentBookings || []

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Owner Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your turfs and bookings.</p>
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
                <div className="text-3xl font-bold text-foreground">
                  {loading ? (
                    <div className="h-9 w-24 bg-muted animate-pulse rounded-md"></div>
                  ) : item.value}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  {item.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest customer reservations</p>
            </div>
            <Link href="/owner/bookings">
              <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-background transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No recent bookings found.</div>
              ) : recentBookings.map((booking: any, i: number) => (
                <div key={booking.id || i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border">
                  <div>
                    <p className="font-semibold text-sm">{booking.turf_name || 'Turf Name'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{booking.customer_name || 'Customer'} • {booking.date || booking.booking_date || 'Date'}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary text-sm">₹{parseFloat(booking.amount || booking.total_price || '0').toLocaleString('en-IN')}</div>
                    <div className={`text-xs mt-0.5 font-medium px-2 py-0.5 rounded-full inline-block ${
                      (booking.status || '').toUpperCase() === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' :
                      (booking.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {booking.status || 'PENDING'}
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
