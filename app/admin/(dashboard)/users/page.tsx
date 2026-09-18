"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, User } from '@/services/users'
import { Modal } from '@/components/ui/modal'

import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

import { Pagination } from '@/components/ui/pagination'
import { exportToCsv } from '@/lib/export'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { data: users, isLoading, isError } = useQuery({ queryKey: ['users'], queryFn: usersService.getUsers })


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8
  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      toast.success("Customer deleted successfully")
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while deleting the customer")
    }
  })



  // Derived state for filtering and pagination
  const filteredUsers = React.useMemo(() => {
    if (!users) return []
    return users.filter(user => {
      const nameMatch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const emailMatch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      return nameMatch || emailMatch
    })
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

  // Ensure currentPage is valid for the current filtered list
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages))
  const paginatedUsers = filteredUsers.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE)

  const handleExport = () => {
    const exportData = filteredUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      joined: new Date(u.created_at).toLocaleDateString()
    }));

    exportToCsv(exportData, 'customers_export', [
      { key: 'id', label: 'Customer ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'joined', label: 'Join Date' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground mt-1">Manage platform customers.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 bg-secondary/20 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex gap-2 w-auto relative flex-shrink-0">
            <Button variant="outline" className="flex-none" onClick={handleExport}>Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0 flex flex-col min-h-[400px]">
          <div className="flex-1 w-full overflow-hidden">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading customers...</div>
            ) : isError ? (
              <div className="py-10 text-center text-red-500">Failed to load customers.</div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No customers found"
                description="We couldn't find any customers matching your current search filters. Try adjusting your search term."
                action={<Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>}
              />
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                              onClick={() => {
                                setSelectedUser(user)
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

          {/* Pagination Controls */}
          {!isLoading && !isError && filteredUsers.length > 0 && (
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


      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Customer">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.</p>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              type="button"
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (selectedUser) deleteMutation.mutate(selectedUser.id)
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
