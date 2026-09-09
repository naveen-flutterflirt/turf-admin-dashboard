import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Toaster } from 'sonner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AdminLayout>{children}</AdminLayout>
    </>
  )
}
