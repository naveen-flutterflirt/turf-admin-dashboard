"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TurfForm, TurfFormValues } from '@/components/turfs/turf-form'
import { Toaster, toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from 'axios'

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
        // Normally: await axios.get(`https://turf-booking-1-mns7.onrender.com/owner-turf/${turfId}`)
        // Mocking delay for fetching single turf
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock data
        setInitialData({
          name: 'Green Field Arena',
          description: 'A premium 6v6 football and cricket turf.',
          price_per_hour: 1500,
          address: '123 Sports Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          opening_time: '06:00',
          closing_time: '23:00',
          sports: ['Cricket', 'Football'],
          amenities: ['Parking', 'Washroom'],
          images: [{ url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2000&auto=format&fit=crop', key: 'mock-key.jpg' }]
        })
      } catch (error) {
        console.error(error)
        toast.error("Failed to load turf details.")
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
      // Simulate API call delay for Edit Turf
      // Normally: await axios.put(`https://turf-booking-1-mns7.onrender.com/edit-turf/${turfId}`, data)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Mock Turf Updated:', data)
      toast.success("Turf updated successfully! (Mocked)")
      
      setTimeout(() => {
        router.push('/owner/turfs')
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update turf.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      <Toaster position="top-right" richColors />
      
      <div className="flex items-center gap-4">
        <Link href="/owner/turfs">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
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
