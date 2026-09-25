import { CustomerLayout } from "@/components/layout/customer-layout"

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerLayout>{children}</CustomerLayout>
}
