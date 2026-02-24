"use client"

import { useState } from "react"
import { AppShell, type ModuleId } from "@/components/fluig/app-shell"
import { DashboardModule } from "@/components/modules/dashboard"
import { ContasModule } from "@/components/modules/contas"
import { PipelineModule } from "@/components/modules/pipeline"
import { RoteiroModule } from "@/components/modules/roteiro"
import { RelatorioModule } from "@/components/modules/relatorio"

const MODULES: Record<ModuleId, React.ComponentType> = {
  dashboard: DashboardModule,
  contas: ContasModule,
  pipeline: PipelineModule,
  roteiro: RoteiroModule,
  relatorio: RelatorioModule,
}

export default function AppPage() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard")
  const ActiveComponent = MODULES[activeModule]

  return (
    <AppShell activeModule={activeModule} onModuleChange={setActiveModule}>
      <ActiveComponent />
    </AppShell>
  )
}
