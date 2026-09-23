"use client"
import React, { useState } from 'react'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { 
  Download, Smartphone, Users, CalendarDays, 
  MessageCircle, LayoutDashboard, ChevronRight, CheckCircle2,
  Trophy, Shield, Map, Activity, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #032221 !important; scroll-behavior: smooth; }' }} />
      <div className="relative min-h-screen w-full overflow-hidden bg-brand-dark-green text-white font-sans selection:bg-brand-mint selection:text-brand-dark-green">
        
        {/* =======================
            NAVBAR
        ======================== */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 z-50">
            <img src="/Logo.png" alt="TurfPlay Logo" className="h-8 sm:h-12 object-contain drop-shadow-md cursor-pointer" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-brand-mint transition-colors">Explore</a>
            <a href="#" className="hover:text-brand-mint transition-colors">Community</a>
            <Link href="/owner/signup" className="hover:text-brand-mint transition-colors">For Owners</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/owner/login" className="text-sm font-medium hover:text-brand-mint transition-colors">
              Log In
            </Link>
            <a href="https://play.google.com/store/apps/details?id=com.turfcut.app" target="_blank" rel="noopener noreferrer">
              <Button className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-bold rounded-full px-6 shadow-[0_0_15px_rgba(42,161,152,0.3)] transition-all">
                <Download className="w-4 h-4 mr-2" /> Download App
              </Button>
            </a>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-white" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-40 bg-brand-dark-green/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-xl font-medium"
            >
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-mint transition-colors">Explore</a>
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-mint transition-colors">Community</a>
              <Link href="/owner/signup" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-mint transition-colors">For Owners</Link>
              <Link href="/owner/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-mint transition-colors">Owner Login</Link>
              <a href="https://play.google.com/store/apps/details?id=com.turfcut.app" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="mt-4 bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-bold rounded-full px-8 py-6 text-lg shadow-[0_0_20px_rgba(42,161,152,0.4)] transition-all">
                  <Download className="w-5 h-5 mr-2" /> Download App
                </Button>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =======================
            HERO SECTION
        ======================== */}
        <section className="relative flex flex-col justify-center pt-40 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-green via-brand-dark-green/60 to-transparent z-10" />
            
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="object-cover w-full h-full scale-105 animate-[pulse_20s_ease-in-out_infinite]"
            >
              <source src="/Landing.mp4" type="video/mp4" />
              <img 
                src="https://images.unsplash.com/photo-1518605368461-1ee7e54f7fb7?q=80&w=2000&auto=format&fit=crop" 
                alt="Football Turf" 
                className="object-cover w-full h-full"
              />
            </video>
          </div>

          <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-start text-left">
            <motion.h1 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="text-5xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter mb-6 text-white drop-shadow-2xl leading-[1.05] max-w-4xl"
            >
              Play Anywhere. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mint to-brand-caribbean">Book Instantly.</span>
            </motion.h1>
            
            <motion.p 
              initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }}
              className="max-w-xl text-lg sm:text-2xl text-white/90 mb-10 leading-relaxed font-light drop-shadow-lg"
            >
              Find nearby sports facilities, connect with players, and manage your games seamlessly.
            </motion.p>

            <motion.div 
              initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.4 }}
              className="flex flex-row gap-3 sm:gap-4 w-full max-w-md"
            >
              <a href="https://play.google.com/store/apps/details?id=com.turfcut.app" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full h-14 sm:h-16 text-sm sm:text-lg font-bold bg-white text-black hover:bg-white/90 rounded-2xl group transition-all whitespace-nowrap px-2 sm:px-6">
                  <Smartphone className="mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  Download App
                </Button>
              </a>
              <Button className="flex-1 h-14 sm:h-16 text-sm sm:text-lg font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-2xl transition-all whitespace-nowrap px-2 sm:px-6">
                Explore Turfs
              </Button>
            </motion.div>
          </div>
        </section>


        {/* =======================
            DISCOVER SPORTS
        ======================== */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-dark-green relative z-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">Find Your <span className="text-brand-caribbean">Sport</span></h2>
                <p className="text-white/60 text-lg">Book premium venues across various sports categories.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Football', img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800', count: '142 Turfs' },
                { name: 'Cricket', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800', count: '89 Turfs' },
                { name: 'Badminton', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', count: '56 Courts' },
                { name: 'Basketball', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800', count: '24 Courts' },
              ].map((sport, i) => (
                <motion.div 
                  key={i} 
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer"
                >
                  <img src={sport.img} alt={sport.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform">{sport.name}</h3>
                    <p className="text-brand-mint text-sm font-medium">{sport.count}</p>
                  </div>
                  <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* =======================
            HOW IT WORKS
        ======================== */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black/40 relative z-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-white/60 text-lg">Three simple steps to elevate your game.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-brand-mint/30 to-transparent -z-10" />
              
              {[
                { title: 'Search & Discover', desc: 'Find the perfect venue based on location, sport, and amenities.', icon: Map },
                { title: 'Book & Pay', desc: 'Confirm your slot instantly with secure online payments.', icon: CalendarDays },
                { title: 'Play & Connect', desc: 'Show up, play, and connect with local sports communities.', icon: Activity },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-brand-dark-green border-2 border-brand-mint/30 shadow-[0_0_30px_rgba(42,161,152,0.15)] flex items-center justify-center mb-8 relative">
                    <step.icon className="w-10 h-10 text-brand-mint" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-caribbean flex items-center justify-center text-black font-black text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-white/60 leading-relaxed max-w-sm">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* =======================
            COMMUNITY & OWNERS
        ======================== */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-dark-green relative z-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-[3rem] p-10 sm:p-14 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-caribbean/10 rounded-full blur-[80px]" />
              <Users className="w-12 h-12 text-brand-caribbean mb-8" />
              <h3 className="text-3xl sm:text-4xl font-bold mb-4">Never Play Alone.</h3>
              <p className="text-white/60 text-lg mb-10 max-w-md">
                Create a broadcast, invite nearby players, and form your own sports community effortlessly.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-brand-caribbean" />
                  <span className="font-medium">Host Public Games</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/5">
                  <MessageCircle className="w-5 h-5 text-brand-caribbean" />
                  <span className="font-medium">In-app Group Chats</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-gradient-to-bl from-white/5 to-white/0 border border-white/10 rounded-[3rem] p-10 sm:p-14 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-mint/10 rounded-full blur-[80px]" />
              <LayoutDashboard className="w-12 h-12 text-brand-mint mb-8" />
              <h3 className="text-3xl sm:text-4xl font-bold mb-4">For Turf Owners.</h3>
              <p className="text-white/60 text-lg mb-10 max-w-md">
                List your venue, manage bookings, and grow your revenue with our powerful analytics dashboard.
              </p>
              <div className="flex gap-4 mb-8">
                <Link href="/owner/signup">
                  <Button className="h-12 px-6 font-bold bg-brand-mint text-brand-dark-green hover:bg-white rounded-xl">List Your Turf</Button>
                </Link>
                <Link href="/owner/login">
                  <Button className="h-12 px-6 font-bold bg-white text-brand-dark-green hover:bg-white/90 border-none rounded-xl">Owner Login</Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50 font-medium">
                <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Higher Revenue</div>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure Platform</div>
              </div>
            </motion.div>

          </div>
        </section>


        {/* =======================
            DOWNLOAD APP CTA
        ======================== */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black/40 relative z-10 border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
          
          <div className="max-w-4xl mx-auto text-center relative z-20">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
              Ready to Step Onto <br className="hidden sm:block" /> the Field?
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }} className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Download TurfPlay now to book your first slot and join a growing community of passionate athletes.
            </motion.p>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }} className="flex flex-row gap-3 sm:gap-4 justify-center w-full px-2">
              <Button className="flex-1 sm:flex-none h-14 sm:h-16 px-2 sm:px-10 text-xs sm:text-lg font-bold bg-white text-black hover:bg-white/90 rounded-2xl group shadow-2xl transition-all whitespace-nowrap">
                <Download className="mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6 group-hover:-translate-y-1 transition-transform" />
                iOS App
              </Button>
              <a href="https://play.google.com/store/apps/details?id=com.turfcut.app" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button className="w-full h-14 sm:h-16 px-2 sm:px-10 text-xs sm:text-lg font-bold bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 rounded-2xl group shadow-[0_0_30px_rgba(42,161,152,0.3)] transition-all whitespace-nowrap">
                  <Download className="mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6 group-hover:-translate-y-1 transition-transform" />
                  Android App
                </Button>
              </a>
            </motion.div>
          </div>
        </section>


        {/* =======================
            FOOTER (NO CONTACT US)
        ======================== */}
        <footer className="w-full pt-20 pb-10 px-6 sm:px-12 bg-black/80 backdrop-blur-2xl relative z-10 border-t border-brand-mint/20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-6 sm:gap-12 mb-16">
            
            <div className="col-span-2">
              <img src="/Logo.png" alt="TurfPlay Logo" className="h-10 object-contain mb-6 drop-shadow-md" />
              <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
                The ultimate premium platform to book sports venues, connect with local athletes, and manage your games effortlessly.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-mint/20 hover:text-brand-mint hover:border-brand-mint/50 transition-all cursor-pointer text-white/70 shadow-lg font-bold text-xs">
                  IG
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-mint/20 hover:text-brand-mint hover:border-brand-mint/50 transition-all cursor-pointer text-white/70 shadow-lg font-bold text-xs">
                  X
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-mint/20 hover:text-brand-mint hover:border-brand-mint/50 transition-all cursor-pointer text-white/70 shadow-lg font-bold text-xs">
                  LI
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg tracking-wide">Play</h4>
              <ul className="space-y-4 text-white/50 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-mint hover:translate-x-1 transition-all inline-block">Explore Turfs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg tracking-wide">Partners</h4>
              <ul className="space-y-4 text-white/50 text-sm font-medium">
                <li><Link href="/owner/signup" className="hover:text-brand-mint hover:translate-x-1 transition-all inline-block">List Your Turf</Link></li>
                <li><Link href="/owner/login" className="hover:text-brand-mint hover:translate-x-1 transition-all inline-block">Owner Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg tracking-wide">Legal</h4>
              <ul className="space-y-4 text-white/50 text-sm font-medium">
                <li><Link href="/privacy-policy" className="hover:text-brand-mint hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-brand-mint hover:translate-x-1 transition-all inline-block">Terms & Conditions</Link></li>
              </ul>
            </div>

          </div>
          
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-white/30 font-medium">
              © {new Date().getFullYear()} TurfPlay. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}
