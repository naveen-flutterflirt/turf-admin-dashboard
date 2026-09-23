"use client"

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, TentTree, IndianRupee, Loader2, Image as ImageIcon, Plus, Trash2, Clock, AlignLeft, Building2, Map, MapPinned, Trophy, CheckSquare, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const turfSchema = z.object({
  name: z.string().min(3, 'Turf name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price_per_hour: z.number().min(1, 'Price is required and must be greater than 0'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  opening_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
  closing_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
  sports: z.array(z.string()).min(1, 'Select at least one sport'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  images: z.array(z.object({
    url: z.string().url('Must be a valid image URL'),
    key: z.string()
  })).min(1, 'At least one image URL is required')
})

export type TurfFormValues = z.infer<typeof turfSchema>

interface TurfFormProps {
  initialData?: Partial<TurfFormValues>
  onSubmit: (data: TurfFormValues) => Promise<void>
  isSubmitting?: boolean
}

const getImageUrl = (image: any) => {
  if (!image) return null
  if (typeof image === 'string') {
    try {
      const parsed = JSON.parse(image)
      return parsed.url || parsed.image_url || `https://asset-management-pro.s3.ap-south-1.amazonaws.com/${parsed.key}`
    } catch {
      if (image.startsWith('http')) return image
      return `https://asset-management-pro.s3.ap-south-1.amazonaws.com/${image}`
    }
  }
  return image.url || image.image_url || (image.key ? `https://asset-management-pro.s3.ap-south-1.amazonaws.com/${image.key}` : null)
}

export function TurfForm({ initialData, onSubmit, isSubmitting = false }: TurfFormProps) {
  const defaultImages = initialData?.images && initialData.images.length > 0 
    ? initialData.images 
    : [{ url: '', key: `turf-images/${Date.now()}-placeholder.jpg` }]

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<TurfFormValues>({
    resolver: zodResolver(turfSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price_per_hour: initialData?.price_per_hour || undefined,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      pincode: initialData?.pincode || '',
      opening_time: initialData?.opening_time || '06:00',
      closing_time: initialData?.closing_time || '23:00',
      sports: initialData?.sports || [],
      amenities: initialData?.amenities || [],
      images: defaultImages
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'images',
    control
  })

  const selectedSports = watch('sports') || []
  const selectedAmenities = watch('amenities') || []

  const [sportInput, setSportInput] = useState('')
  const [amenityInput, setAmenityInput] = useState('')

  const handleAddSport = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return
    e?.preventDefault()
    if (!sportInput.trim()) return
    const current = [...selectedSports]
    if (!current.includes(sportInput.trim())) {
      setValue('sports', [...current, sportInput.trim()], { shouldValidate: true })
    }
    setSportInput('')
  }

  const removeSport = (sportToRemove: string) => {
    setValue('sports', selectedSports.filter(s => s !== sportToRemove), { shouldValidate: true })
  }

  const handleAddAmenity = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return
    e?.preventDefault()
    if (!amenityInput.trim()) return
    const current = [...selectedAmenities]
    if (!current.includes(amenityInput.trim())) {
      setValue('amenities', [...current, amenityInput.trim()], { shouldValidate: true })
    }
    setAmenityInput('')
  }

  const removeAmenity = (amenityToRemove: string) => {
    setValue('amenities', selectedAmenities.filter(a => a !== amenityToRemove), { shouldValidate: true })
  }

  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImageIndex(index)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      // 1. Get presigned URL
      const presignedRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder: 'turf-images'
        })
      })

      const presignedData = await presignedRes.json()
      console.log("Presigned Data Response:", presignedData)
      
      if (!presignedData.success) {
        throw new Error(presignedData.message || "Failed to get presigned URL")
      }

      // Check where uploadUrl actually is
      const uploadUrl = presignedData.data?.uploadUrl || presignedData.uploadUrl
      const fileUrl = presignedData.data?.fileUrl || presignedData.fileUrl || presignedData.data?.url || presignedData.url
      const key = presignedData.data?.key || presignedData.key || 'turf-images/temp'

      console.log("Extracted URLs -> uploadUrl:", uploadUrl, "fileUrl:", fileUrl)

      if (!uploadUrl) {
        throw new Error("No upload URL received from the backend")
      }

      // 2. Upload the raw file directly using Axios to get better error details
      const uploadRes = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      })

      if (uploadRes.status !== 200 && uploadRes.status !== 201) {
        throw new Error(`Failed to upload image. Status: ${uploadRes.status}`)
      }

      // 3. Update the form values with the final real S3 URL
      setValue(`images.${index}.url`, fileUrl, { shouldValidate: true })
      setValue(`images.${index}.key`, key, { shouldValidate: true })
      toast.success("Image uploaded successfully!")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploadingImageIndex(null)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-8">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Turf Name</label>
                <div className="relative">
                  <TentTree className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl ${errors.name ? 'border-red-500/50' : ''}`}
                    placeholder="e.g., Green Field Arena"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Price per hour (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="number"
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl ${errors.price_per_hour ? 'border-red-500/50' : ''}`}
                    placeholder="e.g., 1500"
                    {...register('price_per_hour', { valueAsNumber: true })}
                  />
                </div>
                {errors.price_per_hour && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.price_per_hour.message}</p>}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                  <textarea 
                    className={`w-full pl-12 pt-3 h-24 bg-background border border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl resize-none outline-none text-sm ${errors.description ? 'border-red-500/50' : ''}`}
                    placeholder="Describe your turf, surface type, field size, etc."
                    {...register('description')}
                  />
                </div>
                {errors.description && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2 lg:col-span-3">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.address ? 'border-red-500/50' : ''}`}
                    placeholder="123 Main Road, Near Station"
                    {...register('address')}
                  />
                </div>
                {errors.address && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">City</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.city ? 'border-red-500/50' : ''}`}
                    placeholder="Bhopal"
                    {...register('city')}
                  />
                </div>
                {errors.city && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">State</label>
                <div className="relative">
                  <Map className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.state ? 'border-red-500/50' : ''}`}
                    placeholder="Madhya Pradesh"
                    {...register('state')}
                  />
                </div>
                {errors.state && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Pincode</label>
                <div className="relative">
                  <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.pincode ? 'border-red-500/50' : ''}`}
                    placeholder="462022"
                    {...register('pincode')}
                  />
                </div>
                {errors.pincode && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Timings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">Operating Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Opening Time (24h)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="time" step="1"
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.opening_time ? 'border-red-500/50' : ''}`}
                    {...register('opening_time')}
                  />
                </div>
                {errors.opening_time && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.opening_time.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase">Closing Time (24h)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="time" step="1"
                    className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl ${errors.closing_time ? 'border-red-500/50' : ''}`}
                    {...register('closing_time')}
                  />
                </div>
                {errors.closing_time && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.closing_time.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Features (Sports & Amenities) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">Features</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold tracking-wide text-brand-mint flex items-center gap-2"><Trophy className="w-4 h-4" /> Sports Allowed</label>
              
              <div className="flex gap-2 items-center">
                <Input 
                  value={sportInput}
                  onChange={(e) => setSportInput(e.target.value)}
                  onKeyDown={handleAddSport}
                  placeholder="Type a sport and press Enter (e.g., Cricket)"
                  className="h-11 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl"
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddSport()}
                  className="h-11 bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border border-brand-mint/20"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSports.map(sport => (
                  <div
                    key={sport}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border bg-brand-mint text-brand-dark-green border-brand-mint text-sm font-medium"
                  >
                    {sport}
                    <button type="button" onClick={() => removeSport(sport)} className="hover:text-red-600 transition-colors ml-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedSports.length === 0 && <span className="text-xs text-muted-foreground italic">No sports added yet.</span>}
              </div>
              {errors.sports && <p className="text-xs text-red-400 ml-1 font-medium">{errors.sports.message}</p>}
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-sm font-semibold tracking-wide text-brand-mint flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Amenities</label>
              
              <div className="flex gap-2 items-center">
                <Input 
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={handleAddAmenity}
                  placeholder="Type an amenity and press Enter (e.g., Parking)"
                  className="h-11 bg-background border-border/50 focus:border-brand-mint transition-all rounded-xl"
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddAmenity()}
                  className="h-11 bg-brand-caribbean/10 text-brand-caribbean hover:bg-brand-caribbean/20 border border-brand-caribbean/20"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map(amenity => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border bg-brand-caribbean/80 text-foreground border-brand-caribbean text-sm font-medium"
                  >
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-red-200 transition-colors ml-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedAmenities.length === 0 && <span className="text-xs text-muted-foreground italic">No amenities added yet.</span>}
              </div>
              {errors.amenities && <p className="text-xs text-red-400 ml-1 font-medium">{errors.amenities.message}</p>}
            </div>
          </div>

          {/* Section: Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="text-lg font-bold">Images</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ url: '', key: `turf-images/${Date.now()}-placeholder.jpg` })}
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Image Link
              </Button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id={`image-upload-${index}`}
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                      
                      {/* Custom Upload Button / Preview */}
                      <label 
                        htmlFor={`image-upload-${index}`}
                        className={`flex items-center justify-between w-full h-14 px-4 bg-background border border-border/50 hover:border-brand-mint/50 transition-all rounded-xl cursor-pointer ${errors.images?.[index]?.url ? 'border-red-500/50' : ''}`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {uploadingImageIndex === index ? (
                            <Loader2 className="w-5 h-5 text-brand-mint animate-spin" />
                          ) : watch(`images.${index}.url`) ? (
                             
                            <img src={getImageUrl(watch(`images.${index}`)) || watch(`images.${index}.url`)} alt="Preview" className="w-8 h-8 rounded-md object-cover border border-border/50" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium truncate text-muted-foreground">
                            {uploadingImageIndex === index 
                              ? "Uploading to S3..." 
                              : watch(`images.${index}.url`) 
                                ? watch(`images.${index}.key`) || "Image selected"
                                : "Click to select image file..."}
                          </span>
                        </div>
                        {!watch(`images.${index}.url`) && uploadingImageIndex !== index && (
                          <UploadCloud className="w-5 h-5 text-brand-mint/70 group-hover:text-brand-mint transition-colors" />
                        )}
                      </label>

                      {/* Hidden original URL and Key fields */}
                      <input type="hidden" {...register(`images.${index}.url` as const)} />
                      <input type="hidden" {...register(`images.${index}.key` as const)} />
                    </div>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11 w-11 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  {errors.images?.[index]?.url && (
                    <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.images[index]?.url?.message}</p>
                  )}
                </div>
              ))}
              {errors.images?.root?.message && (
                <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.images.root.message}</p>
              )}
            </div>
          </div>
          
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-bold shadow-md rounded-xl h-12 px-8 w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            'Save Turf Details'
          )}
        </Button>
      </div>
    </form>
  )
}
