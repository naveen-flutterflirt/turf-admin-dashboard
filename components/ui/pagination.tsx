import React from 'react'
import { Button } from './button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
  onItemsPerPageChange?: (items: number) => void
  itemsPerPageOptions?: number[]
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, onItemsPerPageChange, itemsPerPageOptions = [10, 20, 50] }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    
    // Always show first page
    pages.push(1)
    
    // Logic for showing dots and middle pages
    if (currentPage > 3) {
      pages.push('...')
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    // Logic for showing dots before last page
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page if > 1
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t border-border w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
        {totalItems !== undefined && itemsPerPage !== undefined && (
          <div>
            Showing <span className="font-medium text-foreground">{totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-foreground">{totalItems}</span> results
          </div>
        )}
        {totalItems === undefined && (
          <div>
            Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
          </div>
        )}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap hidden sm:inline">Rows per page:</span>
            <select
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map(opt => (
                <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageNumbers().map((page, i) => (
          page === '...' ? (
            <Button key={`dots-${i}`} variant="ghost" size="icon" className="h-8 w-8 disabled:opacity-100" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="icon"
              className={`h-8 w-8 ${currentPage === page ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}

        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
