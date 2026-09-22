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
import { Loader2, Mail, Lock } from 'lucide-react'
import axios from '@/lib/axios'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function OwnerLoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('owner_token') : null
    if (token) {
      router.push('/owner/dashboard')
    }
  }, [router])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

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

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('')
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/owner/login', {
        email: data.email,
        password: data.password
      })

      if (response.data && response.data.success) {
        // Store token and user data
        localStorage.setItem('owner_token', response.data.token || '')
        localStorage.setItem('owner_user', JSON.stringify(response.data.owner || response.data.data || {}))
        router.push('/owner/dashboard')
      } else {
        setServerError(response.data.message || 'Login failed')
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
        {/* Stunning Background Image with Gradient Overlay */}
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
        className="w-full max-w-md z-10"
      >
        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-brand-caribbean via-brand-mint to-brand-pistachio" />
          
          <CardHeader className="space-y-1 text-center pt-10 pb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-28 h-28 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl p-3"
            >
              <img src="/Logo.png" alt="Owner Logo" className="h-full w-full object-contain drop-shadow-md rounded-2xl" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mt-4">Owner Login</h2>
            <p className="text-white/70 text-sm">Welcome back! Please enter your details.</p>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="email" 
                    placeholder="owner@turf.com" 
                    className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg ${errors.email ? 'border-red-500/50' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
                    {errors.email.message}
                  </motion.p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold tracking-wide text-brand-mint uppercase" htmlFor="password">Password</label>
                  <Link href="/owner/forgot-password" className="text-xs text-brand-mint/80 hover:text-brand-mint font-medium transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg tracking-widest ${errors.password ? 'border-red-500/50' : ''}`}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
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
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-sm text-red-400 text-center font-medium">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={isSubmitting || isGoogleLoading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-mint to-brand-caribbean text-brand-dark-green hover:from-brand-caribbean hover:to-brand-mint border-none shadow-[0_0_30px_rgba(42,161,152,0.4)] hover:shadow-[0_0_40px_rgba(42,161,152,0.6)] transition-all rounded-2xl mt-6 group" 
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Secure Login'}
              </Button>
              
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
              
              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm">
                  Don&apos;t have an account?{` `}
                  <Link href="/owner/signup" className="text-brand-mint font-semibold hover:underline">
                    Sign up
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
