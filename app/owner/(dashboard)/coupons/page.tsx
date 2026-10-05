"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Calendar, CheckCircle2, Ticket, Percent, IndianRupee, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

// Dummy data for UI
const dummyCoupons = [
  { id: '1', code: 'WELCOME50', type: 'percentage', value: 50, maxDiscount: 200, minPurchase: 500, status: 'ACTIVE', validUntil: '2027-12-31' },
  { id: '2', code: 'FLAT100', type: 'fixed', value: 100, maxDiscount: 100, minPurchase: 1000, status: 'INACTIVE', validUntil: '2026-11-30' },
]

export default function OwnerCouponsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coupons, setCoupons] = useState(dummyCoupons)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCouponToDelete, setSelectedCouponToDelete] = useState<any>(null)

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 w-full max-w-[1400px] mx-auto min-h-screen">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-brand-dark-green dark:text-white flex items-center gap-3">
            <div className="p-2 bg-brand-mint/10 rounded-xl border border-brand-mint/20">
              <Ticket className="w-6 h-6 text-brand-mint" />
            </div>
            Coupon Management
          </h1>
          <p className="text-gray-600 dark:text-white/60 mt-1">
            Create and manage discount coupons for your customers.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all px-6 h-10">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </motion.div>

      {/* Table of Coupons */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
          {coupons.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Ticket className="w-12 h-12 mb-4 opacity-20" />
              <p>No coupons created yet.</p>
              <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-4 border-border">
                Create First Coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Coupon Code</th>
                    <th className="px-6 py-4 font-medium">Details</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Valid Until</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {coupons.map((coupon) => (
                    <motion.tr key={coupon.id} variants={itemVariants} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-bold text-lg text-brand-mint bg-brand-mint/10 px-3 py-1 rounded-md border border-brand-mint/20">
                            {coupon.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium flex items-center gap-1 text-foreground">
                            {coupon.type === 'percentage' ? <Percent className="w-3 h-3 text-muted-foreground" /> : <IndianRupee className="w-3 h-3 text-muted-foreground" />}
                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Min order: ₹{coupon.minPurchase} {coupon.type === 'percentage' && `| Max cap: ₹${coupon.maxDiscount}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              coupon.status === 'ACTIVE' ? 'bg-brand-mint' : 'bg-secondary'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                coupon.status === 'ACTIVE' ? 'translate-x-6 bg-brand-dark-green' : 'translate-x-1 bg-muted-foreground'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 w-fit transition-colors ${
                            coupon.status === 'ACTIVE' 
                              ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20' 
                              : 'bg-secondary/50 text-muted-foreground border-border'
                          }`}>
                            {coupon.status === 'ACTIVE' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current opacity-50" />
                            )}
                            {coupon.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedCouponToDelete(coupon)
                            setIsDeleteModalOpen(true)
                          }} 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Coupon">
        <form className="space-y-4 pt-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Coupon Code</label>
            <Input type="text" placeholder="e.g. SUMMER50" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Discount Type</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Discount Value</label>
              <Input type="number" placeholder="e.g. 50" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min Purchase Amount (₹)</label>
              <Input type="number" placeholder="e.g. 500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Discount Cap (₹)</label>
              <Input type="number" placeholder="e.g. 200" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Valid Until</label>
            <Input type="date" required className="justify-start text-left font-normal" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-bold">
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Coupon">
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete the coupon <span className="font-bold text-foreground">{selectedCouponToDelete?.code}</span>? This action cannot be undone.</p>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                setCoupons(prev => prev.filter(c => c.id !== selectedCouponToDelete?.id))
                setIsDeleteModalOpen(false)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
