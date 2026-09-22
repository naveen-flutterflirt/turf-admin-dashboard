"use client"
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Users, TentTree, Ban, CalendarCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { paymentsService } from '@/services/payments'
import { bookingsService } from '@/services/bookings'
import { usersService } from '@/services/users'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar
} from 'recharts'

// Custom Tooltip for Revenue Chart
 
const CustomRevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-xl min-w-[150px]">
        <p className="text-sm text-muted-foreground font-medium mb-2 pb-2 border-b border-border/50">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            <span className="text-lg font-bold text-primary">
              ₹{payload[0].value.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">Bookings</span>
            <span className="text-sm font-bold text-foreground">
              {data.bookingsCount || 0}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bookings Chart
 
const CustomBookingsTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-xl">
        <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-lg font-bold text-accent">
          {payload[0].value} <span className="text-sm font-normal text-muted-foreground">bookings</span>
        </p>
      </div>
    );
  }
  return null;
};
export default function ReportsPage() {
  const { data: paymentsData } = useQuery({ queryKey: ['payments'], queryFn: paymentsService.getPayments })
  const { data: bookings } = useQuery({ queryKey: ['bookings'], queryFn: bookingsService.getBookings })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersService.getUsers })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // 1. Revenue by Date (last 30 days) formatted for Recharts
  const revenueChartData = useMemo(() => {
    if (!paymentsData?.data) return []
    const revMap: Record<string, number> = {}
    const bookingsMap: Record<string, number> = {}
    
    paymentsData.data.forEach(p => {
      if (p.payment_status === 'CONFIRMED') {
        try {
          const d = new Date(p.payment_date).toISOString().split('T')[0]
          revMap[d] = (revMap[d] || 0) + parseFloat(p.amount || '0')
        } catch {}
      }
    })

    if (bookings) {
      bookings.forEach(b => {
        try {
          const d = new Date(b.booking_date).toISOString().split('T')[0]
          bookingsMap[d] = (bookingsMap[d] || 0) + 1
        } catch {}
      })
    }

    const last30Days = Array.from({length: 30}, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const dateStr = d.toISOString().split('T')[0]
      return {
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        revenue: revMap[dateStr] || 0,
        bookingsCount: bookingsMap[dateStr] || 0
      }
    })

    return last30Days
  }, [paymentsData, bookings])

  // 2. Bookings (last 7 days) formatted for Recharts
  const bookingsChartData = useMemo(() => {
    if (!bookings) return []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const countsMap: Record<string, number> = {}
    
    bookings.forEach(b => {
      try {
        const d = new Date(b.booking_date).toISOString().split('T')[0]
        countsMap[d] = (countsMap[d] || 0) + 1
      } catch {}
    })

    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      return {
        day: dayNames[d.getDay()],
        bookings: countsMap[dateStr] || 0
      }
    })

    return last7Days
  }, [bookings])

  // 3. Top Turfs by Revenue
  const topTurfs = useMemo(() => {
    if (!paymentsData?.data) return []
    const turfMap: Record<string, number> = {}
    
    paymentsData.data.forEach(p => {
      if (p.payment_status === 'CONFIRMED') {
        turfMap[p.turf_name] = (turfMap[p.turf_name] || 0) + parseFloat(p.amount || '0')
      }
    })

    return Object.entries(turfMap)
      .map(([name, rev]) => ({ name, rev }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 3)
  }, [paymentsData])

  // 4. Active Users
  const activeUsersCount = users?.length || 0

  // 5. Cancellations Rate
  const cancellationRate = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0
    const cancelled = bookings.filter(b => String(b.status).toUpperCase() === 'CANCELLED').length
    return ((cancelled / bookings.length) * 100).toFixed(1)
  }, [bookings])


  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Reports & Analytics</h2>
          <p className="text-muted-foreground mt-1">Live analytics dynamically computed from system data.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* REVENUE CHART */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-2">
          <Card className="h-full border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Revenue by Date</CardTitle>
              <CardDescription>Daily confirmed revenue trends for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                      dy={10}
                      minTickGap={20}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip content={<CustomRevenueTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* BOOKINGS CHART */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-accent/20 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-accent" /> Bookings</CardTitle>
              <CardDescription>Volume over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={bookingsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBookingsTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                    <Bar 
                      dataKey="bookings" 
                      fill="var(--accent)" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TOP TURFS */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TentTree className="w-5 h-5 text-green-500" /> Top Revenue Turfs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTurfs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4 text-sm">No revenue data yet.</div>
                ) : topTurfs.map((turf, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/60 transition-colors rounded-xl border border-transparent hover:border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-sm truncate max-w-[120px]">{turf.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary whitespace-nowrap">₹{turf.rev.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TOTAL USERS */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-blue-500/20 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex flex-col items-center justify-center">
                <div className="text-6xl font-black text-blue-500 mb-3 drop-shadow-sm">{activeUsersCount.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-wide">
                  Live Platform Registrations
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CANCELLATIONS */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-red-500/20 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500"><Ban className="w-5 h-5" /> Cancellations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[180px]">
                <div className="text-center">
                  <div className="text-6xl font-black text-red-500 drop-shadow-sm">{cancellationRate}%</div>
                  <p className="text-sm font-medium text-muted-foreground mt-3 bg-red-500/10 text-red-500 inline-block px-3 py-1 rounded-full border border-red-500/20">
                    Overall cancellation rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  )
}
