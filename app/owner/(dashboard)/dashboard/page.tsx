"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TentTree, CalendarCheck, IndianRupee, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from '@/lib/axios'
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
   
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null;
        if (!token) throw new Error("No authorization token found");

        const [dashboardRes, bookingsRes, turfsRes] = await Promise.all([
          axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/turfs', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null)
        ]);

        if (dashboardRes.data && dashboardRes.data.success) {
          const dashData = dashboardRes.data.data;
          
          // Override buggy total_bookings with actual count from bookings API
          if (bookingsRes?.data) {
             const trueCount = bookingsRes.data.meta?.total || bookingsRes.data.total || bookingsRes.data.data?.length || dashData.recent_bookings?.length || 0;
             dashData.true_total_bookings = trueCount;
          }
          
          // Override buggy total_turfs with actual count from turfs API
          if (turfsRes?.data) {
             const trueTurfsCount = turfsRes.data.meta?.total || turfsRes.data.total || turfsRes.data.data?.length || turfsRes.data?.length || 0;
             dashData.true_total_turfs = trueTurfsCount;
          }
          
          // Override buggy total_earnings with actual sum from confirmed bookings
          let trueRevenue = 0;
          
          const isConfirmed = (status: string) => {
            const s = (status || '').toUpperCase();
            return s === 'CONFIRMED' || s === 'CONNFIRMED';
          };
          
          if (bookingsRes?.data?.data && Array.isArray(bookingsRes.data.data)) {
             trueRevenue = bookingsRes.data.data
               .filter((b: any) => isConfirmed(b.status))
               .reduce((sum: number, b: any) => sum + parseFloat(b.amount || b.total_price || '0'), 0);
          }
          if (dashData.recent_bookings && Array.isArray(dashData.recent_bookings)) {
             const recentRev = dashData.recent_bookings
               .filter((b: any) => isConfirmed(b.status))
               .reduce((sum: number, b: any) => sum + parseFloat(b.amount || b.total_price || '0'), 0);
             if (recentRev > trueRevenue) trueRevenue = recentRev;
          }
          const backendRevenue = parseFloat(dashData.total_earnings || dashData.totalRevenue || '0');
          // Only fallback to backend revenue if it's strictly greater (meaning they have more pages of revenue) 
          // AND we know backend isn't buggy. Given it was buggy, we rely mostly on trueRevenue.
          dashData.true_total_revenue = trueRevenue;
          
          // Attach bookingsRes data to dashboardData so the chart can use it
          if (bookingsRes?.data?.data && Array.isArray(bookingsRes.data.data)) {
             dashData.all_fetched_bookings = bookingsRes.data.data;
          }
          
          setDashboardData(dashData);
        } else {
          console.error("Dashboard API error:", dashboardRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard()
  }, [])

  // Provide fallback zeroes if data is missing or loading
  const totalTurfs = dashboardData?.true_total_turfs ?? dashboardData?.total_turfs ?? dashboardData?.totalTurfs ?? 0
  const occupancyRate = dashboardData?.occupancy_rate || 0
  const totalBookings = dashboardData?.true_total_bookings ?? dashboardData?.total_bookings ?? dashboardData?.totalBookings ?? 0
  const totalRevenue = dashboardData?.true_total_revenue ?? dashboardData?.total_earnings ?? dashboardData?.totalRevenue ?? 0

  const summaryData = [
    { title: 'Total Turfs', value: totalTurfs.toLocaleString(), icon: TentTree, color: 'text-primary', bg: 'bg-primary/10', trend: 'Registered turfs' },
    { title: 'Occupancy Rate', value: occupancyRate + '%', icon: Activity, color: 'text-brand-mint', bg: 'bg-brand-mint/10', trend: 'Average occupancy' },
    { title: 'Total Bookings', value: totalBookings.toLocaleString(), icon: CalendarCheck, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'All-time reservations' },
    { title: 'Total Earnings', value: '₹' + totalRevenue.toLocaleString('en-IN'), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-500/10', trend: 'Total revenue' },
  ]

  const recentBookings = dashboardData?.recent_bookings || dashboardData?.recentBookings || []

  // Dynamically calculate revenue trend from known bookings if not provided by backend
  let trendData = dashboardData?.revenue_trend;
  
  // Create a unified list of unique bookings we have available in the frontend state
  const allKnownBookings = [
    ...(dashboardData?.recent_bookings || []),
    ...(dashboardData?.all_fetched_bookings || [])
  ];
  
  // Deduplicate by ID to prevent double counting
  const uniqueBookingsMap = new Map();
  let fakeIdCounter = 0;
  allKnownBookings.forEach((b: any) => {
    if (b) uniqueBookingsMap.set(b.booking_id || b.id || `fake_${fakeIdCounter++}`, b);
  });
  const uniqueBookings = Array.from(uniqueBookingsMap.values());

  if (!trendData && uniqueBookings.length > 0) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueMap: Record<string, number> = {};
    const dateLabels: Record<string, string> = {}; // Store exact date string for X-axis if needed
    
    // Initialize last 7 days exactly in chronological order
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      revenueMap[dayName] = 0;
      dateLabels[dayName] = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // e.g. "18 Sep"
    }

    uniqueBookings.forEach((booking: any) => {
      if (booking.booking_date || booking.created_at) {
        try {
          const bDate = new Date(booking.booking_date || booking.created_at);
          // Only count if it's within the last 7 days
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - bDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays <= 7) {
            const dayName = days[bDate.getDay()];
            const s = (booking.status || '').toUpperCase();
            if (s === 'CONFIRMED' || s === 'CONNFIRMED') {
              const amount = parseFloat(booking.amount || booking.total_price || '0');
              if (revenueMap[dayName] !== undefined) {
                revenueMap[dayName] += amount;
              }
            }
          }
        } catch(e) {}
      }
    });

    trendData = Object.keys(revenueMap).map(day => ({
      name: day,
      revenue: revenueMap[day]
    }));
  } else if (!trendData) {
    trendData = [
      { name: 'Mon', revenue: 0 },
      { name: 'Tue', revenue: 0 },
      { name: 'Wed', revenue: 0 },
      { name: 'Thu', revenue: 0 },
      { name: 'Fri', revenue: 0 },
      { name: 'Sat', revenue: 0 },
      { name: 'Sun', revenue: 0 },
    ];
  }

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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {booking.customer_name || 'Customer'} • {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : booking.date || 'Date'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary text-sm">
                      {((booking.status || '').toUpperCase() === 'CONFIRMED' || (booking.status || '').toUpperCase() === 'CONNFIRMED') 
                        ? `₹${parseFloat(booking.amount || booking.total_price || '0').toLocaleString('en-IN')}` 
                        : <span className="text-muted-foreground/50 font-normal">-</span>}
                    </div>
                    <div className={`text-xs mt-0.5 font-bold px-2 py-0.5 rounded-full inline-block border ${
                      (booking.status || '').toUpperCase() === 'CONFIRMED' || (booking.status || '').toUpperCase() === 'CONNFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      (booking.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      (booking.status || '').toUpperCase().includes('PENDING') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {booking.status === 'CONNFIRMED' ? 'CONFIRMED' : booking.status || 'PENDING'}
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-mint" /> Revenue Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your earnings over the last 7 days</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center min-h-[300px]">
            {loading ? (
              <div className="w-full h-full min-h-[250px] bg-muted/20 animate-pulse rounded-xl"></div>
            ) : (
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00DF81" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00DF81" stopOpacity={0}/>
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
                      itemStyle={{ color: '#00DF81', fontWeight: 'bold' }}
                      formatter={(value: any) => [`₹${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#00DF81" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
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
