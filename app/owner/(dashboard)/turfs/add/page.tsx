"use client"

import React, { useState } from 'react'
import { TurfForm, TurfFormValues } from '@/components/turfs/turf-form'
import { Toaster, toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from '@/lib/axios'

export default function AddTurfPage() {
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: TurfFormValues) => {
    setIsSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
      if (!token) throw new Error("No authorization token found")

      // Add hardcoded latitude and longitude for now as discussed
      const payload = {
        ...data,
        latitude: 18.921984,
        longitude: 72.834654,
        // format times to HH:MM:SS
        opening_time: data.opening_time.length === 5 ? `${data.opening_time}:00` : data.opening_time,
        closing_time: data.closing_time.length === 5 ? `${data.closing_time}:00` : data.closing_time,
        sports: data.sports,
        amenities: data.amenities,
        images: data.images
      }

      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/owner/turfs', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || "Turf created successfully.")
        
        // Redirect back to turfs list after short delay so toast is visible
        setTimeout(() => {
          window.location.href = '/owner/turfs'
        }, 1500)
      } else {
        toast.error(response.data?.message || "Failed to add turf.")
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("Add turf error:", error)
      toast.error(error.response?.data?.message || "Failed to add turf.")
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
          <h2 className="text-3xl font-bold tracking-tight">Add New Turf</h2>
          <p className="text-muted-foreground mt-1">Enter the details for your new property to list it on the platform.</p>
        </div>
      </div>

      <TurfForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
