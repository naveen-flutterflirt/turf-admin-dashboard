"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserSquare2, Mail, Phone, Briefcase, Save, Loader2 } from 'lucide-react'
import axios from '@/lib/axios'
import { Toaster, toast } from 'sonner'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  business_name: z.string().min(2, 'Business name is required'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function OwnerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [initialData, setInitialData] = useState<ProfileFormValues | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('owner_token')
        if (!token) return

        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/owner/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.data && response.data.success && response.data.data) {
          const profileData = response.data.data
          setInitialData(profileData)
          reset({
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            business_name: profileData.business_name || '',
          })
          localStorage.setItem('owner_user', JSON.stringify(profileData))
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
        
        // Fallback to local storage if API fails
        const storedUser = localStorage.getItem('owner_user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            setInitialData(parsed)
            reset({
              name: parsed.name || '',
              email: parsed.email || '',
              phone: parsed.phone || '',
              business_name: parsed.business_name || '',
            })
          } catch(e) {}
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const token = localStorage.getItem('owner_token')
      if (!token) {
        toast.error('Authentication error. Please login again.')
        return
      }

      const response = await axios.put(process.env.NEXT_PUBLIC_API_URL + '/owner/profile', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        business_name: data.business_name
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.success !== false) {
        toast.success('Profile updated successfully!')
        
        const storedUser = localStorage.getItem('owner_user')
        let updatedUser = { ...data }
        if (storedUser) {
          try {
             updatedUser = { ...JSON.parse(storedUser), ...data }
          } catch(e) {}
        }
        localStorage.setItem('owner_user', JSON.stringify(updatedUser))
      } else {
        toast.error(response.data?.message || 'Failed to update profile')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'An error occurred while updating your profile.')
    }
  }

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your account settings and business details.</p>
        </div>
      </div>

      {loading ? (
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 h-[400px] animate-pulse" />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-mint to-brand-caribbean flex items-center justify-center text-brand-dark-green font-bold text-4xl shadow-lg border-4 border-background">
                  {initialData?.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <CardTitle className="text-2xl">{initialData?.name || 'Owner Name'}</CardTitle>
                  <p className="text-brand-mint font-medium mt-1">{initialData?.business_name || 'Business Name'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <UserSquare2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="name" 
                        className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl ${errors.name ? 'border-red-500/50' : ''}`}
                        {...register('name')}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase" htmlFor="business_name">Business Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="business_name" 
                        className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl ${errors.business_name ? 'border-red-500/50' : ''}`}
                        {...register('business_name')}
                      />
                    </div>
                    {errors.business_name && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.business_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase" htmlFor="email">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email"
                        disabled // Usually emails can't be changed easily
                        className={`pl-12 h-12 bg-background border-border/50 opacity-70 cursor-not-allowed transition-all rounded-xl ${errors.email ? 'border-red-500/50' : ''}`}
                        {...register('email')}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase" htmlFor="phone">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        className={`pl-12 h-12 bg-background border-border/50 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl ${errors.phone ? 'border-red-500/50' : ''}`}
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-400 ml-1 mt-1 font-medium">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-bold shadow-md rounded-xl h-12 px-8"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
