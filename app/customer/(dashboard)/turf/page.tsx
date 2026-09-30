"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { customerTurfsService, TurfData } from '@/services/customer-turfs'
import { customerBookingsService } from '@/services/customer-bookings'
import { MapPin, Navigation, IndianRupee, Clock, Search, Filter, X, Calendar, ChevronDown, Star, ChevronRight, ChevronLeft, XCircle, SlidersHorizontal, Activity, Users, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Industry standard Haversine formula for calculating distance client-side as fallback
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

function getTurfRating(turf: TurfData) {
  const calcRating = turf.feedbacks?.length 
    ? (turf.feedbacks.reduce((acc: number, f: any) => acc + (f.rating || 0), 0) / turf.feedbacks.length) 
    : 0;
  return (parseFloat(turf.average_rating) || calcRating || 0).toFixed(1);
}

function getTurfReviewsCount(turf: TurfData) {
  return parseInt(turf.total_reviews || '0') || (turf.feedbacks?.length ? turf.feedbacks.length : 0);
}

const TurfCard = ({ turf, onClick }: { turf: TurfData, onClick: () => void }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const images = turf.images && turf.images.length > 0 ? turf.images : [{ id: 'default', image_url: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1000&q=80" } as any];

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  }

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group flex flex-col cursor-pointer relative w-full"
    >
      {/* Image container - sleek, large border radius, aspect ratio */}
      <div className="relative w-full aspect-[4/3] flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
        <img 
          src={images[currentImg].image_url} 
          alt={turf.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Subtle gradient for text readability if we put something over it */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
        
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button onClick={prevImg} className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextImg} className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'bg-white w-4' : 'bg-white/60 w-1.5'}`} />
              ))}
            </div>
          </>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/95 dark:bg-black/50 backdrop-blur-md px-2 py-1 rounded-full shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 
          <span className="font-bold text-black dark:text-white text-xs pr-1">{getTurfRating(turf)}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start mb-1 gap-4">
          <h2 className="text-lg font-bold truncate text-foreground leading-tight group-hover:text-brand-caribbean transition-colors">{turf.name}</h2>
          <div className="flex items-center shrink-0">
            <span className="font-bold text-foreground text-lg leading-none">₹{parseInt(turf.price_per_hour)}</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground truncate mb-1.5 font-medium">
          {turf.city}, {turf.state}
        </div>

        <div className="text-sm text-muted-foreground/70 truncate mb-3">
          {turf.sports?.map(s => s.name).join(' • ') || 'Various Sports'}
        </div>

      </div>
    </motion.div>
  )
}

export default function CustomerTurfsPage() {
  const router = useRouter()
  const [turfs, setTurfs] = useState<TurfData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [radius, setRadius] = useState<number>(200) // Default max radius covering test data
  const [isFeatured, setIsFeatured] = useState(false) // Default to false to show all
  const [filtersActive, setFiltersActive] = useState(false)
  
  // Custom dropdown filters
  const [activeDropdown, setActiveDropdown] = useState<'distance' | 'price' | 'sport' | null>(null)
  const [filterDistance, setFilterDistance] = useState('Any distance')
  const [filterPrice, setFilterPrice] = useState('Any price')
  const [filterSport, setFilterSport] = useState('Any sport')
  
  // Defaulting to user's requested location where turfs exist
  const [userLoc, setUserLoc] = useState({ lat: 23.2599, lng: 77.4126 })
  const [isLocating, setIsLocating] = useState(true)

  // Modal & Booking States
  const [selectedTurf, setSelectedTurf] = useState<TurfData | null>(null)
  const [modalImgIndex, setModalImgIndex] = useState(0)
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false)
  
  // Form states for booking
  const [bookingStep, setBookingStep] = useState<0 | 1 | 2>(0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{start_time: string, end_time: string, price: number, label?: string, status?: string} | null>(null)
  
  const [isBooking, setIsBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  // Generate next 7 days for the date picker
  const upcomingDates = Array.from({length: 7}).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const [fetchedSlots, setFetchedSlots] = useState<{ morning: any[], afternoon: any[], evening: any[] }>({ morning: [], afternoon: [], evening: [] })
  const [isFetchingSlots, setIsFetchingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTurf || !selectedSport) {
        setFetchedSlots({ morning: [], afternoon: [], evening: [] });
        return;
      }
      
      setIsFetchingSlots(true);
      setSlotsError('');
      setFetchedSlots({ morning: [], afternoon: [], evening: [] });

      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await customerTurfsService.getTurfSlots(selectedTurf.id, dateStr, selectedSport);

      if (res.success && Array.isArray(res.data)) {
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        
        const grouped = { morning: [] as any[], afternoon: [] as any[], evening: [] as any[] };
        
        res.data.forEach((apiSlot: any) => {
          if (!apiSlot.start || !apiSlot.end) return;
          
          // "if time is passed then it should not show the slots" -> user updated: 
          // "if time was end then sho like or unavailable... if booked then show booke status like red shadow"
          // So we don't return/skip them anymore, we just let them flow through and handle in UI.
          
          const startHour = parseInt(apiSlot.start.split(':')[0]);
          const startMin = parseInt(apiSlot.start.split(':')[1]);
          const endHour = parseInt(apiSlot.end.split(':')[0]);
          const endMin = parseInt(apiSlot.end.split(':')[1]);
          
          const ampm1 = startHour >= 12 ? 'PM' : 'AM';
          const ampm2 = endHour >= 12 ? 'PM' : 'AM';
          const h1 = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
          const h2 = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
          
          const slot = {
            ...apiSlot,
            start_time: apiSlot.start.length === 5 ? `${apiSlot.start}:00` : apiSlot.start,
            end_time: apiSlot.end.length === 5 ? `${apiSlot.end}:00` : apiSlot.end,
            label: `${h1.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} ${ampm1} - ${h2.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')} ${ampm2}`,
            price: apiSlot.price || parseFloat(selectedTurf.price_per_hour)
          };
          
          if (startHour < 12) grouped.morning.push(slot);
          else if (startHour < 17) grouped.afternoon.push(slot);
          else grouped.evening.push(slot);
        });
        
        setFetchedSlots(grouped);
      } else {
        setSlotsError(res.message || 'Failed to load slots');
      }
      setIsFetchingSlots(false);
    };

    fetchSlots();
  }, [selectedTurf, selectedSport, selectedDate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTurf || !selectedSport || !selectedSlot) {
      setBookingMessage("Please select sport, date and a time slot.")
      return
    }
    
    setIsBooking(true)
    setBookingMessage('Creating booking...')
    
    const formattedDate = selectedDate.toISOString().split('T')[0]
    const res = await customerBookingsService.createBooking({
      turf_id: selectedTurf.id,
      sport_id: selectedSport,
      date: formattedDate,
      time_slots: [{ start_time: selectedSlot.start_time, end_time: selectedSlot.end_time }]
    })
    
    setIsBooking(false)
    if (res.success && res.data?.order_id) {
      setBookingMessage("Initializing payment...")
      
      const resLoad = await loadRazorpay()
      if (!resLoad) {
        setBookingMessage("Payment SDK failed to load. Please check your connection.")
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY", 
        amount: res.data.amount,
        currency: res.data.currency || "INR",
        name: "Turf Arena",
        description: `Booking for ${selectedTurf.name}`,
        order_id: res.data.order_id,
        handler: async function (response: any) {
          setBookingMessage("Verifying payment...")
          const verifyRes = await customerBookingsService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
          if (verifyRes.success) {
            setBookingMessage("Booking confirmed successfully!")
            setTimeout(() => {
              setSelectedTurf(null)
              setBookingMessage("")
            }, 3000)
          } else {
            setBookingMessage(verifyRes.message || "Payment verification failed.")
          }
        },
        prefill: {
          name: "Customer", // Can be dynamically filled later
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#2DD4BF" // brand-caribbean hex
        }
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
      
      paymentObject.on('payment.failed', function (response: any) {
        setBookingMessage("Payment failed. Please try again.")
      })
    } else {
      setBookingMessage(res.message || "Failed to book.")
    }
  }

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLocating(false)
        },
        (err) => {
          console.warn('Geolocation error:', err.message)
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setIsLocating(false)
    }
  }, [])
  const fetchTurfs = async () => {
    setLoading(true)
    
    // If filters aren't active, we fetch everything. If they are, we pass the location and radius.
    const params: any = {}
    if (isFeatured) params.is_featured = true
    // Always pass location to get accurate distances from the server if possible
    if (userLoc.lat && userLoc.lng) {
      params.lat = userLoc.lat
      params.lng = userLoc.lng
    }
    
    if (filtersActive) {
      params.radius = radius
    }

    const res = await customerTurfsService.getTurfs(params)
    
    if (res.success && res.data) {
      setTurfs(res.data)
    } else {
      setError(res.message || 'Failed to load turfs')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isLocating) {
      fetchTurfs()
    }
  }, [radius, isFeatured, filtersActive, userLoc, isLocating])

  // Dynamic sports from turfs
  const availableSports = Array.from(
    new Set(turfs.flatMap(t => t.sports?.map(s => s.name) || []))
  )

  // Client-side search filtering
  const filteredTurfs = turfs.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCity = t.city.toLowerCase().includes(q);
      const matchSport = t.sports?.some(s => s.name.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchSport) return false;
    }
    
    // 2. Distance
    if (filterDistance !== 'Any distance' && userLoc.lat && userLoc.lng) {
      const dist = parseFloat(t.distance_km || getDistance(userLoc.lat, userLoc.lng, parseFloat(t.latitude), parseFloat(t.longitude)).toString());
      if (filterDistance === '0-5 km' && dist > 5) return false;
      if (filterDistance === '5-15 km' && (dist <= 5 || dist > 15)) return false;
      if (filterDistance === '15-30 km' && (dist <= 15 || dist > 30)) return false;
      if (filterDistance === '30+ km' && dist <= 30) return false;
    }

    // 3. Price
    if (filterPrice !== 'Any price') {
      const price = parseFloat(t.price_per_hour);
      if (filterPrice === '0-1000' && price > 1000) return false;
      if (filterPrice === '1000-3000' && (price <= 1000 || price > 3000)) return false;
      if (filterPrice === '3000-6000' && (price <= 3000 || price > 6000)) return false;
      if (filterPrice === '6000+' && price <= 6000) return false;
    }

    // 4. Sport
    if (filterSport !== 'Any sport') {
      if (!t.sports?.some(s => s.name === filterSport)) return false;
    }

    return true;
  })

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header and Search */}
      <div className="relative bg-gradient-to-br from-brand-caribbean/10 via-background to-brand-caribbean/5 rounded-[2rem] p-6 md:p-8 mb-6 border border-brand-caribbean/10 shadow-sm mt-2 z-30">
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-caribbean/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-brand-caribbean/10 blur-[80px]" />
        </div>
        
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 relative z-10 text-foreground">Search Turfs</h1>
        <p className="text-muted-foreground relative z-10 mb-6 text-sm max-w-xl">Find the perfect turf near you. Filter by distance, price, and sport to easily discover your next playground.</p>
        
        {/* Search Bar */}
        <div className="relative z-10 w-full bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border/40 focus-within:border-brand-caribbean/50 focus-within:shadow-[0_0_15px_rgba(32,178,170,0.1)] transition-all duration-300">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-caribbean" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by turf name, sports or location..." 
             className="w-full bg-transparent py-3.5 pl-11 pr-5 focus:outline-none rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/60"
           />
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5 relative z-10">
          
          {/* Distance Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'distance' ? null : 'distance')}
              className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${filterDistance !== 'Any distance' ? 'bg-brand-caribbean/10 border-brand-caribbean text-brand-caribbean' : 'bg-background/80 backdrop-blur-md border-border/60 text-foreground hover:bg-muted'}`}
            >
              <MapPin className="w-3.5 h-3.5" /> 
              {filterDistance === 'Any distance' ? 'Distance' : filterDistance} 
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <AnimatePresence>
              {activeDropdown === 'distance' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-48 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden z-50">
                  {['Any distance', '0-5 km', '5-15 km', '15-30 km', '30+ km'].map(opt => (
                    <button key={opt} onClick={() => { setFilterDistance(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${filterDistance === opt ? 'font-bold text-brand-caribbean' : 'text-foreground'}`}>{opt}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
              className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${filterPrice !== 'Any price' ? 'bg-brand-caribbean/10 border-brand-caribbean text-brand-caribbean' : 'bg-background/80 backdrop-blur-md border-border/60 text-foreground hover:bg-muted'}`}
            >
              <IndianRupee className="w-3.5 h-3.5" /> 
              {filterPrice === 'Any price' ? 'Price' : filterPrice} 
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <AnimatePresence>
              {activeDropdown === 'price' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-48 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden z-50">
                  {['Any price', '0-1000', '1000-3000', '3000-6000', '6000+'].map(opt => (
                    <button key={opt} onClick={() => { setFilterPrice(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${filterPrice === opt ? 'font-bold text-brand-caribbean' : 'text-foreground'}`}>
                      {opt === 'Any price' ? opt : `₹${opt}`}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sport Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'sport' ? null : 'sport')}
              className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${filterSport !== 'Any sport' ? 'bg-brand-caribbean/10 border-brand-caribbean text-brand-caribbean' : 'bg-background/80 backdrop-blur-md border-border/60 text-foreground hover:bg-muted'}`}
            >
              <Activity className="w-3.5 h-3.5" /> 
              {filterSport === 'Any sport' ? 'Sport' : filterSport} 
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <AnimatePresence>
              {activeDropdown === 'sport' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-48 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden z-50">
                  {['Any sport', ...availableSports].map(opt => (
                    <button key={opt} onClick={() => { setFilterSport(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${filterSport === opt ? 'font-bold text-brand-caribbean' : 'text-foreground'}`}>{opt}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {(filterDistance !== 'Any distance' || filterPrice !== 'Any price' || filterSport !== 'Any sport' || searchQuery) && (
            <button 
              onClick={() => { setFilterDistance('Any distance'); setFilterPrice('Any price'); setFilterSport('Any sport'); setSearchQuery(''); }}
              className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3.5 py-1.5 rounded-full text-xs font-semibold ml-auto hover:bg-red-500/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <h3 className="font-bold text-base mb-4">{filteredTurfs.length} turfs found</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col w-full animate-pulse">
              <div className="w-full aspect-[4/3] bg-card/60 border border-white/5 rounded-3xl mb-4" />
              <div className="flex justify-between items-start mb-2 px-1">
                <div className="h-5 bg-card/60 border border-white/5 rounded-full w-2/3" />
                <div className="h-5 bg-card/60 border border-white/5 rounded-full w-1/4" />
              </div>
              <div className="h-4 bg-card/60 border border-white/5 rounded-full w-1/2 mb-3 px-1" />
              <div className="h-3 bg-card/60 border border-white/5 rounded-full w-3/4 px-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 mx-4 bg-red-500/10 rounded-3xl border border-red-500/20">
          <p className="text-red-500 font-medium text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredTurfs.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No turfs found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
          {filteredTurfs.map((turf) => (
            <TurfCard 
              key={turf.id} 
              turf={turf} 
              onClick={() => { setSelectedTurf(turf); setBookingStep(0); setModalImgIndex(0); setShowAllFeedbacks(false); }} 
            />
          ))}
        </div>
      )}

      {/* Turf Details & Booking Modal */}
      <AnimatePresence>
        {selectedTurf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card w-full h-full md:h-[90vh] md:max-w-xl overflow-hidden md:rounded-3xl border border-white/10 shadow-2xl flex flex-col relative"
            >
              {bookingStep === 0 ? (
                <div className="flex flex-col flex-1 min-h-0 bg-background relative w-full rounded-3xl">
                  {/* Top Image Section */}
                  <div className="relative h-64 md:h-72 w-full flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={selectedTurf.images?.[modalImgIndex]?.image_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1000&q=80"} 
                      alt={selectedTurf.name} 
                      className="w-full h-full object-cover transition-opacity duration-300" 
                    />
                    
                    {selectedTurf.images && selectedTurf.images.length > 1 && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setModalImgIndex((prev) => (prev - 1 + selectedTurf.images!.length) % selectedTurf.images!.length); }} 
                            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-black flex items-center justify-center shadow hover:bg-white transition-colors pointer-events-auto"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setModalImgIndex((prev) => (prev + 1) % selectedTurf.images!.length); }} 
                            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-black flex items-center justify-center shadow hover:bg-white transition-colors pointer-events-auto"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Dots */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
                          {selectedTurf.images.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === modalImgIndex ? 'bg-white scale-110' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Top action buttons */}
                    <div className="absolute top-4 left-4 z-20">
                      <button onClick={() => setSelectedTurf(null)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-md hover:bg-white/90">
                        <span className="text-xl leading-none font-bold pb-1">&larr;</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Container overlapping the image */}
                  <div className="flex-1 bg-card rounded-t-3xl -mt-6 relative z-10 p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-1">{selectedTurf.name}</h1>
                    <p className="text-muted-foreground text-sm mb-4">{selectedTurf.description || "Premium turf facility with parking and changing facilities."}</p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-6 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 text-brand-caribbean" />
                      <span>{selectedTurf.address}, {selectedTurf.city}, {selectedTurf.state} {selectedTurf.pincode}</span>
                    </div>
                    
                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTurf.sports?.map(s => (
                        <span key={s.id} className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-semibold">
                          <Activity className="w-3 h-3" /> {s.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-8">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-foreground">{getTurfRating(selectedTurf)}</span>
                      <span className="text-muted-foreground text-sm">({getTurfReviewsCount(selectedTurf)} reviews)</span>
                    </div>
                    
                    {/* Turf Information */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-foreground mb-4">Turf Information</h3>
                      <div className="bg-background border border-border/40 rounded-2xl p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="p-2 bg-brand-caribbean/10 rounded-full"><IndianRupee className="w-4 h-4 text-brand-caribbean" /></div>
                            <span className="text-sm">Price Per Hour</span>
                          </div>
                          <span className="font-bold text-foreground">₹{parseInt(selectedTurf.price_per_hour)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-border/40">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="p-2 bg-brand-caribbean/10 rounded-full"><Clock className="w-4 h-4 text-brand-caribbean" /></div>
                            <span className="text-sm">Opening Hours</span>
                          </div>
                          <span className="font-bold text-foreground text-sm">{selectedTurf.opening_time.slice(0, 5)} - {selectedTurf.closing_time.slice(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-foreground mb-4">Amenities</h3>
                      {selectedTurf.amenities && selectedTurf.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTurf.amenities.map((amenity: any, idx: number) => (
                            <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-sm text-foreground shadow-sm">
                              {amenity.name || amenity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No amenities listed</p>
                      )}
                    </div>

                    {/* Customer Feedbacks */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-foreground mb-4">Customer Feedback</h3>
                      {selectedTurf.feedbacks && selectedTurf.feedbacks.length > 0 ? (
                        <div className="space-y-4">
                          {(showAllFeedbacks ? selectedTurf.feedbacks : selectedTurf.feedbacks.slice(0, 5)).map((feedback: any, idx: number) => (
                            <div key={idx} className="bg-background border border-border/40 p-4 rounded-2xl">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-sm">{feedback.customer_name || 'Anonymous User'}</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                                  ))}
                                </div>
                              </div>
                              {feedback.comment && <p className="text-sm text-muted-foreground/90">{feedback.comment}</p>}
                            </div>
                          ))}
                          {selectedTurf.feedbacks.length > 5 && (
                            <button 
                              onClick={() => setShowAllFeedbacks(!showAllFeedbacks)}
                              className="text-brand-caribbean font-semibold text-sm hover:underline mt-2 inline-block"
                            >
                              {showAllFeedbacks ? 'Show Less' : `Show all ${selectedTurf.feedbacks.length} reviews`}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No feedback yet. Be the first to review!</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Fixed Bottom Bar */}
                  <div className="flex gap-3 p-4 bg-card border-t border-border/40 shrink-0 rounded-b-3xl">
                    <Button onClick={() => router.push('/customer/community')} variant="outline" className="flex-1 h-14 bg-brand-caribbean/10 text-brand-caribbean border-transparent hover:bg-brand-caribbean/20 rounded-2xl font-bold text-base">
                      Find Players <Users className="w-5 h-5 ml-2" />
                    </Button>
                    <Button onClick={() => setBookingStep(1)} className="flex-1 h-14 bg-[#0f766e] text-white hover:bg-[#115e59] rounded-2xl font-bold text-base shadow-lg">
                      Book Now &rarr;
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 bg-card relative w-full rounded-3xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-card z-10 sticky top-0 rounded-t-3xl shrink-0">
                    <h2 className="text-xl font-bold flex items-center">
                      <button 
                        type="button"
                        onClick={() => bookingStep === 2 ? setBookingStep(1) : setBookingStep(0)}
                        className="mr-3 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <span className="text-2xl leading-none pb-1">&larr;</span>
                      </button>
                      {bookingStep === 1 ? 'Select Date & Slot' : 'Booking Summary'}
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {bookingStep === 1 && (
                  <>
                    {/* Sports Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedTurf.sports?.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSport(s.id)}
                          className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${selectedSport === s.id ? 'bg-brand-caribbean text-black border-brand-caribbean shadow-[0_0_10px_rgba(45,212,191,0.3)]' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>

                    {/* Date Selector */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {upcomingDates.map((date, idx) => {
                        const isSelected = selectedDate.toDateString() === date.toDateString()
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl border transition-all ${isSelected ? 'bg-brand-caribbean text-black border-brand-caribbean shadow-[0_0_10px_rgba(45,212,191,0.3)]' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                          >
                            <span className="text-xs font-medium uppercase mb-1">{date.toLocaleDateString('en-US', {weekday: 'short'})}</span>
                            <span className="text-xl font-bold">{date.getDate()}</span>
                            <span className="text-xs">{date.toLocaleDateString('en-US', {month: 'short'})}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Time Slots */}
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-brand-caribbean"></div> Available</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Booked</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div> Unavailable</div>
                      </div>

                      {isFetchingSlots ? (
                        <div className="flex justify-center items-center py-10">
                          <div className="w-8 h-8 border-4 border-brand-caribbean/30 border-t-brand-caribbean rounded-full animate-spin" />
                        </div>
                      ) : !selectedSport ? (
                        <div className="text-center py-10 text-muted-foreground bg-background rounded-2xl border border-border">
                          <p>Please select a sport to view slots.</p>
                        </div>
                      ) : slotsError ? (
                        <div className="text-center py-10 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
                          <p>{slotsError}</p>
                        </div>
                      ) : fetchedSlots.morning.length === 0 && fetchedSlots.afternoon.length === 0 && fetchedSlots.evening.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-background rounded-2xl border border-border">
                          <p>No slots available for the selected date.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {['morning', 'afternoon', 'evening'].map(period => (
                            fetchedSlots[period as keyof typeof fetchedSlots].length > 0 && (
                              <div key={period}>
                                <h4 className="text-base font-semibold capitalize mb-3">{period}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {fetchedSlots[period as keyof typeof fetchedSlots].map((slot: any, i: number) => {
                                    const isSelected = selectedSlot?.start_time === slot.start_time
                                    const isAvailable = slot.status === 'AVAILABLE'
                                    const isBooked = slot.status === 'BOOKED'
                                    
                                    return (
                                      <button
                                        key={i}
                                        disabled={!isAvailable}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                          isSelected ? 'bg-brand-caribbean/20 border-brand-caribbean text-brand-caribbean' :
                                          isAvailable ? 'bg-background border-border text-foreground hover:bg-muted' :
                                          isBooked ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                          'bg-muted border-border text-muted-foreground/50 cursor-not-allowed'
                                        }`}
                                      >
                                        <span className="text-xs font-medium">{slot.label}</span>
                                        {isAvailable ? (
                                          <span className="text-[10px] mt-1 text-brand-caribbean font-bold">₹{slot.price}</span>
                                        ) : isBooked ? (
                                          <span className="text-[10px] mt-1 text-red-400 font-bold">Booked</span>
                                        ) : (
                                          <span className="text-[10px] mt-1">Unavailable</span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {bookingStep === 2 && (
                  <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-background border border-border rounded-2xl p-4 flex items-center gap-4">
                      <img src={selectedTurf.images?.[0]?.image_url} alt={selectedTurf.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-lg">{selectedTurf.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedTurf.city}</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Sport</span>
                        <span className="font-medium text-right">{selectedTurf.sports?.find(s => s.id === selectedSport)?.name || 'Selected Sport'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium text-right">{selectedDate.toDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium text-right">{selectedSlot?.label}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-right">1 Hour</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-border pt-4 mt-2">
                        <span className="font-bold">Total Amount</span>
                        <span className="font-bold text-brand-caribbean text-lg">₹{selectedSlot?.price}</span>
                      </div>
                    </div>
                    
                    {bookingMessage && (
                      <div className={`p-4 rounded-xl text-sm font-medium ${bookingMessage.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {bookingMessage}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              
              {/* Footer Actions */}
              <div className="flex-shrink-0 p-4 border-t border-white/10 bg-card z-10">
                {bookingStep === 1 ? (
                  <Button 
                    onClick={() => {
                      if (!selectedSport) setBookingMessage("Please select a sport.")
                      else if (!selectedSlot) setBookingMessage("Please select a time slot.")
                      else { setBookingMessage(''); setBookingStep(2) }
                    }}
                    className="w-full h-14 text-base font-semibold rounded-2xl bg-brand-caribbean text-black hover:bg-brand-caribbean/90 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                  >
                    Proceed
                  </Button>
                ) : (
                  <form onSubmit={handleBookNow}>
                    <Button 
                      type="submit" 
                      disabled={isBooking}
                      className="w-full h-14 text-base font-semibold rounded-2xl bg-brand-caribbean text-black hover:bg-brand-caribbean/90 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50"
                    >
                      {isBooking ? 'Processing...' : 'Pay Now'}
                    </Button>
                  </form>
                )}
                {bookingMessage && bookingStep === 1 && <p className="text-red-400 text-xs text-center mt-2">{bookingMessage}</p>}
              </div>
            </div>
          )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
