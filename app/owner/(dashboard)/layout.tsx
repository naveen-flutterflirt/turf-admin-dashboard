import React from 'react'
import { OwnerLayout } from '@/components/layout/owner-layout'
import { Toaster } from 'sonner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" richColors />
      <OwnerLayout>{children}</OwnerLayout>
    </>
  )
}
