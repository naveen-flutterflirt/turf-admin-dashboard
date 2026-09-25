"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Eye, Landmark, User, Hash, CreditCard, Building2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ownersService, Owner } from '@/services/owners'
import { Pagination } from '@/components/ui/pagination'
import { AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

export default function OwnersPage() {
  const queryClient = useQueryClient()
  const { data: owners, isLoading, isError } = useQuery({ queryKey: ['owners'], queryFn: ownersService.getOwners })

  // Search, Pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  
  const deleteMutation = useMutation({
    mutationFn: ownersService.deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      setIsDeleteModalOpen(false)
      setSelectedOwner(null)
    }
  })

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const { data: accountDetails, isLoading: isDetailsLoading, isError: isDetailsError } = useQuery({
    queryKey: ['owner-account', selectedOwner?.owner_id || (selectedOwner as any)?._id],
    queryFn: () => selectedOwner ? ownersService.getAccountDetails(selectedOwner.owner_id || (selectedOwner as any)._id) : Promise.reject('No owner'),
    enabled: !!selectedOwner && isDetailsModalOpen
  })

  // Derived state for filtering and pagination
  const filteredOwners = React.useMemo(() => {
    if (!owners) return []
    return owners.filter(owner => {
      const search = (searchTerm || '').toLowerCase()
      const matchesSearch = (owner.name || '').toLowerCase().includes(search) || 
                            (owner.business_name || '').toLowerCase().includes(search) ||
                            (owner.email || '').toLowerCase().includes(search)
      return matchesSearch
    })
  }, [owners, searchTerm])

  const totalPages = Math.ceil(filteredOwners.length / ITEMS_PER_PAGE)
  const paginatedOwners = filteredOwners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Turf Owners</h2>
          <p className="text-muted-foreground mt-1">Manage turf owners and their businesses.</p>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search owners, emails or businesses..." 
              className="pl-9 bg-secondary/20" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 flex flex-col min-h-[400px]">
          <div className="flex-1 w-full overflow-hidden">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading owners...</div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">Failed to load owners. Please ensure you are logged in.</div>
            ) : filteredOwners.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No owners found matching your search.</div>
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner Name</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Turfs</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedOwners.map((owner, index) => (
                        <TableRow key={owner.owner_id || (owner as any)._id || index}>
                          <TableCell>
                            <div className="font-medium text-primary">{owner.name || 'Unknown'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{owner.business_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{owner.email}</div>
                            <div className="text-sm text-muted-foreground">{owner.phone || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground">{owner.turf_count}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {owner.owner_created_at || (owner as any).created_at ? new Date(owner.owner_created_at || (owner as any).created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-brand-mint hover:bg-brand-mint/10 hover:text-brand-mint border-brand-mint/20"
                                onClick={() => {
                                  setSelectedOwner(owner)
                                  setIsDetailsModalOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1.5" /> View Bank Details
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-red-500/20"
                                onClick={() => {
                                  setSelectedOwner(owner)
                                  setIsDeleteModalOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {!isLoading && !isError && filteredOwners.length > 0 && (
            <div className="mt-auto">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Owner">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{selectedOwner?.name}</strong>? This action cannot be undone.</p>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (selectedOwner) deleteMutation.mutate(selectedOwner.owner_id || (selectedOwner as any)._id)
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Account Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Bank Details">
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border border-border flex items-start gap-4">
            <div className="p-3 bg-brand-mint/10 rounded-full text-brand-mint">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{selectedOwner?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedOwner?.business_name}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {isDetailsLoading ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-brand-mint border-t-transparent rounded-full animate-spin" />
                Fetching bank details...
              </div>
            ) : isDetailsError ? (
              <div className="py-8 text-center text-red-500 bg-red-500/5 rounded-xl border border-red-500/20">
                Failed to load account details. They might not be configured yet.
              </div>
            ) : accountDetails ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Bank Name</span>
                  </div>
                  <span className="font-semibold text-foreground">{accountDetails.bank_name}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Account Name</span>
                  </div>
                  <span className="font-semibold text-foreground">{accountDetails.account_name}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">Account Number</span>
                  </div>
                  <span className="font-semibold text-foreground tracking-widest">{accountDetails.account_number}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium">IFSC Code</span>
                  </div>
                  <span className="font-semibold text-foreground uppercase">{accountDetails.ifsc_code}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
