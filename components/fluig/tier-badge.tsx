"use client"

import type { Tier } from "@/lib/models"

const tierConfig: Record<Tier, { bg: string; text: string }> = {
  A: { bg: "bg-fluig-primary", text: "text-primary-foreground" },
  B: { bg: "bg-fluig-secondary", text: "text-secondary-foreground" },
  C: { bg: "bg-muted-foreground", text: "text-primary-foreground" },
}

export function TierBadge({ tier }: { tier: Tier }) {
  const config = tierConfig[tier]
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
    >
      Tier {tier}
    </span>
  )
}
