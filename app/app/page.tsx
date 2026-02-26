"use client"

import { useState } from "react"
import { AppShell, type ModuleId } from "@/components/fluig/app-shell"
import { DashboardModule } from "@/components/modules/dashboard"
import { ContasModule } from "@/components/modules/contas"
import { PipelineModule } from "@/components/modules/pipeline"
import { RoteiroModule } from "@/components/modules/roteiro"
import { RelatorioModule } from "@/components/modules/relatorio"
import { useStore } from "@/lib/store"

const MODULES: Record<ModuleId, React.ComponentType> = {
  dashboard: DashboardModule,
  contas: ContasModule,
  pipeline: PipelineModule,
  roteiro: RoteiroModule,
  relatorio: RelatorioModule,
}

function ModuleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="h-4 w-96 bg-muted rounded-lg" />
      <div className="h-px bg-border" />
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 flex-1 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-b-0">
            <div className="h-4 flex-1 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AppPage() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard")
  const initialized = useStore((s) => s.initialized)
  const ActiveComponent = MODULES[activeModule]

  return (
    <AppShell activeModule={activeModule} onModuleChange={setActiveModule}>
      {initialized ? <ActiveComponent /> : <ModuleSkeleton />}
    </AppShell>
  )
}
