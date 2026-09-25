"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Camera, ShieldCheck, Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
  })

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setProfileData({
          name: user.name || 'Admin User',
          email: user.email || 'admin@turf.com',
          phone: user.phone || 'N/A'
        })
      } catch (e) {
        console.error("Failed to parse admin_user from localStorage", e)
      }
    }
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your personal information and security.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <Card className="text-center overflow-hidden border-brand-pistachio/50">
            <div className="h-32 bg-gradient-to-r from-primary to-accent relative" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="relative w-24 h-24 mx-auto -mt-12 rounded-full border-4 border-card bg-secondary flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-bold text-primary">{profileData.name !== 'Loading...' ? profileData.name.charAt(0).toUpperCase() : ''}</span>
                <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <h3 className="text-xl font-bold mt-4">{profileData.name}</h3>
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-primary mt-1">
                <ShieldCheck className="w-4 h-4" /> Super Admin
              </div>
              
              <div className="mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-brand-stone" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-brand-stone" />
                  <span>{profileData.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="border-brand-pistachio/50 h-full">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                      value={profileData.name} 
                      readOnly 
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input 
                      value={profileData.email}
                      readOnly 
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      value={profileData.phone}
                      readOnly 
                      className="bg-muted/30"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
