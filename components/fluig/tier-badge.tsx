"use client"

import type { Tier } from "@/lib/models"

const tierConfig: Record<Tier, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-fluig-primary", text: "text-primary-foreground", label: "Tier A" },
  B: { bg: "bg-amber-500", text: "text-primary-foreground", label: "Tier B" },
  C: { bg: "bg-gray-400", text: "text-primary-foreground", label: "Tier C" },
}

export function TierBadge({ tier }: { tier: Tier }) {
  const config = tierConfig[tier]
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}
