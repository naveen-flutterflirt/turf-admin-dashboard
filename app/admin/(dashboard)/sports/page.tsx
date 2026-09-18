"use client"
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { sportsService, SportStat } from '@/services/sports'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Activity } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export default function SportsPage() {
  const { data: sports, isLoading, isError } = useQuery({ queryKey: ['sports-stats'], queryFn: sportsService.getSports })
  
  // State for viewing all turfs of a sport in a modal
  const [selectedSport, setSelectedSport] = useState<SportStat | null>(null)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark-green dark:text-white">Sports Analytics</h2>
          <p className="text-muted-foreground mt-1">View statistics for supported sports and their associated turfs.</p>
        </div>
      </div>
      <Card className="border-border overflow-hidden shadow-lg bg-card max-w-5xl">
        <CardContent className="p-0 flex flex-col min-h-[400px]">
          {isLoading ? (
            <div className="py-20 flex flex-col justify-center items-center text-brand-mint">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-brand-mint border-t-transparent rounded-full mb-4" />
              <span className="font-medium">Fetching Sports Stats...</span>
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-red-500 font-medium bg-red-500/5 m-4 rounded-xl border border-red-500/20">Failed to load sports statistics. Please try again later.</div>
          ) : !sports || sports.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Activity className="w-16 h-16 text-muted mb-4" />
              <p className="text-xl font-semibold text-foreground">No Sports Found</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead className="w-[200px]">Sport Name</TableHead>
                      <TableHead className="w-[150px]">Total Turfs</TableHead>
                      <TableHead>Associated Turfs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {sports.map((sport, idx) => (
                        <TableRow key={idx} className="hover:bg-black/5 dark:hover:bg-white/10 transition-colors group cursor-default">
                          <TableCell className="align-top pt-5">
                            <div className="font-bold text-foreground text-lg">{sport.sport_name}</div>
                          </TableCell>
                          <TableCell className="align-top pt-5">
                            <span className="px-3 py-1 bg-brand-mint/10 text-brand-mint border border-brand-mint/20 rounded-full text-sm font-bold shadow-sm">
                              {sport.turf_count} Turfs
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex gap-2 flex-wrap items-center">
                              {sport.turfs.length > 0 ? (
                                <>
                                  {sport.turfs.slice(0, 3).map(turf => (
                                    <span key={turf.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-muted border border-border text-foreground text-xs font-medium rounded-md shadow-sm">
                                      <MapPin className="w-3 h-3 text-brand-mint" />
                                      {turf.name}
                                    </span>
                                  ))}
                                  {sport.turfs.length > 3 && (
                                    <button 
                                      onClick={() => setSelectedSport(sport)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean text-xs font-bold rounded-md shadow-sm cursor-pointer transition-colors"
                                    >
                                      +{sport.turfs.length - 3} More
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground italic py-1.5">No turfs for this sport yet.</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-4 p-4">
                <AnimatePresence mode="popLayout">
                  {sports.map((sport, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm p-5 space-y-4"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <h3 className="font-bold text-xl text-foreground">{sport.sport_name}</h3>
                        <span className="px-3 py-1 bg-brand-mint/10 text-brand-mint border border-brand-mint/20 rounded-full text-sm font-bold shadow-sm">
                          {sport.turf_count} Turfs
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Associated Turfs</p>
                        <div className="flex gap-2 flex-wrap items-center">
                          {sport.turfs.length > 0 ? (
                            <>
                              {sport.turfs.slice(0, 3).map(turf => (
                                <span key={turf.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-muted border border-border text-foreground text-xs font-medium rounded-md shadow-sm">
                                  <MapPin className="w-3 h-3 text-brand-mint" />
                                  {turf.name}
                                </span>
                              ))}
                              {sport.turfs.length > 3 && (
                                <button 
                                  onClick={() => setSelectedSport(sport)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-mint text-brand-dark-green hover:bg-brand-caribbean text-xs font-bold rounded-md shadow-sm cursor-pointer transition-colors"
                                >
                                  +{sport.turfs.length - 3} More
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground italic py-1.5">No turfs found.</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for viewing all turfs */}
      <Modal 
        isOpen={!!selectedSport} 
        onClose={() => setSelectedSport(null)} 
        title={`${selectedSport?.sport_name} Turfs`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-muted-foreground mb-4">
            Showing all {selectedSport?.turf_count} turfs that support {selectedSport?.sport_name}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedSport?.turfs.map(turf => (
              <div key={turf.id} className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg shadow-sm hover:bg-muted transition-colors">
                <MapPin className="w-4 h-4 text-brand-mint shrink-0" />
                <span className="text-sm font-medium text-foreground">{turf.name}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-end">
            <Button variant="outline" onClick={() => setSelectedSport(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
