"use client"

import type { ReactNode } from "react"

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  description?: string
}

export function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-fluig-primary">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-fluig-title">{title}</h2>
      </div>
      <div className="h-px bg-border mb-2" />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
