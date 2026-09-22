"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2 } from 'lucide-react'
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

  // Derived state for filtering and pagination
  const filteredOwners = React.useMemo(() => {
    if (!owners) return []
    return owners.filter(owner => {
      const matchesSearch = owner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            owner.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            owner.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                      {paginatedOwners.map((owner) => (
                        <TableRow key={owner.owner_id}>
                          <TableCell>
                            <div className="font-medium text-primary">{owner.name}</div>
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
                            {new Date(owner.owner_created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              onClick={() => {
                                setSelectedOwner(owner)
                                setIsDeleteModalOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                if (selectedOwner) deleteMutation.mutate(selectedOwner.owner_id)
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
