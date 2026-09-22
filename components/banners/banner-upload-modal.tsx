"use client"
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BannerUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (imageUrl: string) => void
}

export function BannerUploadModal({ isOpen, onClose, onSave }: BannerUploadModalProps) {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 40,
    x: 5,
    y: 30
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined as any) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return
    setIsSaving(true)
    
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      if (croppedBlob) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
        if (!token) throw new Error("No authorization token found")

        // 1. Get presigned URL
        const presignedRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/upload/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: 'banner.jpg',
            contentType: 'image/jpeg',
            folder: 'turf-images'
          })
        })

        const presignedData = await presignedRes.json()
        
        if (!presignedData.success) {
          alert(`Backend Error: ${presignedData.message || 'Unknown error'}`)
          setIsSaving(false)
          return
        }

        const uploadUrl = presignedData.data?.uploadUrl || presignedData.uploadUrl
        const fileUrl = presignedData.data?.fileUrl || presignedData.fileUrl || presignedData.data?.url || presignedData.url

        if (!uploadUrl) {
          throw new Error("No upload URL received from the backend")
        }

        // 2. Upload to S3
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/jpeg'
          },
          body: croppedBlob
        })

        if (!uploadRes.ok) {
          throw new Error(`Failed to upload image. Status: ${uploadRes.status}`)
        }

        // 3. Save Banner via parent callback
        await onSave(fileUrl)
        reset()
      }
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Failed to upload banner")
    } finally {
      setIsSaving(false)
    }
  }

  const reset = () => {
    setImgSrc('')
    setCompletedCrop(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/40">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-mint" />
                Add New Banner
              </h2>
              <button
                onClick={reset}
                className="text-white/50 hover:text-white transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!imgSrc ? (
                <div className="border-2 border-dashed border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-brand-mint/10 text-brand-mint rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Banner Image</h3>
                  <p className="text-white/50 text-sm max-w-sm">
                    Drag and drop an image or click to browse. We recommend high-resolution images.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-black/50 rounded-xl overflow-hidden border border-white/10 p-4">
                    <p className="text-sm text-brand-mint mb-4 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Crop to 16:9 Aspect Ratio
                    </p>
                    <div className="flex justify-center bg-black rounded-lg overflow-hidden max-h-[400px]">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={16 / 9}
                        className="max-h-[400px]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imgRef}
                          src={imgSrc}
                          alt="Crop me"
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </ReactCrop>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setImgSrc('')} disabled={isSaving} className="border-white/10 hover:bg-white/5 text-white">
                      Back
                    </Button>
                    <Button onClick={handleSave} disabled={!completedCrop || isSaving} className="bg-brand-mint text-black hover:bg-brand-mint/90">
                      {isSaving ? 'Uploading...' : 'Upload Banner'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
