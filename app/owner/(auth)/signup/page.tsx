"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, Briefcase, Phone } from 'lucide-react'
import axios from '@/lib/axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GoogleLogin } from '@react-oauth/google'
import { Suspense } from 'react'
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  business_name: z.string().min(2, 'Business name is required'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
})

type SignupFormValues = z.infer<typeof signupSchema>

function OwnerSignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)
  const [googleIdToken, setGoogleIdToken] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  })

  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (token) {
      router.push('/owner/dashboard')
    }

    const method = searchParams.get('method')
    if (method === 'google') {
      const pendingDataStr = sessionStorage.getItem('pending_google_owner')
      if (pendingDataStr) {
        try {
          const data = JSON.parse(pendingDataStr)
          setIsGoogleSignup(true)
          setGoogleIdToken(data.idToken || '')
          
          // Pre-fill form
          reset({
            email: data.email || '',
            name: data.name || '',
            business_name: '',
            phone: '',
            password: ''
          })
        } catch (error) {
          console.error('Error parsing pending google data', error)
        }
      }
    }
  }, [router, searchParams, reset])

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setIsGoogleLoading(true)
    setServerError('')
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/owner/google', {
        idToken: credentialResponse.credential
      })

      if (response.data && response.data.success) {
        if (response.data.isNewUser) {
          sessionStorage.setItem('pending_google_owner', JSON.stringify(response.data.data))
          router.push('/owner/signup?method=google')
        } else {
          localStorage.setItem('owner_token', response.data.token || '')
          localStorage.setItem('owner_user', JSON.stringify(response.data.data || {}))
          router.push('/owner/dashboard')
        }
      } else {
        setServerError(response.data.message || 'Google login failed')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message)
      } else {
        setServerError('An unexpected error occurred during Google login.')
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const onSubmit = async (data: SignupFormValues) => {
    setServerError('')
    try {
      if (isGoogleSignup) {
        const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/owner/google-signup', {
          idToken: googleIdToken,
          name: data.name,
          business_name: data.business_name,
          phone: data.phone,
          password: data.password
        })

        if (response.data && response.data.success) {
          // Clear session data
          sessionStorage.removeItem('pending_google_owner')
          
          // Store token and user data directly, skipping email verification
          localStorage.setItem('owner_token', response.data.token || '')
          localStorage.setItem('owner_user', JSON.stringify(response.data.data || {}))
          router.push('/owner/dashboard')
        } else {
          setServerError(response.data.message || 'Google signup failed')
        }
      } else {
        const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/owner/signup', {
          name: data.name,
          email: data.email,
          password: data.password,
          business_name: data.business_name,
          phone: data.phone
        })

        if (response.data && response.data.success) {
          router.push(`/owner/verify-email?email=${encodeURIComponent(data.email)}`)
        } else {
          setServerError(response.data.message || 'Signup failed')
        }
      }
     
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message)
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #032221 !important; }' }} />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-dark-green p-4 sm:p-8">
        {/* Stunning Background Video or Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518605368461-1ee7e54f7fb7?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-brand-dark-green/95 via-brand-pine/80 to-brand-mint/40" />

      {/* Animated Light Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1.1, 1], 
          x: [0, 100, -50, 0], 
          y: [0, -100, 50, 0] 
        }} 
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 sm:left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-brand-mint/40 rounded-full blur-[80px] sm:blur-[100px] z-0 pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 0.9, 1], 
          x: [0, -150, 100, 0], 
          y: [0, 150, -100, 0] 
        }} 
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-20 sm:right-1/4 w-80 h-80 sm:w-[30rem] sm:h-[30rem] bg-brand-caribbean/30 rounded-full blur-[100px] sm:blur-[120px] z-0 pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-lg z-10 my-8"
      >
        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-brand-caribbean via-brand-mint to-brand-pistachio" />
          
          <CardHeader className="space-y-1 text-center pt-8 pb-4">
            <h2 className="text-3xl font-bold text-white mt-2">
              {isGoogleSignup ? 'Complete Profile' : 'Partner with Us'}
            </h2>
            <p className="text-white/70 text-sm">
              {isGoogleSignup 
                ? 'Just a few more details to complete your account.'
                : 'Create your owner account to manage your turfs.'}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className={`pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl text-base ${errors.name ? 'border-red-500/50' : ''}`}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 font-medium">
                    {errors.name.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="business_name">Business Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="business_name" 
                    placeholder="JD Turfs" 
                    className={`pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl text-base ${errors.business_name ? 'border-red-500/50' : ''}`}
                    {...register('business_name')}
                  />
                </div>
                {errors.business_name && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 font-medium">
                    {errors.business_name.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="email" 
                    placeholder="owner@turf.com" 
                    className={`pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500/50' : ''}`}
                    {...register('email')}
                    disabled={isGoogleSignup}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 font-medium">
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="phone" 
                    placeholder="1234567890" 
                    className={`pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl text-base ${errors.phone ? 'border-red-500/50' : ''}`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 font-medium">
                    {errors.phone.message}
                  </motion.p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold tracking-wide text-brand-mint uppercase" htmlFor="password">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className={`pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-xl text-base tracking-widest ${errors.password ? 'border-red-500/50' : ''}`}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 font-medium">
                    {errors.password.message}
                  </motion.p>
                )}
              </div>
              
              <AnimatePresence>
                {serverError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2"
                  >
                    <p className="text-sm text-red-400 text-center font-medium">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={isSubmitting || isGoogleLoading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-mint to-brand-caribbean text-brand-dark-green hover:from-brand-caribbean hover:to-brand-mint border-none shadow-[0_0_30px_rgba(42,161,152,0.4)] hover:shadow-[0_0_40px_rgba(42,161,152,0.6)] transition-all rounded-2xl mt-8 group" 
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isGoogleSignup ? 'Complete Profile' : 'Create Account')}
              </Button>
              
              {!isGoogleSignup && (
                <>
                  <div className="relative my-6 flex items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/50 text-sm">OR</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <div className="flex justify-center w-full">
                    <div className="w-full relative">
                      {isGoogleLoading && (
                        <div className="absolute inset-0 z-10 bg-black/50 rounded flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-brand-mint" />
                        </div>
                      )}
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => setServerError('Google Login Failed')}
                        width="100%"
                        theme="filled_black"
                        size="large"
                        shape="circle"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <Link href="/owner/login" className="text-brand-mint font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </>
  )
}

export default function OwnerSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-dark-green p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-mint" />
      </div>
    }>
      <OwnerSignupForm />
    </Suspense>
  )
}
