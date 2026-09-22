"use client"

import React, { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Download, Smartphone, Cpu, ShieldCheck, ChevronLeft, Settings, CheckCircle2, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

export default function DownloadPage() {
  const [isDetecting, setIsDetecting] = useState(true)
  const [downloadLink, setDownloadLink] = useState("/downloads/app-arm64-v8a-release.apk")
  const [downloadText, setDownloadText] = useState("Detecting best version...")

  function enableFallbackMode() {
    setDownloadLink("/downloads/app-arm64-v8a-release.apk")
    setDownloadText("Download App (arm64 Default)")
    setIsDetecting(false)
  }

  useEffect(() => {
    async function setupDynamicDownload() {
      try {
        // @ts-expect-error - userAgentData is not standard yet
        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
          // @ts-expect-error - getHighEntropyValues is not in standard types
          const values = await navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness'])
          
          let apkFile = "app-arm64-v8a-release.apk" // Safe default
          
          if (values.architecture === 'arm') {
            apkFile = values.bitness === '64' ? "app-arm64-v8a-release.apk" : "app-armeabi-v7a-release.apk"
          } else if (values.architecture === 'x86') {
            apkFile = values.bitness === '64' ? "app-x86_64-release.apk" : "app-x86-release.apk"
          }

          setDownloadLink(`/downloads/${apkFile}`)
          setDownloadText("Download App (Optimized)")
          setIsDetecting(false)
        } else {
          enableFallbackMode()
        }
      } catch (error) {
        console.error("Client hints detection failed:", error)
        enableFallbackMode()
      }
    }

    setupDynamicDownload()
  }, [])

  const manualOptions = [
    { name: 'ARM64', desc: 'Most modern phones (Recommended)', file: 'app-arm64-v8a-release.apk' },
    { name: 'ARM32', desc: 'Older Android phones', file: 'app-armeabi-v7a-release.apk' },
    { name: 'x86_64', desc: 'Emulators & Tablets', file: 'app-x86_64-release.apk' },
    { name: 'x86', desc: 'Older Emulators', file: 'app-x86-release.apk' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #032221 !important; scroll-behavior: smooth; }' }} />
      <div className="relative min-h-[100svh] w-full bg-brand-dark-green text-white font-sans selection:bg-brand-mint selection:text-brand-dark-green overflow-hidden">
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
          </Link>
          <img src="/Logo.png" alt="TurfPlay Logo" className="h-8 object-contain drop-shadow-md" />
        </nav>

        {/* Ambient Backgrounds */}
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-brand-mint/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-brand-caribbean/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-mint/10 border border-brand-mint/20 text-brand-mint text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" /> Secure Direct Download
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
                Your Turf, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mint to-brand-caribbean">In Your Pocket.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-white/60 text-lg sm:text-xl mb-10 leading-relaxed max-w-lg">
                Download the official TurfPlay Android app directly. We automatically detect your device to deliver the smallest, most optimized version.
              </motion.p>

              <motion.div variants={fadeInUp} className="w-full sm:w-auto">
                <a href={downloadLink}>
                  <Button 
                    className={`w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(42,161,152,0.2)] hover:shadow-[0_0_60px_rgba(42,161,152,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3 ${isDetecting ? 'bg-white/10 text-white/50 cursor-wait' : 'bg-brand-mint text-brand-dark-green'}`}
                    disabled={isDetecting}
                  >
                    {isDetecting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-6 h-6" />
                    )}
                    {downloadText}
                  </Button>
                </a>
                
                <div className="flex items-center gap-6 mt-6 text-sm font-medium text-white/40 ml-2">
                  <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Small Size (~30MB)</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 100% Virus-Free</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:flex justify-center"
            >
              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-20 w-[300px] h-[600px] bg-black rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* iPhone Notch Area */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black z-30 rounded-b-xl w-40 mx-auto" />
                
                <div className="flex-1 bg-brand-dark-green relative p-6 pt-12">
                  {/* Mockup UI Inner */}
                  <div className="flex items-center justify-between mb-6">
                    <img src="/Logo.png" alt="App Logo" className="h-6 object-contain brightness-0 invert opacity-80" />
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                  <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-brand-mint/20 to-transparent mb-4" />
                  <div className="w-3/4 h-6 rounded-lg bg-white/10 mb-2" />
                  <div className="w-1/2 h-4 rounded-lg bg-white/5 mb-8" />
                  <div className="w-full h-24 rounded-2xl bg-white/5 mb-4" />
                  <div className="w-full h-24 rounded-2xl bg-white/5" />
                  
                  <div className="absolute bottom-10 inset-x-6 h-14 bg-brand-mint rounded-xl shadow-lg flex items-center justify-center text-brand-dark-green font-bold">
                    Book Now
                  </div>
                </div>
              </motion.div>
              
              {/* Mockup Shadow/Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-mint/20 blur-[100px] rounded-full z-10" />
            </motion.div>
          </div>
        </div>

        {/* Installation Guide Section */}
        <div className="border-t border-white/5 bg-black/40 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How to Install</h2>
              <p className="text-white/60">Follow these simple steps to install the app on your Android device.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-brand-mint/20 to-transparent" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-brand-mint shadow-lg">
                  <DownloadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Download APK</h3>
                <p className="text-white/50 text-sm max-w-[200px]">Click the download button above to get the optimized file.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-brand-mint shadow-lg">
                  <Settings className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Allow Unknown Sources</h3>
                <p className="text-white/50 text-sm max-w-[200px]">If prompted, go to Settings and allow installations from your browser.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-brand-mint shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Install & Play</h3>
                <p className="text-white/50 text-sm max-w-[200px]">Open the downloaded file, hit install, and start booking turfs!</p>
              </div>
            </div>

            {/* Manual Options Grid */}
            <div className="max-w-3xl mx-auto mt-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Manual Architecture Options</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {manualOptions.map((opt, i) => (
                  <a key={i} href={`/downloads/${opt.file}`} className="block group">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-brand-mint/10 hover:border-brand-mint/30 transition-all">
                      <div className="font-bold text-white group-hover:text-brand-mint flex justify-between items-center text-lg mb-1">
                        {opt.name}
                        <Download className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-white/40">{opt.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
