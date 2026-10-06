import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center min-h-[350px] border border-border/40 rounded-2xl bg-card/20 backdrop-blur-md shadow-sm transition-all hover:bg-card/30 m-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-caribbean/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative w-16 h-16 rounded-full bg-brand-caribbean/10 flex items-center justify-center mb-5 border border-brand-caribbean/20 shadow-[0_0_15px_rgba(45,212,191,0.15)] group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-8 h-8 text-brand-caribbean" />
      </div>
      <h3 className="relative text-xl font-bold text-foreground mb-2 tracking-tight">{title}</h3>
      <p className="relative text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
      {action && <div className="relative z-10">{action}</div>}
    </div>
  )
}
