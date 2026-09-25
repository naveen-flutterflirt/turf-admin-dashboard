"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TentTree, CalendarCheck, IndianRupee, Activity, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function OwnerDashboardPage() {
   
  const { data: dashboardData, isLoading: loading, isError } = useQuery({
    queryKey: ['ownerDashboard'],
    queryFn: dashboardService.getOwnerDashboard
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-mint animate-spin" />
      </div>
    )
  }

  if (isError || !dashboardData) {
    return (
      <div className="text-center text-red-500 py-10 bg-red-500/5 rounded-xl border border-red-500/20 max-w-4xl">
        <h3 className="text-lg font-semibold">Failed to load owner dashboard</h3>
        <p className="text-sm opacity-80 mt-1">Please check your connection and try again.</p>
      </div>
    )
  }

  const summaryData = [
    { title: 'Total Turfs', value: dashboardData.total_turfs.toLocaleString(), icon: TentTree, color: 'text-primary', bg: 'bg-primary/10', trend: 'Registered turfs' },
    { title: 'Occupancy Rate', value: dashboardData.occupancy_rate + '%', icon: Activity, color: 'text-brand-mint', bg: 'bg-brand-mint/10', trend: 'Average occupancy' },
    { title: 'Total Bookings', value: dashboardData.total_bookings.toLocaleString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'All-time reservations' },
    { title: 'Total Earnings', value: '₹' + dashboardData.total_earnings.toLocaleString('en-IN'), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'Total revenue' },
  ]

  const recentBookings = dashboardData.recent_bookings || []
  
  // Map weekly_earnings from API to trendData format expected by Recharts
  // Ensure we map 'label' to 'name' and 'value' to 'revenue'
  const trendData = (dashboardData.weekly_earnings || []).map(entry => ({
    name: entry.label,
    revenue: entry.value
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Owner Dashboard</h2>
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
            <Card className="hover:border-brand-mint/40 transition-all duration-300 h-full shadow-sm bg-card/40 backdrop-blur-xl border-border/50 group">
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
                  {item.value}
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
              <Button variant="outline" size="sm" className="rounded-full border-brand-mint/20 bg-brand-mint/5 text-brand-mint hover:bg-brand-mint hover:text-brand-dark-green font-semibold transition-all duration-300">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No recent bookings found.</div>
              ) : recentBookings.map((booking, i: number) => (
                <div key={booking.booking_id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors border border-transparent hover:border-border">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{booking.turf_name} {booking.sport_name ? `(${booking.sport_name})` : ''}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {booking.customer_name} • {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-mint text-sm">
                      {booking.status.toUpperCase() === 'CONFIRMED' 
                        ? `₹${parseFloat(booking.total_price).toLocaleString('en-IN')}` 
                        : <span className="text-muted-foreground/50 font-normal">₹{parseFloat(booking.total_price).toLocaleString('en-IN')}</span>}
                    </div>
                    <div className={`text-xs mt-0.5 font-bold px-2 py-0.5 rounded-full inline-block border ${
                      booking.status.toUpperCase() === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      booking.status.toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      booking.status.toUpperCase().includes('PENDING') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {booking.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Chart */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-brand-mint" /> Revenue Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your earnings over the last 7 days</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center min-h-[300px]">
            {trendData.length === 0 ? (
               <div className="text-center py-6 text-muted-foreground">No revenue data available.</div>
            ) : (
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenueOwner" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#03E9A5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#03E9A5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#707D7D' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#707D7D' }} 
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#AACBC4" opacity={0.2} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#032221', borderColor: '#2CC295', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#03E9A5', fontWeight: 'bold' }}
                      formatter={(value: any) => [`₹${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#03E9A5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenueOwner)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
