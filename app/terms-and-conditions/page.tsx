import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | Turfcut',
  description: 'Terms and Conditions for Turfcut Booking Platform',
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #032221 !important; }' }} />
      <div className="min-h-screen bg-brand-dark-green py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-white">
        {/* Animated Light Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-caribbean/20 rounded-full blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-[30rem] h-[30rem] bg-brand-mint/20 rounded-full blur-[120px] z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-brand-mint hover:text-white transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
        
        <div className="bg-black/40 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-brand-pistachio via-brand-mint to-brand-caribbean" />
          
          <div className="px-6 py-10 sm:p-12">
            <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-8">
              <div className="w-14 h-14 bg-brand-mint/10 rounded-2xl flex items-center justify-center border border-brand-mint/20">
                <ShieldAlert className="w-7 h-7 text-brand-mint" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Terms and Conditions
                </h1>
                <p className="text-brand-anti-flash/60 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-10 text-white/80 leading-relaxed text-lg font-light">
              <section>
                <p>
                  Welcome to <strong>Turfcut</strong>. These Terms and Conditions govern your use of our platform, applications, and services. By registering for an account or using our platform to book or list turf venues, you agree to be bound by these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">1.</span> Account Registration
                </h2>
                <p>
                  Users must provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for all activities that occur under your account. Turfcut reserves the right to suspend or terminate accounts that provide false information or violate these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">2.</span> Booking and Cancellations
                </h2>
                <ul className="list-disc pl-5 space-y-3 marker:text-brand-mint">
                  <li><strong className="text-white">For Players:</strong> All bookings made through Turfcut are subject to the availability of the venue. Cancellation policies are set by individual turf owners. Please review the specific cancellation policy of the venue before completing your booking.</li>
                  <li><strong className="text-white">For Owners:</strong> You agree to honor all confirmed bookings. In the event of an unavoidable cancellation on your part, you must notify the platform and the user immediately to facilitate a full refund.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">3.</span> Payments and Fees
                </h2>
                <p>
                  Turfcut facilitates payments between players and turf owners through secure third-party gateways (e.g., Razorpay). 
                  Turf owners agree to our standard commission structure, which is automatically deducted from payouts. We are not responsible for transaction failures caused by external banking networks.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">4.</span> User Conduct
                </h2>
                <p>
                  You agree to use Turfcut only for lawful purposes. You are prohibited from:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-3 marker:text-brand-mint">
                  <li>Attempting to bypass the platform to make direct bookings to avoid fees.</li>
                  <li>Posting false, inaccurate, or misleading reviews or venue information.</li>
                  <li>Using the platform to harass, abuse, or harm other users or turf owners.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">5.</span> Liability and Disclaimers
                </h2>
                <p>
                  Turfcut acts solely as a technological bridge between players and venue owners. We are not liable for any injuries, damages, or disputes that occur on the physical premises of the booked turfs. Venue owners are solely responsible for maintaining safe facilities and holding appropriate liability insurance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-brand-mint mb-4 flex items-center gap-2">
                  <span className="text-brand-caribbean">6.</span> Contact Us
                </h2>
                <p>
                  For any questions regarding these Terms and Conditions, please reach out to our legal team at:
                  <br />
                  <a href="mailto:legal@turfcut.com" className="inline-block mt-2 text-brand-caribbean hover:text-brand-mint underline decoration-brand-caribbean/50 underline-offset-4 font-bold transition-colors">
                    legal@turfcut.com
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
