"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, IndianRupee, Trash2, CheckCircle, XCircle, Clock, Ban, Eye, Map, AlignLeft, Activity, Sparkles, Star } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { turfsService, Turf } from '@/services/turfs'
import { Pagination } from '@/components/ui/pagination'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'

type ViewMode = 'PENDING' | 'APPROVED' | 'REJECTED'

export default function TurfsPage() {
  const queryClient = useQueryClient()
  const { data: turfs, isLoading, isError } = useQuery({ queryKey: ['turfs'], queryFn: turfsService.getTurfs })

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('PENDING')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null)

  const [viewTurfDetails, setViewTurfDetails] = useState<Turf | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const deleteMutation = useMutation({
    mutationFn: turfsService.deleteTurf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turfs'] })
      setIsDeleteModalOpen(false)
      setSelectedTurf(null)
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { id: string, action: 'approve' | 'reject', turfName?: string }) =>
      data.action === 'approve' ? turfsService.approveTurf(data.id) : turfsService.rejectTurf(data.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['turfs'] })
      
      // Optimistically update notifications to reflect the new status
      queryClient.setQueryData(['notifications'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((notif: any) => {
          if (notif.title === 'New Turf Pending Approval' && variables.turfName && notif.message.includes(variables.turfName)) {
            return {
              ...notif,
              title: variables.action === 'approve' ? 'Turf Approved' : 'Turf Rejected',
              message: `${variables.turfName} has been ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully.`,
              isRead: true,
              is_read: true
            }
          }
          return notif;
        })
      });
      // Invalidate to fetch fresh data if backend supports it
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Derived state for filtering and pagination
  const filteredTurfs = React.useMemo(() => {
    if (!turfs) return []
    return turfs.filter(turf => {
      const search = (searchTerm || '').toLowerCase()
      const matchesSearch = (turf.name?.toLowerCase() || '').includes(search) ||
        (turf.business_name?.toLowerCase() || '').includes(search) ||
        (turf.city?.toLowerCase() || '').includes(search)

      const status = (turf.status || '').toUpperCase()
      const isPendingMatch = status === 'PENDING'
      const isApprovedMatch = status === 'APPROVED' || status === 'ACTIVE'
      const isRejectedMatch = status === 'REJECTED' || status === 'INACTIVE'

      const matchesStatus =
        viewMode === 'PENDING' ? isPendingMatch :
          viewMode === 'APPROVED' ? isApprovedMatch :
            isRejectedMatch

      return matchesSearch && matchesStatus
    })
  }, [turfs, searchTerm, viewMode])

  const totalPages = Math.ceil(filteredTurfs.length / ITEMS_PER_PAGE)
  const paginatedTurfs = filteredTurfs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)



  // Reset active image when opening a new details modal
  React.useEffect(() => {
     
    setActiveImageIndex(0)
  }, [viewTurfDetails])

  // Fallback image since backend doesn't provide one yet
  const FALLBACK_IMAGE = '/image.png'

  const getTurfImages = (t: Turf | null): string[] => {
    if (!t) return [FALLBACK_IMAGE]
    if (t.images && t.images.length > 0) {
      return t.images.map((img: any  ) => typeof img === 'string' ? img : (img.image_url || img.url)).filter(Boolean)
    }
    if (t.image) return [t.image]
    return [FALLBACK_IMAGE]
  }

  const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Turfs Directory</h2>
          <p className="text-muted-foreground mt-1">Manage and approve turfs on the platform.</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-muted rounded-xl w-full xl:w-auto shadow-inner border border-border overflow-x-auto">
          <button
            onClick={() => { setViewMode('PENDING'); setCurrentPage(1); }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${viewMode === 'PENDING'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Clock className="w-4 h-4" /> Pending
            {turfs && (
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${viewMode === 'PENDING' ? 'bg-white/20' : 'bg-muted-foreground/20'}`}>
                {turfs.filter(t => t.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setViewMode('APPROVED'); setCurrentPage(1); }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${viewMode === 'APPROVED'
                ? 'bg-brand-mint text-brand-dark-green shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <CheckCircle className="w-4 h-4" /> Approved
          </button>
          <button
            onClick={() => { setViewMode('REJECTED'); setCurrentPage(1); }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${viewMode === 'REJECTED'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Ban className="w-4 h-4" /> Rejected
          </button>
        </div>
      </div>

      <Card className="border-border overflow-hidden shadow-lg bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3 bg-muted/30 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, business or city..."
              className="pl-9 bg-background focus:bg-background border-border"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col min-h-[400px]">
          {isLoading ? (
            <div className="py-20 flex flex-col justify-center items-center text-brand-mint">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-brand-mint border-t-transparent rounded-full mb-4" />
              <span className="font-medium">Fetching Turfs...</span>
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-red-500 font-medium bg-red-500/5 m-4 rounded-xl border border-red-500/20">Failed to load turfs. Please try again later.</div>
          ) : filteredTurfs.length === 0 ? (
            <EmptyState
              icon={viewMode === 'PENDING' ? CheckCircle : MapPin}
              title={
                viewMode === 'PENDING' ? "All Caught Up!" :
                  viewMode === 'APPROVED' ? "No Approved Turfs Found" :
                    "No Rejected Turfs"
              }
              description={
                viewMode === 'PENDING' ? "There are no pending turfs awaiting approval." :
                  viewMode === 'APPROVED' ? "Try adjusting your search criteria or changing the view mode." :
                    "There are currently no rejected turfs."
              }
              action={<Button variant="outline" onClick={() => { setSearchTerm(''); }}>Clear Search</Button>}
            />
          ) : (
            <div className="w-full">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead>Turf Details</TableHead>
                      <TableHead>Business / Location</TableHead>
                      <TableHead>Sports</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedTurfs.map((turf) => (
                        <TableRow key={turf.id} className="hover:bg-black/5 dark:hover:bg-white/10 transition-colors group">
                          <TableCell>
                            <div className="font-bold text-foreground text-base">{turf.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime12Hour(turf.opening_time)} - {formatTime12Hour(turf.closing_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{turf.business_name || 'N/A'}</div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3 mr-1 text-primary" />
                              {turf.city}, {turf.state}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                              {turf.sports?.slice(0, 3).map((sport, i) => {
                                const sportName = typeof sport === 'string' ? sport : sport.name
                                return (
                                  <span key={i} className="px-2.5 py-1 bg-brand-pistachio/20 text-brand-frog dark:text-brand-pistachio text-[10px] uppercase font-bold tracking-wider rounded-md border border-brand-pistachio/30">{sportName}</span>
                                )
                              })}
                              {turf.sports && turf.sports.length > 3 && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded-md">+{turf.sports.length - 3}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center font-bold text-lg text-brand-mint drop-shadow-sm">
                              <IndianRupee className="w-4 h-4 mr-0.5" />
                              {Number(turf.price_per_hour).toLocaleString()}
                              <span className="text-xs text-muted-foreground font-normal ml-1">/hr</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${turf.is_open ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {turf.is_open ? 'OPEN' : 'CLOSED'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity opacity-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-brand-mint hover:bg-brand-mint/10 hover:text-brand-mint border-brand-mint/20"
                                onClick={() => setViewTurfDetails(turf)}
                              >
                                <Eye className="w-4 h-4 mr-1.5" /> View
                              </Button>

                              {viewMode === 'PENDING' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-white hover:bg-red-500 border-red-500/20"
                                    onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'reject' })}
                                    disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                                  >
                                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean"
                                    onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'approve' })}
                                    disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                                  </Button>
                                </>
                              )}

                              {viewMode === 'APPROVED' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-white hover:bg-red-500 border-red-500/20"
                                    onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'reject' })}
                                    disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                                  >
                                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    onClick={() => {
                                      setSelectedTurf(turf)
                                      setIsDeleteModalOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {viewMode === 'REJECTED' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean"
                                    onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'approve' })}
                                    disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    onClick={() => {
                                      setSelectedTurf(turf)
                                      setIsDeleteModalOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-4 p-4">
                <AnimatePresence mode="popLayout">
                  {paginatedTurfs.map((turf) => (
                    <motion.div
                      key={turf.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                    >
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-foreground leading-tight">{turf.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${turf.is_open ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {turf.is_open ? 'OPEN' : 'CLOSED'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> {turf.business_name || 'N/A'} • {turf.city}
                            </p>
                          </div>
                          <div className="bg-muted px-2.5 py-1 rounded-lg text-foreground font-bold flex items-center text-sm border border-border">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                            {Number(turf.price_per_hour).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                          {turf.sports?.map((sport, i) => {
                            const sportName = typeof sport === 'string' ? sport : sport.name
                            return (
                              <span key={i} className="px-2.5 py-1 bg-muted text-foreground text-[10px] uppercase font-bold tracking-wider rounded-md">{sportName}</span>
                            )
                          })}
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            className="flex-1 min-w-[100px] text-brand-mint hover:bg-brand-mint/10 hover:text-brand-mint border-brand-mint/20"
                            onClick={() => setViewTurfDetails(turf)}
                          >
                            <Eye className="w-4 h-4 mr-1.5" /> View
                          </Button>

                          {viewMode === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 min-w-[100px] text-red-500 hover:text-white hover:bg-red-500 border-red-500/20"
                                onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'reject' })}
                                disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                              >
                                <XCircle className="w-4 h-4 mr-1.5" /> Reject
                              </Button>
                              <Button
                                className="flex-1 min-w-[100px] bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean"
                                onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'approve' })}
                                disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                              </Button>
                            </>
                          )}

                          {viewMode === 'APPROVED' && (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 min-w-[100px] text-red-500 hover:text-white hover:bg-red-500 border-red-500/20"
                                onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'reject' })}
                                disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                              >
                                <XCircle className="w-4 h-4 mr-1.5" /> Reject
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-none text-red-500 hover:bg-red-500 hover:text-white border-red-500/20"
                                onClick={() => {
                                  setSelectedTurf(turf)
                                  setIsDeleteModalOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {viewMode === 'REJECTED' && (
                            <>
                              <Button
                                className="flex-1 min-w-[100px] bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean"
                                onClick={() => toggleStatusMutation.mutate({ id: turf.id, turfName: turf.name, action: 'approve' })}
                                disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === turf.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-none text-red-500 hover:bg-red-500 hover:text-white border-red-500/20"
                                onClick={() => {
                                  setSelectedTurf(turf)
                                  setIsDeleteModalOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!isLoading && !isError && filteredTurfs.length > 0 && (
            <div className="mt-auto px-6 py-4 border-t border-border bg-muted/10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Turf">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{selectedTurf?.name}</strong>? This action cannot be undone.</p>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              type="button"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (selectedTurf) deleteMutation.mutate(selectedTurf.id)
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Turf Details Modal */}
      <Modal isOpen={!!viewTurfDetails} onClose={() => setViewTurfDetails(null)} title={viewTurfDetails?.name || 'Turf Details'}>
        {viewTurfDetails && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">

            {/* Image Carousel */}
            <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-muted relative border border-border">
              <img
                src={getTurfImages(viewTurfDetails)[activeImageIndex]}
                alt={viewTurfDetails.name}
                className="w-full h-full object-cover"
              />

              {/* Thumbnail Nav if more than 1 image */}
              {getTurfImages(viewTurfDetails).length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-4">
                  {getTurfImages(viewTurfDetails).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-brand-mint scale-110 shadow-lg' : 'border-white/50 opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlignLeft className="w-4 h-4" /> Description</h4>
                  <p className="text-foreground text-sm bg-muted/30 p-3 rounded-lg border border-border">{viewTurfDetails.description || "No description provided."}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><Map className="w-4 h-4" /> Location</h4>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg border border-border">
                    <p className="font-medium text-foreground">{viewTurfDetails.business_name}</p>
                    <p className="text-muted-foreground">{viewTurfDetails.address}</p>
                    <p className="text-muted-foreground">{viewTurfDetails.city}, {viewTurfDetails.state} - {viewTurfDetails.pincode}</p>
                    {(viewTurfDetails.latitude && viewTurfDetails.longitude) && (
                      <p className="text-xs font-mono text-muted-foreground mt-2">Coords: {viewTurfDetails.latitude}, {viewTurfDetails.longitude}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Timings & Pricing</h4>
                  <div className="text-sm bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-bold text-brand-mint text-base flex items-center"><IndianRupee className="w-3.5 h-3.5" />{Number(viewTurfDetails.price_per_hour).toLocaleString()} /hr</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-muted-foreground">Opening</span>
                      <span className="font-medium text-foreground">{formatTime12Hour(viewTurfDetails.opening_time)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Closing</span>
                      <span className="font-medium text-foreground">{formatTime12Hour(viewTurfDetails.closing_time)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4" /> Sports Allowed</h4>
                  <div className="flex gap-1.5 flex-wrap bg-muted/30 p-3 rounded-lg border border-border">
                    {viewTurfDetails.sports?.map((sport, i) => {
                      const sportName = typeof sport === 'string' ? sport : sport.name
                      return (
                        <span key={i} className="px-2.5 py-1 bg-brand-pistachio/20 text-brand-frog dark:text-brand-pistachio text-[10px] uppercase font-bold tracking-wider rounded-md border border-brand-pistachio/30">{sportName}</span>
                      )
                    })}
                    {(!viewTurfDetails.sports || viewTurfDetails.sports.length === 0) && (
                      <span className="text-xs text-muted-foreground italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities - Full Width */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Amenities</h4>
              <div className="flex flex-wrap gap-2.5 bg-muted/30 p-3 rounded-lg border border-border w-full">
                {viewTurfDetails.amenities && viewTurfDetails.amenities.length > 0 ? (
                  viewTurfDetails.amenities.map((amenity, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-pistachio/20 text-brand-frog dark:text-brand-pistachio text-[11px] uppercase font-bold tracking-wider rounded-md border border-brand-pistachio/30">
                      <Star className="w-3.5 h-3.5 fill-brand-pistachio/50 shrink-0" />
                      <span>{amenity.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No amenities listed</span>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => setViewTurfDetails(null)}>Close Details</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}
