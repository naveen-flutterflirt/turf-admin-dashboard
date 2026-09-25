"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService, AppSettings } from '@/services/settings'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, Smartphone, ShieldAlert } from 'lucide-react'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['app-settings'],
    queryFn: settingsService.getSettings
  })

  const { register, handleSubmit, reset, watch, setValue } = useForm<AppSettings>()

  // Sync fetched data with form
  useEffect(() => {
    if (settings) {
      reset(settings)
    }
  }, [settings, reset])

  const forceUpdate = watch('force_update')
  const normalUpdate = watch('normal_update')

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['app-settings'], updatedSettings)
      toast.success("App settings updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update app settings")
    }
  })

  const onSubmit = (data: AppSettings) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-mint animate-spin" />
      </div>
    )
  }

  if (isError && !settings) {
    return (
      <div className="text-center text-red-500 py-10 bg-red-500/5 rounded-xl border border-red-500/20 max-w-4xl">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-semibold">Failed to load app settings</h3>
        <p className="text-sm opacity-80 mt-1">Please check your connection and try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">App Settings</h2>
          <p className="text-muted-foreground mt-1">Manage mobile application versions and update requirements.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-brand-mint to-brand-caribbean" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-mint" /> 
                Mobile App Configuration
              </CardTitle>
              <CardDescription>Control version updates and store links for iOS and Android.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">Latest Android Version</label>
                  <Input 
                    placeholder="e.g. 1.0.6" 
                    className="bg-secondary/30 focus:bg-secondary/50 transition-colors font-mono"
                    {...register('latest_android_version', { required: true })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">Latest iOS Version</label>
                  <Input 
                    placeholder="e.g. 1.0.6" 
                    className="bg-secondary/30 focus:bg-secondary/50 transition-colors font-mono"
                    {...register('latest_ios_version', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">Play Store URL</label>
                  <Input 
                    type="url"
                    placeholder="https://play.google.com/store/apps/..." 
                    className="bg-secondary/30 focus:bg-secondary/50 transition-colors"
                    {...register('play_store_url', { required: true })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">App Store URL</label>
                  <Input 
                    type="url"
                    placeholder="https://apps.apple.com/..." 
                    className="bg-secondary/30 focus:bg-secondary/50 transition-colors"
                    {...register('app_store_url', { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Update Message</label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  placeholder="Critical bug fixes! You must update."
                  {...register('update_message', { required: true })}
                />
                <p className="text-xs text-muted-foreground">This message will be displayed to users in the app when an update is available.</p>
              </div>

              {/* Toggles section */}
              <div className="bg-secondary/10 p-5 rounded-xl border border-border flex flex-col sm:flex-row gap-6 justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Force Update</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Forces all users to download the latest version before they can continue using the app.
                  </p>
                </div>
                <div className="flex items-center">
                  <Button 
                    type="button"
                    variant={forceUpdate ? "default" : "outline"}
                    onClick={() => {
                      setValue('force_update', !forceUpdate, { shouldDirty: true })
                      if (!forceUpdate) setValue('normal_update', false, { shouldDirty: true })
                    }}
                    className={forceUpdate ? "bg-red-500 hover:bg-red-600 text-white min-w-[120px]" : "min-w-[120px]"}
                  >
                    {forceUpdate ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <div className="bg-secondary/10 p-5 rounded-xl border border-border flex flex-col sm:flex-row gap-6 justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Normal Update</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Suggests users to update the app, but allows them to skip and continue using it.
                  </p>
                </div>
                <div className="flex items-center">
                  <Button 
                    type="button"
                    variant={normalUpdate ? "default" : "outline"}
                    onClick={() => {
                      setValue('normal_update', !normalUpdate, { shouldDirty: true })
                      if (!normalUpdate) setValue('force_update', false, { shouldDirty: true })
                    }}
                    className={normalUpdate ? "bg-brand-mint text-brand-dark-green min-w-[120px]" : "min-w-[120px]"}
                  >
                    {normalUpdate ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-brand-mint text-brand-dark-green hover:bg-brand-mint/90 font-semibold shadow-md shadow-brand-mint/20"
                >
                  {updateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Configuration</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  )
}
