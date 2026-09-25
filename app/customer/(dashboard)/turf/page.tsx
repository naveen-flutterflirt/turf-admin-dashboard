"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { customerTurfsService, TurfData } from '@/services/customer-turfs'
import { MapPin, Navigation, IndianRupee, Clock, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CustomerTurfsPage() {
  const [turfs, setTurfs] = useState<TurfData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [radius, setRadius] = useState<number>(200) // Default max radius covering test data
  const [isFeatured, setIsFeatured] = useState(false) // Default to false to show all
  const [filtersActive, setFiltersActive] = useState(false)
  
  // Defaulting to user's requested location where turfs exist
  const [userLoc] = useState({ lat: 23.2599, lng: 77.4126 })

  const fetchTurfs = async () => {
    setLoading(true)
    
    // If filters aren't active, we fetch everything. If they are, we pass the location and radius.
    const params: any = {}
    if (isFeatured) params.is_featured = true
    if (filtersActive) {
      params.lat = userLoc.lat
      params.lng = userLoc.lng
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
    fetchTurfs()
  }, [radius, isFeatured, filtersActive, userLoc])

  // Client-side search filtering
  const filteredTurfs = turfs.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Explore Turfs</h1>
          <p className="text-muted-foreground">Find and book the best premium turfs near you.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or city..." 
              className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl shrink-0 ${showFilters ? 'bg-white text-black hover:bg-white/90' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card/20 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Radius Slider */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Search Radius</label>
                  <span className="text-sm text-brand-caribbean font-bold">
                    {filtersActive ? `${radius} km` : 'Anywhere'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="250" 
                  step="10"
                  value={radius}
                  onChange={(e) => {
                    setFiltersActive(true)
                    setRadius(parseInt(e.target.value))
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10 km</span>
                  <span>250 km</span>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-brand-caribbean' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-6' : ''}`} />
                </button>
                <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setIsFeatured(!isFeatured)}>
                  Show Featured Only
                </label>
              </div>

              {/* Clear Filters Button */}
              {(filtersActive || isFeatured) && (
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setFiltersActive(false)
                      setIsFeatured(false)
                      setRadius(200)
                    }}
                    className="h-10 border-white/10 hover:bg-white/5 rounded-xl text-muted-foreground"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-card/40 border border-border/50 rounded-3xl overflow-hidden h-[400px]">
              <div className="h-48 bg-muted/50" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted/50 rounded-md w-2/3" />
                <div className="h-4 bg-muted/50 rounded-md w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-muted/50 rounded-full w-20" />
                  <div className="h-8 bg-muted/50 rounded-full w-20" />
                </div>
                <div className="h-10 bg-muted/50 rounded-xl w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurfs.map((turf, index) => (
            <motion.div 
              key={turf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card/20 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:bg-card/40 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={turf.images?.[0]?.image_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1000&q=80"} 
                  alt={turf.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {turf.is_featured && (
                    <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full ${turf.is_open ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                    {turf.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">{turf.name}</h2>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 opacity-70" /> {turf.address}, {turf.city}
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                  <div className="flex items-center text-muted-foreground gap-2 text-sm">
                    <div className="p-1.5 bg-white/5 rounded-full">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    <span>{turf.distance_km ? `${parseFloat(turf.distance_km).toFixed(1)} km` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-foreground font-semibold text-lg">
                    <IndianRupee className="w-4 h-4 opacity-50" />
                    {parseInt(turf.price_per_hour)}
                    <span className="text-muted-foreground text-sm font-normal ml-1">/ hr</span>
                  </div>
                </div>

                {/* Sports Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {turf.sports?.slice(0, 3).map((sport) => (
                    <span key={sport.id} className="bg-white/5 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border border-white/5">
                      {sport.name}
                    </span>
                  ))}
                  {turf.sports?.length > 3 && (
                    <span className="bg-white/5 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border border-white/5">
                      +{turf.sports.length - 3}
                    </span>
                  )}
                </div>

                {/* Timings */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 bg-black/20 py-3 rounded-2xl border border-white/5">
                  <Clock className="w-4 h-4 opacity-50" />
                  <span className="font-medium tracking-wide">{turf.opening_time.slice(0, 5)} — {turf.closing_time.slice(0, 5)}</span>
                </div>

                <div className="mt-auto">
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold text-sm h-12 rounded-2xl transition-all">
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
