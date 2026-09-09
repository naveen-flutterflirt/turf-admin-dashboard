"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Download, Smartphone, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-dark-green text-white font-sans selection:bg-brand-mint selection:text-brand-dark-green">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full opacity-60"
        >
          <source src="/Landing.mp4" type="video/mp4" />
          {/* Fallback image in case video fails */}
          <img 
            src="https://images.unsplash.com/photo-1518605368461-1ee7e54f7fb7?q=80&w=2000&auto=format&fit=crop" 
            alt="Turf background" 
            className="object-cover w-full h-full"
          />
        </video>
        {/* Gradient Overlays for better text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-green/90 via-brand-dark-green/50 to-brand-dark-green/95" />
      </div>

      {/* Main Content Container */}
      <div 
        className="relative z-10 flex flex-col min-h-screen"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        
        {/* Main Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20 pb-24">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 sm:mb-12"
          >
            <img src="/Logo.png" alt="Turf Booking App" className="w-auto h-20 sm:h-28 drop-shadow-2xl object-contain" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-[5rem] font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 drop-shadow-2xl leading-[1.1]"
          >
            Play Anywhere. <br className="hidden sm:block" /> Book Instantly.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-2xl text-lg sm:text-2xl text-white/80 mb-12 leading-relaxed font-light tracking-wide"

          >
            Discover, book, and play on the best turfs in your city instantly. 
            Manage your bookings, invite friends, and elevate your game with our state-of-the-art mobile app.
          </motion.p>

          {/* Features List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-16"
          >
            {[
              "Instant Confirmations",
              "Split Payments",
              "Verified Venues"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-brand-anti-flash/90 font-medium">
                <CheckCircle2 className="w-5 h-5 text-brand-mint" />
                {feature}
              </div>
            ))}
          </motion.div>

          {/* App Store Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md mx-auto"
          >
            <Button 
              className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold bg-white text-black hover:bg-white/90 border-none rounded-2xl group transition-all"
            >
              <Smartphone className="mr-2 w-6 h-6 group-hover:scale-110 transition-transform" />
              App Store
            </Button>
            <Button 
              className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold bg-gradient-to-r from-brand-mint to-brand-caribbean text-brand-dark-green hover:from-brand-caribbean hover:to-brand-mint border-none rounded-2xl shadow-[0_0_30px_rgba(42,161,152,0.3)] group transition-all"
            >
              <Download className="mr-2 w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              Google Play
            </Button>
          </motion.div>
          

        </main>

        {/* Minimal Footer */}
        <footer className="w-full py-6 px-6 sm:px-12 border-t border-white/10 bg-black/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-brand-anti-flash/60 font-medium">
            © {new Date().getFullYear()} Turf Booking Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs sm:text-sm text-brand-anti-flash/60">
            <a href="#" className="hover:text-brand-mint transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-mint transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-mint transition-colors">Contact Us</a>
          </div>
        </footer>

      </div>
    </div>
  )
}
