"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Ticket, Plus, Tag, Calendar, Users, IndianRupee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponService } from '@/services/coupon'
import { toast } from 'sonner'

export default function CouponsPage() {
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
  
  // Form State
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT')
  const [discountValue, setDiscountValue] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [minBooking, setMinBooking] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [userUsageLimit, setUserUsageLimit] = useState('1')
  const [newUsersOnly, setNewUsersOnly] = useState(false)

  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: couponService.getCoupons
  })

  const createCouponMutation = useMutation({
    mutationFn: couponService.createCoupon,
    onSuccess: () => {
      toast.success('Coupon created successfully!')
      // Reset form
      setCode('')
      setDiscountType('FLAT')
      setDiscountValue('')
      setMaxDiscount('')
      setMinBooking('')
      setStartDate('')
      setEndDate('')
      setUsageLimit('')
      setUserUsageLimit('1')
      setNewUsersOnly(false)
      
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      setActiveTab('list')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create coupon')
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountValue || !startDate || !endDate) {
      toast.error('Please fill in required fields (Code, Value, Dates)')
      return
    }

    createCouponMutation.mutate({
      code,
      discount_type: discountType,
      discount_value: Number(discountValue),
      max_discount_amount: maxDiscount ? Number(maxDiscount) : undefined,
      min_booking_amount: minBooking ? Number(minBooking) : undefined,
      start_date: startDate,
      end_date: endDate,
      usage_limit: usageLimit ? Number(usageLimit) : undefined,
      user_usage_limit: Number(userUsageLimit),
      new_users_only: newUsersOnly
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="w-8 h-8 text-brand-mint" />
            Coupons
          </h2>
          <p className="text-muted-foreground mt-1">Manage discount coupons and promotional codes.</p>
        </div>
      </div>

      <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          All Coupons
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'create'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
        >
          Create Coupon
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'create' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-brand-pistachio/50">
              <CardHeader className="bg-muted/10 border-b border-border">
                <CardTitle className="text-lg">New Coupon</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Coupon Code <span className="text-red-500">*</span></label>
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SUMMER50"
                        maxLength={20}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Discount Type <span className="text-red-500">*</span></label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'FLAT' | 'PERCENTAGE')}
                      >
                        <option value="FLAT">Flat Amount (₹)</option>
                        <option value="PERCENTAGE">Percentage (%)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Discount Value <span className="text-red-500">*</span></label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === 'FLAT' ? 'e.g. 100' : 'e.g. 20'}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Max Discount Amount (₹)</label>
                      <Input
                        type="number"
                        min="1"
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(e.target.value)}
                        placeholder="e.g. 500"
                        disabled={discountType === 'FLAT'}
                      />
                      {discountType === 'FLAT' && <p className="text-xs text-muted-foreground">Not applicable for FLAT discounts.</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Min Booking Amount (₹)</label>
                      <Input
                        type="number"
                        min="1"
                        value={minBooking}
                        onChange={(e) => setMinBooking(e.target.value)}
                        placeholder="e.g. 1000"
                      />
                    </div>
                    
                    <div className="space-y-2"></div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Start Date <span className="text-red-500">*</span></label>
                      <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">End Date <span className="text-red-500">*</span></label>
                      <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Total Usage Limit</label>
                      <Input
                        type="number"
                        min="1"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        placeholder="e.g. 100 (Leave blank for unlimited)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Per-User Usage Limit <span className="text-red-500">*</span></label>
                      <Input
                        type="number"
                        min="1"
                        value={userUsageLimit}
                        onChange={(e) => setUserUsageLimit(e.target.value)}
                        required
                      />
                    </div>

                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors w-fit border border-border">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-input text-brand-mint focus:ring-brand-mint/50 bg-background"
                        checked={newUsersOnly}
                        onChange={(e) => setNewUsersOnly(e.target.checked)}
                      />
                      <span className="font-medium text-foreground/90">Valid for New Users Only</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 flex items-center justify-center gap-2 font-semibold h-11 px-8"
                    disabled={createCouponMutation.isPending}
                  >
                    {createCouponMutation.isPending ? 'Creating...' : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Coupon
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-brand-pistachio/50">
              <CardHeader className="bg-muted/10 border-b border-border">
                <CardTitle className="text-lg">Available Coupons</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCoupons ? (
                  <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full" />
                    Loading coupons...
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No coupons found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence>
                      {coupons.map((coupon) => {
                        const start = new Date(coupon.start_date).toLocaleDateString('en-IN')
                        const end = new Date(coupon.end_date).toLocaleDateString('en-IN')
                        const isActive = coupon.status === 'ACTIVE' && new Date(coupon.end_date) >= new Date()

                        return (
                          <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-5 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-bold text-foreground bg-brand-mint/10 text-brand-dark-green px-3 py-1 rounded-md border border-brand-mint/30 inline-block tracking-wider">
                                    {coupon.code}
                                  </h4>
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {isActive ? 'Active' : 'Expired/Inactive'}
                                  </span>
                                  {coupon.new_users_only && (
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1">
                                      <Users className="w-3 h-3" /> New Users Only
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-foreground/80 font-medium">
                                  {coupon.discount_type === 'FLAT' 
                                    ? `₹${coupon.discount_value} OFF` 
                                    : `${coupon.discount_value}% OFF ${coupon.max_discount_amount ? `up to ₹${coupon.max_discount_amount}` : ''}`}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-border/50">
                                  {coupon.min_booking_amount && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <IndianRupee className="w-3.5 h-3.5" />
                                      Min Book: ₹{coupon.min_booking_amount}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {start} - {end}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Tag className="w-3.5 h-3.5" />
                                    Limit: {coupon.usage_limit || '∞'} (User: {coupon.user_usage_limit})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
