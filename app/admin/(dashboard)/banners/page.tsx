"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Plus, Trash2, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import { BannerUploadModal } from '@/components/banners/banner-upload-modal'
import { bannersService, Banner } from '@/services/banners'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function AdminBannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setUpdatingId(id)
    try {
      await bannersService.updateBannerStatus(id, newStatus)
      // Optimistically update locally
      setBanners(prev => prev.map(b => (b.id || (b as any)._id) === id ? { ...b, status: newStatus } : b))
    } catch (error: any) {
      console.error('Failed to update status:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update banner status.'
      alert(`Backend Error: ${errorMsg}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const fetchBanners = async () => {
    setIsLoading(true)
    try {
      const data = await bannersService.getBanners()
      setBanners(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleSaveBanner = async (imageUrl: string) => {
    try {
      await bannersService.uploadBanner({ image_url: imageUrl })
      await fetchBanners()
    } catch (error) {
      console.error('Failed to save banner:', error)
      alert('Failed to upload banner. Check console.')
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    try {
      await bannersService.deleteBanner(id)
      setBanners(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Failed to delete banner:', error)
      alert('Failed to delete banner.')
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 w-full max-w-[1400px] mx-auto min-h-screen">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-brand-mint/10 rounded-xl border border-brand-mint/20">
              <ImageIcon className="w-6 h-6 text-brand-mint" />
            </div>
            Banner Management
          </h1>
          <p className="text-white/60 mt-1">
            Upload and manage promotional banners for the customer application.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-mint text-black hover:bg-brand-mint/90 flex items-center gap-2 font-bold px-6 py-5 rounded-xl shadow-[0_0_20px_rgba(3,233,165,0.2)]">
          <Plus className="w-5 h-5" />
          Add New Banner
        </Button>
      </motion.div>

      {/* Table of Banners */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-mint" />
              <p>Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>No banners uploaded yet.</p>
              <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4 border-white/10">
                Upload First Banner
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Preview</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date Added</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {banners.map((banner) => (
                    <motion.tr key={banner.id} variants={itemVariants} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-32 aspect-[16/9] rounded-md overflow-hidden bg-black border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={banner.image_url} alt="Banner Preview" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(banner.id || (banner as any)._id, banner.status || 'ACTIVE')}
                            disabled={updatingId === (banner.id || (banner as any)._id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              (banner.status || 'ACTIVE') === 'ACTIVE' ? 'bg-brand-mint' : 'bg-white/20'
                            } ${updatingId === (banner.id || (banner as any)._id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                (banner.status || 'ACTIVE') === 'ACTIVE' ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 w-fit transition-colors ${
                            (banner.status || 'ACTIVE') === 'ACTIVE' 
                              ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20' 
                              : 'bg-white/5 text-white/50 border-white/10'
                          }`}>
                            {updatingId === (banner.id || (banner as any)._id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (banner.status || 'ACTIVE') === 'ACTIVE' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current opacity-50" />
                            )}
                            {(banner.status || 'ACTIVE').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {banner.created_at ? new Date(banner.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBanner(banner.id || (banner as any)._id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      <BannerUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveBanner}
      />
    </div>
  )
}
