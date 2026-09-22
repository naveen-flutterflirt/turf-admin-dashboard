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
import { Loader2, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react'
import axios from '@/lib/axios'
import Link from 'next/link'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ForgotFormValues = z.infer<typeof forgotSchema>
type ResetFormValues = z.infer<typeof resetSchema>

export default function OwnerForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const forgotForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema)
  })

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema)
  })

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setServerError('')
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/forgot-password', {
        email: data.email
      })

      if (response.data && response.data.success !== false) {
        setEmail(data.email)
        setStep(2)
      } else {
        setServerError(response.data.message || 'Failed to send reset code')
      }
     
    } catch (err: any) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message)
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    }
  }

  const onResetSubmit = async (data: ResetFormValues) => {
    setServerError('')
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/reset-password', {
        email: email,
        code: data.code,
        newPassword: data.newPassword
      })

      if (response.data && response.data.success !== false) {
        setSuccessMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/owner/login')
        }, 2000)
      } else {
        setServerError(response.data.message || 'Failed to reset password')
      }
     
    } catch (err: any) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message)
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
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
        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden relative">
          {/* Top Gradient Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-brand-caribbean via-brand-mint to-brand-pistachio" />
          
          <CardHeader className="space-y-1 text-center pt-8 pb-4 relative">
            <Link href="/owner/login" className="absolute left-6 top-6 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl p-3 mb-2"
            >
              <KeyRound className="w-12 h-12 text-brand-mint drop-shadow-md" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mt-4">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="text-white/70 text-sm px-4">
              {step === 1 
                ? "Enter your email address and we'll send you a code to reset your password." 
                : "Enter the verification code sent to your email and your new password."}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={forgotForm.handleSubmit(onForgotSubmit)} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="email">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                      <Input 
                        id="email" 
                        placeholder="owner@turf.com" 
                        className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg ${forgotForm.formState.errors.email ? 'border-red-500/50' : ''}`}
                        {...forgotForm.register('email')}
                      />
                    </div>
                    {forgotForm.formState.errors.email && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
                        {forgotForm.formState.errors.email.message}
                      </motion.p>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {serverError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden"
                      >
                        <p className="text-sm text-red-400 text-center font-medium">{serverError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button 
                    type="submit" 
                    disabled={forgotForm.formState.isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-mint to-brand-caribbean text-brand-dark-green hover:from-brand-caribbean hover:to-brand-mint border-none shadow-[0_0_30px_rgba(42,161,152,0.4)] hover:shadow-[0_0_40px_rgba(42,161,152,0.6)] transition-all rounded-2xl mt-6" 
                  >
                    {forgotForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                  </Button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={resetForm.handleSubmit(onResetSubmit)} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="code">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                      <Input 
                        id="code" 
                        placeholder="e.g. 599857" 
                        className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg tracking-widest ${resetForm.formState.errors.code ? 'border-red-500/50' : ''}`}
                        {...resetForm.register('code')}
                      />
                    </div>
                    {resetForm.formState.errors.code && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
                        {resetForm.formState.errors.code.message}
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="newPassword">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg tracking-widest ${resetForm.formState.errors.newPassword ? 'border-red-500/50' : ''}`}
                        {...resetForm.register('newPassword')}
                      />
                    </div>
                    {resetForm.formState.errors.newPassword && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
                        {resetForm.formState.errors.newPassword.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wide text-brand-mint ml-1 uppercase" htmlFor="confirmPassword">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-mint/70" />
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        className={`pl-12 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:bg-black/60 focus:border-brand-mint focus:ring-1 focus:ring-brand-mint/50 transition-all rounded-2xl text-lg tracking-widest ${resetForm.formState.errors.confirmPassword ? 'border-red-500/50' : ''}`}
                        {...resetForm.register('confirmPassword')}
                      />
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 ml-1 mt-1 font-medium">
                        {resetForm.formState.errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {serverError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden"
                      >
                        <p className="text-sm text-red-400 text-center font-medium">{serverError}</p>
                      </motion.div>
                    )}
                    {successMessage && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-brand-mint/10 border border-brand-mint/30 rounded-xl overflow-hidden"
                      >
                        <p className="text-sm text-brand-mint text-center font-medium">{successMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button 
                    type="submit" 
                    disabled={resetForm.formState.isSubmitting || !!successMessage}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-brand-mint to-brand-caribbean text-brand-dark-green hover:from-brand-caribbean hover:to-brand-mint border-none shadow-[0_0_30px_rgba(42,161,152,0.4)] hover:shadow-[0_0_40px_rgba(42,161,152,0.6)] transition-all rounded-2xl mt-6" 
                  >
                    {resetForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
