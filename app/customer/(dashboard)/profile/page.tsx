"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, CalendarDays, ShieldCheck, Activity, LogOut, Edit2, X, Check } from 'lucide-react'
import { customerProfileService, CustomerProfileData } from '@/services/customer-profile'
import { customerAuthService } from '@/services/customer-auth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })

  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await customerProfileService.getProfile()
      if (res.success && res.data) {
        setProfile(res.data)
        setProfile(res.data)
        setEditForm({ name: res.data.name, phone: res.data.phone })
        // Update local storage name for sidebar sync
        localStorage.setItem('customer_user', JSON.stringify({ name: res.data.name, email: res.data.email }))
      } else {
        setError(res.message || 'Failed to load profile')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      setEditForm({ name: profile.name, phone: profile.phone })
      setError('')
      setSuccessMsg('')
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    if (editForm.name.trim().length < 2) {
      setError("Name must be at least 2 characters long")
      return
    }
    if (!/^\d{10}$/.test(editForm.phone)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMsg('')

    const res = await customerProfileService.updateProfile({
      name: editForm.name,
      phone: editForm.phone
    })

    if (res.success && res.data) {
      setProfile(res.data)
      setSuccessMsg(res.message || "Profile updated successfully")
      setIsEditing(false)
      localStorage.setItem('customer_user', JSON.stringify({ name: res.data.name, email: res.data.email }))
      
      // Auto-hide success message
      setTimeout(() => setSuccessMsg(''), 5000)
    } else {
      setError(res.message || 'Failed to update profile')
    }
    setIsSaving(false)
  }

  const handleLogout = async () => {
    // Show loading state if needed, but usually logout is fast
    await customerAuthService.logout()
    // Hard redirect to the customer dashboard route so the RBAC layout kicks in and shows the login modal
    window.location.href = '/customer/turf'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Oops!</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal details and account settings.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleEditToggle} variant="outline" className="rounded-xl" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="rounded-xl bg-brand-caribbean hover:bg-brand-mint text-brand-dark-green" disabled={isSaving}>
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-brand-dark-green border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditToggle} variant="outline" className="rounded-xl">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button onClick={handleLogout} variant="danger" className="rounded-xl shadow-lg hover:shadow-xl transition-all">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(error || successMsg) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl text-center font-medium ${
              error 
                ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
                : 'bg-brand-mint/10 border border-brand-mint/20 text-brand-mint'
            }`}
          >
            {error || successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1"
        >
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-caribbean/10 to-brand-mint/10 pointer-events-none" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-caribbean to-brand-mint flex items-center justify-center text-3xl font-bold text-brand-dark-green mb-6 shadow-2xl ring-4 ring-background z-10">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold mb-1 z-10">{profile.name}</h2>
            <p className="text-brand-caribbean font-medium flex items-center gap-1 z-10">
              <ShieldCheck className="w-4 h-4" /> {profile.role}
            </p>
            <div className="mt-6 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-sm font-semibold tracking-wide flex items-center gap-2 z-10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {profile.status}
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 h-full">
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>
            <div className="space-y-6">
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-brand-mint/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-brand-mint/20 group-hover:text-brand-mint transition-colors shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{profile.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-brand-mint/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-brand-mint/20 group-hover:text-brand-mint transition-colors shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                  <p className="text-lg font-semibold text-muted-foreground">{profile.email}</p>
                  {isEditing && <p className="text-xs text-brand-caribbean mt-1">Email cannot be changed directly.</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-brand-mint/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-brand-mint/20 group-hover:text-brand-mint transition-colors shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">+91</span>
                      <input 
                        type="text" 
                        value={editForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setEditForm({...editForm, phone: val})
                        }}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50"
                      />
                    </div>
                  ) : (
                    <p className="text-lg font-semibold">+91 {profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-brand-mint/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-brand-mint/20 group-hover:text-brand-mint transition-colors">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined On</p>
                  <p className="text-lg font-semibold">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
