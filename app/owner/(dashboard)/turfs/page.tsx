"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit2, Trash2, MapPin, CheckCircle2, Clock, XCircle, TentTree, AlignLeft, Info } from 'lucide-react'
import axios from '@/lib/axios'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const getParsedImages = (imagesData: any) => {
  if (!imagesData) return []
  if (Array.isArray(imagesData)) return imagesData
  if (typeof imagesData === 'string') {
    try {
      const parsed = JSON.parse(imagesData)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [imagesData]
    }
  }
  return [imagesData]
}

const getImageUrl = (imageObj: any) => {
  if (!imageObj) return null
  if (typeof imageObj === 'string') {
    try {
      const parsed = JSON.parse(imageObj)
      return parsed.image_url || parsed.url || null
    } catch {
      return imageObj // it's just a raw URL string
    }
  }
  return imageObj.image_url || imageObj.url || null
}

export default function OwnerTurfsPage() {
   
  const [turfs, setTurfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [turfToDelete, setTurfToDelete] = useState<string | null>(null)

  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
   
  const [selectedTurf, setSelectedTurf] = useState<any>(null)
  const [, setImageError] = useState(false)

  const fetchTurfs = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/turfs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success) {
        setTurfs(response.data.data || [])
      } else if (Array.isArray(response.data)) {
        setTurfs(response.data)
      } else {
        setTurfs([])
      }
    } catch (err: any) {
      console.error("Failed to fetch turfs", err)
      toast.error(err.response?.data?.message || "Failed to load your turfs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurfs()
  }, [])

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent opening details modal
    setTurfToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!turfToDelete) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/owner/turfs/${turfToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data && response.data.success !== false) {
        toast.success("Turf deleted successfully!")
        setTurfs(prev => prev.filter(t => (t.id || t.turf_id) !== turfToDelete))
        setDetailsModalOpen(false) // Close details if open
      } else {
        toast.error(response.data?.message || "Failed to delete turf.")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to delete turf.")
    } finally {
      setDeleteModalOpen(false)
      setTurfToDelete(null)
    }
  }

  const handleStatusChange = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation() // Prevent opening details modal
    const newStatus = currentStatus === 'ACTIVE' || currentStatus === 'APPROVED' ? 'INACTIVE' : 'ACTIVE'
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      // Using PUT as per standard, adjust URL if needed
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/owner/turfs/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success !== false) {
        toast.success(`Turf status updated to ${newStatus}`)
        setTurfs(prev => prev.map(t => (t.id || t.turf_id) === id ? { ...t, status: newStatus } : t))
      } else {
        toast.error(response.data?.message || "Failed to update status")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to update status")
    }
  }

   
  const openDetails = (turf: any) => {
    const parsedImages = getParsedImages(turf.images)
    let parsedSports = turf.sports || [];
    if (typeof parsedSports === 'string') {
      if (parsedSports.includes(',')) {
        parsedSports = parsedSports.split(',');
      } else {
        try { parsedSports = JSON.parse(parsedSports) } catch { parsedSports = [parsedSports] }
      }
    }
    
    // Defensive deduplication
    parsedSports = Array.isArray(parsedSports) ? Array.from(new Set(parsedSports.map((s: any) => typeof s === 'object' ? JSON.stringify(s) : s))).map(s => {
      try { return typeof s === 'string' && s.startsWith('{') ? JSON.parse(s) : s } catch { return s }
    }) : [];

    let parsedAmenities = turf.amenities || [];
    if (typeof parsedAmenities === 'string') {
      if (parsedAmenities.includes(',')) {
        parsedAmenities = parsedAmenities.split(',');
      } else {
        try { parsedAmenities = JSON.parse(parsedAmenities) } catch { parsedAmenities = [parsedAmenities] }
      }
    }
    
    // Defensive deduplication
    parsedAmenities = Array.isArray(parsedAmenities) ? Array.from(new Set(parsedAmenities.map((a: any) => typeof a === 'object' ? JSON.stringify(a) : a))).map(a => {
      try { return typeof a === 'string' && a.startsWith('{') ? JSON.parse(a) : a } catch { return a }
    }) : [];

    // Deduplicate images based on URL or string value
    const uniqueImages = Array.isArray(parsedImages) 
      ? parsedImages.filter((img, index, self) => 
          index === self.findIndex((t) => (
            getImageUrl(t) === getImageUrl(img)
          ))
        )
      : parsedImages;

    setSelectedTurf({ 
      ...turf, 
      images: uniqueImages,
      sports: parsedSports,
      amenities: parsedAmenities
    })
    setImageError(false)
    setDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Turfs</h2>
          <p className="text-muted-foreground mt-1">Manage your registered properties.</p>
        </div>
        <Link href="/owner/turfs/add">
          <Button className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-semibold shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Add New Turf
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card/40 backdrop-blur-xl border-border/50 h-[320px] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : turfs.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm p-12 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <TentTree className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Turfs Found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">You haven&apos;t added any turfs to your portfolio yet. Click the button above to get started.</p>
          <Link href="/owner/turfs/add">
            <Button className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-semibold shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Turf
            </Button>
          </Link>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence>
            {turfs.map((turf) => {
              const statusStr = String(turf.status).toUpperCase()
              const isActive = statusStr === 'ACTIVE' || statusStr === 'APPROVED'
              const isPending = statusStr === 'PENDING'

              const parsedImages = getParsedImages(turf.images)
              const imageUrl = parsedImages.length > 0 ? getImageUrl(parsedImages[0]) : null

              return (
                <motion.div
                  key={turf.id || turf.turf_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card
                    onClick={() => openDetails(turf)}
                    className="bg-card/40 backdrop-blur-md border-border/50 shadow-lg overflow-hidden group hover:border-brand-mint/30 hover:shadow-brand-mint/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl h-full flex flex-col"
                  >
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {/* Image or Placeholder */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={turf.name || turf.turf_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/40 to-black/80" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        <TentTree className="w-12 h-12 text-muted-foreground mb-2" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">No Image</span>
                      </div>

                      {/* Top Gradient Overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Status Badge overlay on top left */}
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <div className={`backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xl
                          ${isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            isPending ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : isPending ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {turf.status || 'UNKNOWN'}
                        </div>
                      </div>

                      {/* Top Right Action (Toggle Status) */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-8 h-8 bg-background/80 hover:bg-muted text-foreground backdrop-blur-md border border-border/50"
                          onClick={(e) => handleStatusChange(e, turf.id || turf.turf_id, turf.status)}
                          title="Toggle Status"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-xl truncate pr-2 text-foreground group-hover:text-brand-mint transition-colors duration-300">{turf.name || turf.turf_name}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4 line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-brand-mint/70" />
                        {turf.address && typeof turf.address === 'object' ? turf.address?.name : turf.address || (turf.location && typeof turf.location === 'object' ? turf.location?.name : turf.location) || 'No location provided'}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          {/* Quick preview of sports if available */}
                          {turf.sports && Array.isArray(turf.sports) && turf.sports.length > 0 && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                              {turf.sports.length} Sports
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-lg text-brand-mint drop-shadow-sm">
                          ₹{turf.price_per_hour || turf.price}<span className="text-xs text-muted-foreground font-normal">/hr</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Turf"
        description="Are you sure you want to delete this turf? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Turf
          </Button>
        </div>
      </Modal>

      {/* Full Details Modal */}
      {selectedTurf && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={selectedTurf.name || selectedTurf.turf_name}
          description="Complete property details"
          maxWidth="max-w-3xl"
        >
          <div className="mt-4 space-y-6">
            {/* Images Gallery */}
            <div className="w-full relative">
              {selectedTurf.images && selectedTurf.images.length > 0 ? (
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {selectedTurf.images.map((img: any, idx: number) => {
                    const url = getImageUrl(img);
                    if (!url) return null;
                    return (
                      <div key={idx} className="w-64 h-48 sm:w-72 sm:h-56 shrink-0 snap-center rounded-xl overflow-hidden bg-muted border border-border/50 relative">
                        <img src={url} alt={`Turf Image ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <div className="absolute top-3 left-3 bg-brand-mint text-brand-dark text-xs font-bold px-2 py-1 rounded-md">
                            Primary
                          </div>
                        )}
                        {idx === 0 && (
                          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg border border-border/50 font-bold text-sm">
                            ₹{selectedTurf.price_per_hour || selectedTurf.price}/hr
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-48 sm:h-64 rounded-xl flex flex-col items-center justify-center bg-muted border border-border/50">
                  <TentTree className="w-16 h-16 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Image Not Available</span>
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg border border-border/50 font-bold">
                    ₹{selectedTurf.price_per_hour || selectedTurf.price}/hr
                  </div>
                </div>
              )}
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <Clock className="w-3.5 h-3.5 text-brand-mint" /> Operating Hours
                </p>
                <p className="text-sm font-medium">
                  {selectedTurf.opening_time ? selectedTurf.opening_time.slice(0, 5) : 'N/A'} - {selectedTurf.closing_time ? selectedTurf.closing_time.slice(0, 5) : 'N/A'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-brand-mint" /> Location
                </p>
                <p className="text-sm font-medium truncate">
                  {selectedTurf.city || 'City N/A'}, {selectedTurf.state || 'State N/A'}
                </p>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Full Address
              </p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/50 leading-relaxed">
                {(selectedTurf.address && typeof selectedTurf.address === 'object' ? selectedTurf.address?.name : selectedTurf.address) || (selectedTurf.location && typeof selectedTurf.location === 'object' ? selectedTurf.location?.name : selectedTurf.location)}
                {selectedTurf.pincode && <span>{(selectedTurf.address || selectedTurf.location) ? ', ' : ''}{typeof selectedTurf.pincode === 'object' ? selectedTurf.pincode?.name : selectedTurf.pincode}</span>}
              </p>
            </div>

            {/* Description */}
            {selectedTurf.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Description
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedTurf.description}
                </p>
              </div>
            )}

            {/* Features: Sports & Amenities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sports */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Sports</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTurf.sports && Array.isArray(selectedTurf.sports) && selectedTurf.sports.length > 0 ? selectedTurf.sports.map((sport: any, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-brand-mint/10 text-brand-mint border border-brand-mint/20 text-xs font-medium">
                      {typeof sport === 'object' ? sport.name || sport.id : sport}
                    </span>
                  )) : <span className="text-xs text-muted-foreground italic">No sports added</span>}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTurf.amenities && Array.isArray(selectedTurf.amenities) && selectedTurf.amenities.length > 0 ? selectedTurf.amenities.map((amenity: any, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-brand-caribbean/10 text-brand-caribbean border border-brand-caribbean/20 text-xs font-medium">
                      {typeof amenity === 'object' ? amenity.name || amenity.id : amenity}
                    </span>
                  )) : <span className="text-xs text-muted-foreground italic">No amenities added</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-border/50 flex justify-between items-center gap-4">
              <Button
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={(e) => handleDeleteClick(e, selectedTurf.id || selectedTurf.turf_id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Turf
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
                <Link href={`/owner/turfs/${selectedTurf.id || selectedTurf.turf_id}/edit`}>
                  <Button className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
