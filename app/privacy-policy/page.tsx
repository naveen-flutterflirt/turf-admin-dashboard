import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Turfcut',
  description: 'Privacy Policy for Turfcut Booking Platform',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #032221 !important; }' }} />
      <div className="min-h-screen bg-brand-dark-green py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-white">
        {/* Animated Light Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-mint/20 rounded-full blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-brand-caribbean/20 rounded-full blur-[120px] z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-brand-mint hover:text-white transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
        
        <div className="bg-black/40 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-brand-caribbean via-brand-mint to-brand-pistachio" />
          
          <div className="px-6 py-10 sm:p-12">
            <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-8">
              <div className="w-14 h-14 bg-brand-mint/10 rounded-2xl flex items-center justify-center border border-brand-mint/20">
                <Shield className="w-7 h-7 text-brand-mint" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-brand-anti-flash/60 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-10 text-white/80 leading-relaxed text-lg font-light">
              <section>
                <p>
                  Welcome to <strong>Turfcut</strong>. This Privacy Policy explains how your personal information is collected, used, and protected when you use our application and services. By accessing or using Turfcut, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">1.</span> What Information You Collect
                </h2>
                <p>
                  When you create an account with us, we collect Personal Information such as your <strong>Name, Email Address, Phone Number, and Passwords</strong>. This information is necessary to provide you with our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">2.</span> How You Use That Information
                </h2>
                <p>
                  The data we collect is used strictly for the following purposes:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-3 marker:text-brand-mint">
                  <li><strong className="text-white">App Functionality:</strong> Managing turf bookings, scheduling, and confirming reservations.</li>
                  <li><strong className="text-white">Account Management:</strong> Facilitating user login, profile management, and password resets.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">3.</span> Third-Party Services
                </h2>
                <p>
                  We use third-party services to ensure a seamless and secure experience. For processing payments securely, we use <strong>Razorpay</strong>. We want to explicitly state that we do not store sensitive credit card information or payment details on our own servers. All payment processing is handled directly and securely by Razorpay.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">4.</span> Data Security
                </h2>
                <p>
                  We take your data security seriously. All user data is transmitted securely over an encrypted connection (HTTPS). We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">5.</span> Data Deletion Policy
                </h2>
                <p className="mb-6">
                  You have the right to request the deletion of your personal data and account at any time.
                </p>
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 shadow-inner">
                  <p className="font-medium text-white text-lg">
                    To request deletion of your account and data, please email us at{' '}
                    <a href="mailto:support@turfcut.com" className="text-red-400 hover:text-red-300 underline decoration-red-400/50 underline-offset-4 font-bold transition-colors">
                      support@turfcut.com
                    </a>
                  </p>
                  <p className="mt-3 text-sm text-red-300/80 font-medium">
                    We will process your request within 30 days of receiving your email.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">6.</span> Contact Information
                </h2>
                <p>
                  If you have any questions, concerns, or require further clarification about our privacy practices, please contact us at:
                  <br />
                  <a href="mailto:support@turfcut.com" className="inline-block mt-2 text-brand-caribbean hover:text-brand-mint underline decoration-brand-caribbean/50 underline-offset-4 font-bold transition-colors">
                    support@turfcut.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
