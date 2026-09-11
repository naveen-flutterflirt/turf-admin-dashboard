import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Turfcut',
  description: 'Privacy Policy for Turfcut',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
            <section>
              <p>
                Welcome to Turfcut. This Privacy Policy explains how your personal information is collected, used, and protected when you use our application and services. By accessing or using Turfcut, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. What Information You Collect
              </h2>
              <p>
                When you create an account with us, we collect Personal Information such as your <strong>Name, Email Address, Phone Number, and Passwords</strong>. This information is necessary to provide you with our services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. How You Use That Information
              </h2>
              <p>
                The data we collect is used strictly for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>App Functionality:</strong> Managing turf bookings, scheduling, and confirming reservations.</li>
                <li><strong>Account Management:</strong> Facilitating user login, profile management, and password resets.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Third-Party Services
              </h2>
              <p>
                We use third-party services to ensure a seamless and secure experience. For processing payments securely, we use <strong>Razorpay</strong>. We want to explicitly state that we do not store sensitive credit card information or payment details on our own servers. All payment processing is handled directly and securely by Razorpay.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Data Security
              </h2>
              <p>
                We take your data security seriously. All user data is transmitted securely over an encrypted connection (HTTPS). We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Data Deletion Policy
              </h2>
              <p className="mb-4">
                You have the right to request the deletion of your personal data and account at any time.
              </p>
              <div className="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg border border-red-100 dark:border-red-900">
                <p className="font-medium text-red-900 dark:text-red-200 text-lg">
                  To request deletion of your account and data, please email us at{' '}
                  <a href="mailto:info@flutterflirt.com" className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline font-semibold transition-colors">
                    info@flutterflirt.com
                  </a>
                </p>
                <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                  We will process your request within 30 days of receiving your email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Contact Information
              </h2>
              <p>
                If you have any questions, concerns, or require further clarification about our privacy practices, please contact us at:
                <br />
                <a href="mailto:support@turfcut.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@turfcut.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
