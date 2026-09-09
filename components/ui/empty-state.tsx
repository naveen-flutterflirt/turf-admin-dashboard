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
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-border/50 rounded-xl bg-muted/10 m-4">
      <div className="w-12 h-12 rounded-full bg-brand-pistachio/20 flex items-center justify-center mb-4 border border-brand-pistachio/30 shadow-sm">
        <Icon className="w-6 h-6 text-brand-dark-green dark:text-brand-pistachio" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
