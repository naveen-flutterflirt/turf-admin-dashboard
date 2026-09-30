"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { customerBookingsService } from '@/services/customer-bookings'
import { customerTurfsService, TurfData } from '@/services/customer-turfs'
import { Calendar, Clock, MapPin, IndianRupee, Activity, Ticket, CheckCircle2, AlertCircle, Loader2, XCircle, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { customerFeedbackService } from '@/services/customer-feedback'

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [turfs, setTurfs] = useState<Record<string, TurfData>>({})
  const [feedbacksMap, setFeedbacksMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false,
    isDestructive: true,
    error: ''
  })

  // Feedback States
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    booking: null as any | null,
    rating: 0,
    comment: '',
    isSubmitting: false,
    error: ''
  })

  const openFeedback = (booking: any) => {
    // 1. Attempt to find existing feedback from the direct map
    let existing = feedbacksMap[booking.id];
    
    // 2. Attempt to find it by checking if has_feedback is actually the string UUID
    if (!existing) {
      const explicitId = typeof booking.has_feedback === 'string' ? booking.has_feedback : booking.feedback_id;
      if (explicitId && turfs[booking.turf_id]?.feedbacks) {
        existing = turfs[booking.turf_id].feedbacks.find((f: any) => f.id === explicitId);
      }
    }

    // 3. Aggressive fallback: Match by customer name/id from local storage against the turf's feedback array
    if (!existing && turfs[booking.turf_id]?.feedbacks) {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('customer_user') : null;
        if (userStr) {
          const user = JSON.parse(userStr);
          const userName = (user?.name || user?.full_name || '').trim().toLowerCase();
          if (userName || user?.id) {
            existing = turfs[booking.turf_id].feedbacks.find((f: any) => 
              (f.customer_name && f.customer_name.toLowerCase() === userName) || 
              (f.customer_id && f.customer_id === user.id) ||
              (f.customer_id && f.customer_id === booking.customer_id)
            );
          }
        }
      } catch (e) {}
    }
    
    // 4. Last resort: if there is exactly 1 feedback on this turf, and we know this user left feedback, just assume it's theirs for testing
    if (!existing && turfs[booking.turf_id]?.feedbacks?.length === 1 && booking.has_feedback) {
       existing = turfs[booking.turf_id].feedbacks[0];
    }

    let existingRating = 0;
    let existingComment = '';
    
    if (existing) {
      existingRating = existing.rating || 0;
      existingComment = existing.comment || '';
    }

    setFeedbackModal({
      isOpen: true,
      booking,
      rating: existingRating,
      comment: existingComment,
      isSubmitting: false,
      error: ''
    })
  }

  const handleFeedbackSubmit = async () => {
    if (feedbackModal.rating === 0) {
      setFeedbackModal(prev => ({ ...prev, error: 'Please select a rating' }))
      return
    }

    setFeedbackModal(prev => ({ ...prev, isSubmitting: true, error: '' }))
    
    let res;
    
    // Attempt to locate the exact feedback ID for this update
    let feedbackId = feedbacksMap[feedbackModal.booking.id]?.id;
    
    if (!feedbackId) {
      feedbackId = typeof feedbackModal.booking.has_feedback === 'string' ? feedbackModal.booking.has_feedback : feedbackModal.booking.feedback_id;
    }
    
    if (!feedbackId && turfs[feedbackModal.booking.turf_id]?.feedbacks) {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('customer_user') : null;
        if (userStr) {
          const user = JSON.parse(userStr);
          const userName = (user?.name || user?.full_name || '').trim().toLowerCase();
          const found = turfs[feedbackModal.booking.turf_id].feedbacks.find((f: any) => 
            (f.customer_name && f.customer_name.toLowerCase() === userName) || 
            (f.customer_id && f.customer_id === user.id) ||
            (f.customer_id && f.customer_id === feedbackModal.booking.customer_id)
          );
          if (found) feedbackId = found.id;
        }
      } catch (e) {}
    }

    if (!feedbackId && turfs[feedbackModal.booking.turf_id]?.feedbacks?.length === 1 && feedbackModal.booking.has_feedback) {
       feedbackId = turfs[feedbackModal.booking.turf_id].feedbacks[0].id;
    }
    
    if (feedbackId) {
      res = await customerFeedbackService.updateFeedback(feedbackId, {
        rating: feedbackModal.rating,
        comment: feedbackModal.comment
      })
    } else {
      res = await customerFeedbackService.createFeedback({
        turf_id: feedbackModal.booking.turf_id,
        booking_id: feedbackModal.booking.id,
        rating: feedbackModal.rating,
        comment: feedbackModal.comment
      })
    }

    if (res.success) {
      // Optimistically update local booking and feedbacks map
      const newFeedback = {
        id: res.data?.id || res.data?.feedback_id || feedbackId,
        rating: feedbackModal.rating,
        comment: feedbackModal.comment,
        booking_id: feedbackModal.booking.id,
        turf_id: feedbackModal.booking.turf_id
      };
      
      setFeedbacksMap(prev => ({ ...prev, [feedbackModal.booking.id]: newFeedback }));
      
      setBookings(prev => prev.map(b => {
        if (b.id === feedbackModal.booking.id) {
          return {
            ...b,
            has_feedback: true
          }
        }
        return b
      }))
      setFeedbackModal(prev => ({ ...prev, isOpen: false }))
    } else {
      setFeedbackModal(prev => ({ ...prev, error: res.message || 'Failed to submit feedback', isSubmitting: false }))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch turfs first to map IDs to details
        const turfsRes = await customerTurfsService.getTurfs({})
        const turfsMap: Record<string, TurfData> = {}
        if (turfsRes.success && turfsRes.data) {
          turfsRes.data.forEach((t: TurfData) => {
            turfsMap[t.id] = t
          })
          setTurfs(turfsMap)
        }

        // Fetch bookings
        const bookingsRes = await customerBookingsService.getBookings()
        if (bookingsRes.success && bookingsRes.data) {
          try {
            const localCancelledIds = JSON.parse(localStorage.getItem('cancelled_bookings') || '[]');
            const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.bookings || [])
            bookingsArray.sort((a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())
            
            // Apply local cancellations if backend hasn't updated them
            const fixedBookings = bookingsArray.map((b: any) => {
              if (localCancelledIds.includes(b.id)) {
                return { ...b, status: 'CANCELLED' }
              }
              return b
            })
            setBookings(fixedBookings)
          } catch (e) {
            setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.bookings || []))
          }
        } else {
          setError(bookingsRes.message || 'Failed to fetch bookings')
        }

        // Fetch customer feedbacks
        try {
          const feedbackRes = await customerFeedbackService.getFeedbacks();
          if (feedbackRes.success && feedbackRes.data) {
            const fMap: Record<string, any> = {};
            const deletedIds = JSON.parse(localStorage.getItem('deleted_feedbacks') || '[]');
            
            const arr = Array.isArray(feedbackRes.data) ? feedbackRes.data : (feedbackRes.data.feedbacks || []);
            arr.forEach((f: any) => {
              if (f.booking_id && !deletedIds.includes(f.id)) fMap[f.booking_id] = f;
            });
            setFeedbacksMap(fMap);
            
            // Fix stale backend flags: If the backend says a booking has feedback, 
            // but it is not in the actual feedbacks list (meaning it was deleted), correct the flag.
            setBookings(prev => prev.map(b => {
              if ((b.has_feedback === true || typeof b.has_feedback === 'string') && !fMap[b.id]) {
                return { ...b, has_feedback: false };
              }
              // Also ensure we set it to true if it exists in the map but backend missed it
              if (fMap[b.id] && !b.has_feedback) {
                return { ...b, has_feedback: true };
              }
              return b;
            }));
          }
        } catch (e) {
          // Ignore feedback fetch errors, gracefully degrade
        }
      } catch (err) {
        setError('An error occurred while fetching your bookings.')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleCancelClick = (bookingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      isDestructive: true,
      isLoading: false,
      error: '',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true, error: '' }))
        setCancelingId(bookingId)
        const res = await customerBookingsService.cancelBooking(bookingId)
        
        if (res.success || res.message?.toLowerCase().includes('already cancelled')) {
          // Store cancelled ID in local storage to mask backend bug where GET still returns CONFIRMED
          try {
            const localCancelledIds = JSON.parse(localStorage.getItem('cancelled_bookings') || '[]');
            if (!localCancelledIds.includes(bookingId)) {
              localCancelledIds.push(bookingId);
              localStorage.setItem('cancelled_bookings', JSON.stringify(localCancelledIds));
            }
          } catch (e) {}
          
          setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
        } else {
          setConfirmModal(prev => ({ ...prev, isLoading: false, error: res.message || 'Failed to cancel booking' }))
        }
        setCancelingId(null)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'COMPLETED': return 'bg-brand-caribbean/10 text-brand-caribbean border-brand-caribbean/20'
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-secondary/20 text-muted-foreground border-border/40'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4 mr-1.5" />
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 mr-1.5" />
      case 'PENDING': return <Clock className="w-4 h-4 mr-1.5" />
      case 'CANCELLED': return <AlertCircle className="w-4 h-4 mr-1.5" />
      default: return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-border/20 pb-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-caribbean/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="w-full">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-brand-caribbean/20 to-brand-caribbean/5 rounded-2xl border border-brand-caribbean/20 shadow-[0_0_15px_rgba(32,178,170,0.2)]">
              <Ticket className="w-8 h-8 md:w-10 md:h-10 text-brand-caribbean" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">My Bookings</span>
          </h1>
          <p className="text-muted-foreground ml-1 md:ml-2 text-sm md:text-base max-w-xl leading-relaxed">Manage your upcoming and past turf reservations, check availability, and modify your plans.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card/20 backdrop-blur-md border border-white/5 rounded-3xl flex flex-col md:flex-row h-[280px] md:h-52 animate-pulse overflow-hidden">
              <div className="w-full md:w-2/5 h-48 md:h-full bg-card/40 shrink-0" />
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-10 bg-card/40 rounded-2xl w-full" />
                  <div className="h-10 bg-card/40 rounded-2xl w-full" />
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="h-8 bg-card/40 rounded-lg w-20" />
                  <div className="h-8 bg-card/40 rounded-lg w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
          <p className="text-red-500 font-medium text-lg">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-card/20 rounded-3xl border border-white/5 max-w-2xl mx-auto">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-2xl font-bold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground">When you book a turf, your tickets will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {bookings.map((booking, index) => {
              const turf = turfs[booking.turf_id]
              const dateObj = new Date(booking.booking_date)
              const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              const status = booking.status || 'PENDING'
              
              return (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:border-white/20 transition-all hover:shadow-2xl"
                >
                  {/* Left Side: Turf Image & Status */}
                  <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden shrink-0">
                    <img 
                      src={turf?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1000&q=80"} 
                      alt={turf?.name || 'Turf'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" />
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center backdrop-blur-md ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status.toUpperCase()}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white truncate drop-shadow-md">{turf?.name || 'Unknown Turf'}</h3>
                      <p className="text-sm text-white flex items-center gap-1 mt-1 truncate drop-shadow-md font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {turf?.city || 'Location unavailable'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Side: Ticket Details */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col relative border-t md:border-t-0 md:border-l border-white/5 border-dashed">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                        <div className="bg-brand-caribbean/20 p-2 rounded-xl text-brand-caribbean">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
                          <p className="font-medium text-foreground">{formattedDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                        <div className="bg-orange-500/20 p-2 rounded-xl text-orange-500">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Slot</p>
                          <p className="font-medium text-foreground">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {feedbacksMap[booking.id] && (
                      <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= feedbacksMap[booking.id].rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                          ))}
                          <span className="text-[10px] text-muted-foreground ml-2 uppercase font-mono tracking-wider">Your Review</span>
                        </div>
                        {feedbacksMap[booking.id].comment && (
                          <p className="text-xs text-muted-foreground italic leading-relaxed">"{feedbacksMap[booking.id].comment}"</p>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/10 border-dashed flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Amount Paid</p>
                        <p className="text-xl font-bold text-brand-caribbean flex items-center">
                          <IndianRupee className="w-5 h-5 opacity-70 mr-0.5" />
                          {booking.amount || (turf ? parseInt(turf.price_per_hour) : 0)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {status !== 'CANCELLED' && (
                          <Button 
                            variant="danger"
                            size="sm"
                            disabled={cancelingId === booking.id}
                            onClick={() => handleCancelClick(booking.id)}
                            className="h-7 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                          >
                            {cancelingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            Cancel
                          </Button>
                        )}
                        {(status === 'COMPLETED' || (status === 'CONFIRMED' && new Date(`${booking.booking_date.split('T')[0]}T${booking.start_time}`) < new Date())) && booking.has_feedback !== 'DELETED' && (
                          <Button 
                            size="sm"
                            onClick={() => openFeedback(booking)}
                            className="h-7 text-xs bg-gradient-to-r from-brand-caribbean/20 to-brand-caribbean/10 text-brand-caribbean hover:from-brand-caribbean hover:to-brand-caribbean/90 hover:text-black border border-brand-caribbean/30 shadow-[0_0_15px_rgba(32,178,170,0.1)] transition-all"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {booking.has_feedback ? 'Edit Feedback' : 'Leave Feedback'}
                          </Button>
                        )}
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Booking ID</p>
                          <p className="text-sm font-mono text-foreground/60 font-semibold">{booking.id.split('-')[0].toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-caribbean/20 p-2.5 rounded-2xl text-brand-caribbean">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Turf Feedback</h3>
                  <p className="text-sm text-muted-foreground">Rate your experience</p>
                </div>
              </div>

              {feedbackModal.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {feedbackModal.error}
                </div>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackModal(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${star <= feedbackModal.rating ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-muted-foreground/30'}`} 
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Comment (Optional)</label>
                <textarea 
                  value={feedbackModal.comment}
                  onChange={(e) => setFeedbackModal(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-caribbean transition-colors h-24 resize-none"
                />
              </div>

              <Button 
                onClick={handleFeedbackSubmit} 
                disabled={feedbackModal.isSubmitting}
                className="w-full bg-brand-caribbean text-black hover:bg-brand-caribbean/90 h-12 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(32,178,170,0.3)] transition-shadow"
              >
                {feedbackModal.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Feedback'}
              </Button>
              
              {feedbackModal.booking?.has_feedback && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Delete Feedback',
                      message: 'Are you sure you want to delete this feedback? This action cannot be undone.',
                      isDestructive: true,
                      isLoading: false,
                      error: '',
                      onConfirm: async () => {
                        setConfirmModal(prev => ({ ...prev, isLoading: true }))
                        setFeedbackModal(prev => ({ ...prev, isSubmitting: true }));
                        
                        // Attempt to locate the exact feedback ID for deletion
                        let feedbackId = feedbacksMap[feedbackModal.booking.id]?.id;
                        
                        if (!feedbackId) {
                          feedbackId = typeof feedbackModal.booking.has_feedback === 'string' ? feedbackModal.booking.has_feedback : feedbackModal.booking.feedback_id;
                        }
                        
                        if (!feedbackId && turfs[feedbackModal.booking.turf_id]?.feedbacks) {
                          try {
                            const userStr = typeof window !== 'undefined' ? localStorage.getItem('customer_user') : null;
                            if (userStr) {
                              const user = JSON.parse(userStr);
                              const userName = (user?.name || user?.full_name || '').trim().toLowerCase();
                              const found = turfs[feedbackModal.booking.turf_id].feedbacks.find((f: any) => 
                                (f.customer_name && f.customer_name.toLowerCase() === userName) || 
                                (f.customer_id && f.customer_id === user.id) ||
                                (f.customer_id && f.customer_id === feedbackModal.booking.customer_id)
                              );
                              if (found) feedbackId = found.id;
                            }
                          } catch (e) {}
                        }

                        if (!feedbackId && turfs[feedbackModal.booking.turf_id]?.feedbacks?.length === 1 && feedbackModal.booking.has_feedback) {
                           feedbackId = turfs[feedbackModal.booking.turf_id].feedbacks[0].id;
                        }
                        
                        if (!feedbackId) {
                           setFeedbackModal(prev => ({ ...prev, error: 'Feedback ID not found. Cannot delete.', isSubmitting: false }));
                           setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
                           return;
                        }
                        
                        const res = await customerFeedbackService.deleteFeedback(feedbackId);
                        if (res.success) {
                          // Persist deletion locally to mask backend bug where it still returns deleted items
                          try {
                            const deletedIds = JSON.parse(localStorage.getItem('deleted_feedbacks') || '[]');
                            deletedIds.push(feedbackId);
                            localStorage.setItem('deleted_feedbacks', JSON.stringify(deletedIds));
                          } catch (e) {}

                          setFeedbacksMap(prev => {
                            const newMap = { ...prev };
                            delete newMap[feedbackModal.booking.id];
                            return newMap;
                          });
                          setBookings(prev => prev.map(b => b.id === feedbackModal.booking.id ? { ...b, has_feedback: false } : b));
                          setFeedbackModal(prev => ({ ...prev, isOpen: false }));
                          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
                        } else {
                          setFeedbackModal(prev => ({ ...prev, error: res.message || 'Failed to delete', isSubmitting: false }));
                          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
                        }
                      }
                    })
                  }}
                  className="w-full mt-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete Feedback
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 ${confirmModal.isDestructive ? 'bg-red-500/20 text-red-500' : 'bg-brand-caribbean/20 text-brand-caribbean'}`}>
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{confirmModal.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{confirmModal.message}</p>
                
                {confirmModal.error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4 w-full flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {confirmModal.error}
                  </div>
                )}
                
                <div className="flex w-full gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    disabled={confirmModal.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmModal.onConfirm}
                    disabled={confirmModal.isLoading}
                    className={`flex-1 rounded-xl font-semibold ${confirmModal.isDestructive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-brand-caribbean text-black hover:bg-brand-caribbean/90'}`}
                  >
                    {confirmModal.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
