"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TurfForm, TurfFormValues } from '@/components/turfs/turf-form'
import { Toaster, toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from '@/lib/axios'

export default function EditTurfPage() {
  const router = useRouter()
  const params = useParams()
  const turfId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<Partial<TurfFormValues> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch existing turf data to pre-populate the form
    const fetchTurf = async () => {
      try {
        setIsLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
        if (!token) throw new Error("No authorization token found")

        let data;
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/turfs/${turfId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          const resData = response.data
          if (resData.success === false) {
            throw new Error(resData.message || "Failed to fetch turf")
          }
          data = resData.data || resData
        } catch (err: any) {
          // If the specific GET /:id endpoint doesn't exist (404), fallback to getting all and filtering
          if (err.response && err.response.status === 404) {
            console.log("Specific turf endpoint returned 404, falling back to list API...")
            const listResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/turfs`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const allTurfs = listResponse.data?.data || listResponse.data || []
            data = allTurfs.find((t: any) => (t.id || t.turf_id) === turfId)

            if (!data) {
              throw new Error("Turf not found in your list.")
            }
          } else {
            throw err
          }
        }

        let parsedImages = data.images || [];
        if (typeof parsedImages === 'string') {
          if (parsedImages.includes(',')) {
            parsedImages = parsedImages.split(',');
          } else {
            try {
              parsedImages = JSON.parse(parsedImages);
            } catch (e) {
              parsedImages = [parsedImages];
            }
          }
        }
        if (!Array.isArray(parsedImages)) {
          parsedImages = [parsedImages]
        }

        const formattedImages = parsedImages.map((img: any) => {
          if (typeof img === 'string') {
            try {
              const p = JSON.parse(img);
              return { url: p.image_url || p.url || p, key: p.key || 'image' }
            } catch {
              return { url: img, key: 'image' }
            }
          }
          return { url: img.image_url || img.url, key: img.key || 'image' }
        })

        const uniqueImages = Array.from(new Set(formattedImages.map((img: any) => img.url)))
          .map(url => formattedImages.find((img: any) => img.url === url));

        let parsedSports = data.sports || [];
        if (typeof parsedSports === 'string') {
          if (parsedSports.includes(',')) {
             parsedSports = parsedSports.split(',');
          } else {
             try { parsedSports = JSON.parse(parsedSports) } catch { parsedSports = [parsedSports] }
          }
        }
        let parsedAmenities = data.amenities || [];
        if (typeof parsedAmenities === 'string') {
          if (parsedAmenities.includes(',')) {
             parsedAmenities = parsedAmenities.split(',');
          } else {
             try { parsedAmenities = JSON.parse(parsedAmenities) } catch { parsedAmenities = [parsedAmenities] }
          }
        }

        setInitialData({
          name: data.name || data.turf_name || '',
          description: data.description || '',
          price_per_hour: data.price_per_hour || data.price || 0,
          address: (data.address && typeof data.address === 'object' ? data.address?.name : data.address) || '',
          city: (data.city && typeof data.city === 'object' ? data.city?.name : data.city) || '',
          state: (data.state && typeof data.state === 'object' ? data.state?.name : data.state) || '',
          pincode: (data.pincode && typeof data.pincode === 'object' ? data.pincode?.name : data.pincode) || '',
          opening_time: data.opening_time ? data.opening_time.slice(0, 5) : '06:00',
          closing_time: data.closing_time ? data.closing_time.slice(0, 5) : '23:00',
          sports: Array.isArray(parsedSports) ? Array.from(new Set(parsedSports.map((s: any) => typeof s === 'object' ? s.name || s.id : s))) : [],
          amenities: Array.isArray(parsedAmenities) ? Array.from(new Set(parsedAmenities.map((a: any) => typeof a === 'object' ? a.name || a.id : a))) : [],
          images: uniqueImages
        })
      } catch (error: any) {
        console.error("Fetch turf error:", error)
        toast.error(error.response?.data?.message || error.message || "Failed to load turf details.")
      } finally {
        setIsLoading(false)
      }
    }

    if (turfId) {
      fetchTurf()
    }
  }, [turfId])

  const handleSubmit = async (data: TurfFormValues) => {
    setIsSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      const payload = {
        ...data,
        latitude: 18.921984,
        longitude: 72.834654,
        opening_time: data.opening_time.length === 5 ? `${data.opening_time}:00` : data.opening_time,
        closing_time: data.closing_time.length === 5 ? `${data.closing_time}:00` : data.closing_time,
        sports: data.sports,
        amenities: data.amenities,
        images: data.images
      }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/owner/turfs/${turfId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success !== false) {
        toast.success(response.data.message || "Turf updated successfully!")
        setTimeout(() => {
          window.location.href = '/owner/turfs'
        }, 1500)
      } else {
        toast.error(response.data?.message || "Failed to update turf.")
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("Update turf error:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to update turf.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      <Toaster position="top-right" richColors />

      <div className="flex items-center gap-4">
        <Link href="/owner/turfs">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Turf</h2>
          <p className="text-muted-foreground mt-1">Update the details of your property.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] w-full bg-card/40 animate-pulse rounded-xl border border-border/50"></div>
      ) : initialData ? (
        <TurfForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      ) : (
        <div className="text-center p-12 text-muted-foreground">Failed to load turf data.</div>
      )}
    </div>
  )
}
