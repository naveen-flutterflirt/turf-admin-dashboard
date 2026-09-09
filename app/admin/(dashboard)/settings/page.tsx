"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage global platform configurations.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="border-brand-pistachio/50">
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Update commission rates, tax percentages, and contact emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Commission (%)</label>
                <Input defaultValue="10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Tax Rate (%)</label>
                <Input defaultValue="18" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Support Email</label>
                <Input defaultValue="support@turfapp.com" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button>Save Configuration</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-pistachio/50">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400">Maintenance Mode</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Suspend all customer bookings across the platform.</p>
              </div>
              <Button variant="danger">Enable Maintenance</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
