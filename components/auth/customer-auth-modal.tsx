"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { customerAuthService } from '@/services/customer-auth'

export function CustomerAuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const validateForm = () => {
    if (!isLogin) {
      if (formData.name.length < 2) return "Name must be at least 2 characters long";
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) return "Please enter a valid 10-digit phone number";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address";
    
    if (formData.password.length < 6) return "Password must be at least 6 characters long";
    
    return null; // Null means no errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      if (!isLogin) {
        // API call for signup
        const response = await customerAuthService.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
        
        if (response.success) {
          setSuccessMsg(response.message)
          setRegisteredEmail(formData.email)
          setIsVerifyingOtp(true)
          setResendTimer(30)
        } else {
          setError(response.message || 'Failed to sign up')
        }
      } else {
        // API call for login
        const response = await customerAuthService.login({
          email: formData.email,
          password: formData.password
        })

        if (response.success && response.token) {
          localStorage.setItem('customer_token', response.token)
          localStorage.setItem('customer_user', JSON.stringify({ 
            name: response.data?.name || 'User', 
            email: formData.email 
          }))
          window.location.reload()
        } else {
          setError(response.message || 'Failed to sign in')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code")
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const response = await customerAuthService.verifyEmail({
        email: registeredEmail,
        code: otpCode
      })

      if (response.success) {
        setSuccessMsg("Email verified successfully! You can now sign in.")
        setIsVerifyingOtp(false)
        setIsLogin(true)
        setOtpCode('')
      } else {
        setError(response.message || 'Verification failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return

    setIsResending(true)
    setError('')
    setSuccessMsg('')

    try {
      const response = await customerAuthService.resendVerification({
        email: registeredEmail
      })

      if (response.success) {
        setSuccessMsg(response.message || 'Verification code resent successfully!')
        setResendTimer(30)
      } else {
        setError(response.message || 'Failed to resend verification code')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4"
          >
            <div className="bg-card/90 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden relative">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    {isVerifyingOtp ? 'Verify Email' : (isLogin ? 'Welcome Back' : 'Join TurfPlay')}
                  </h2>
                  <p className="text-muted-foreground">
                    {isVerifyingOtp 
                      ? 'Enter the 6-digit code sent to your email' 
                      : (isLogin ? 'Sign in to manage your bookings' : 'Create an account to start playing')}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                    {error}
                  </div>
                )}
                
                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-brand-mint/10 border border-brand-mint/20 text-brand-mint text-sm font-medium text-center">
                    {successMsg}
                  </div>
                )}

                {isVerifyingOtp ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground/80">Verification Code</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                          type="text" 
                          required
                          value={otpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtpCode(val)
                          }}
                          placeholder="123456"
                          className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all text-center tracking-[0.5em] font-bold text-xl"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full h-12 bg-gradient-to-r from-brand-caribbean to-brand-mint text-brand-dark-green font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(42,161,152,0.3)] hover:shadow-[0_0_25px_rgba(42,161,152,0.5)] transition-all mt-4 group disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Verify Email'}
                      {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                    
                    <div className="flex flex-col items-center gap-4 mt-6">
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <span>Didn't receive the code?</span>
                        <button 
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendTimer > 0 || isResending}
                          className="text-brand-caribbean font-semibold hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                        >
                          {isResending ? 'Sending...' : (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code')}
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          setIsVerifyingOtp(false)
                          setSuccessMsg('')
                          setError('')
                        }}
                        className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
                      >
                        Change Email / Back to Signup
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground/80">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all"
                          minLength={2}
                        />
                      </div>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground/80">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({...formData, phone: val})
                          }}
                          placeholder="1234567890"
                          className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/80">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="you@example.com"
                        className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/80">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-caribbean/50 transition-all"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-brand-caribbean to-brand-mint text-brand-dark-green font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(42,161,152,0.3)] hover:shadow-[0_0_25px_rgba(42,161,152,0.5)] transition-all mt-4 group disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                )}
                
                {!isVerifyingOtp && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button 
                        onClick={() => {
                          setIsLogin(!isLogin)
                          setError('')
                          setSuccessMsg('')
                        }}
                        className="text-brand-caribbean font-semibold hover:underline"
                      >
                        {isLogin ? 'Sign up' : 'Log in'}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
