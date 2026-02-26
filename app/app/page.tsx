"use client"

import { useState, useEffect, useCallback } from "react"
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

const VALID_MODULES: ModuleId[] = ["dashboard", "contas", "pipeline", "roteiro", "relatorio"]
const STORAGE_KEY = "fluig-active-module"

function getInitialModule(): ModuleId {
  if (typeof window === "undefined") return "dashboard"

  // 1. Tenta ler do hash da URL (#contas, #pipeline, etc.)
  const hash = window.location.hash.replace("#", "") as ModuleId
  if (hash && VALID_MODULES.includes(hash)) return hash

  // 2. Tenta ler do localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ModuleId | null
    if (stored && VALID_MODULES.includes(stored)) return stored
  } catch {
    // localStorage indisponível
  }

  return "dashboard"
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
  const [activeModule, setActiveModule] = useState<ModuleId>(getInitialModule)
  const initialized = useStore((s) => s.initialized)
  const ActiveComponent = MODULES[activeModule]

  // Persistir módulo ativo no localStorage e hash da URL
  const handleModuleChange = useCallback((id: ModuleId) => {
    setActiveModule(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch { /* ignore */ }
    window.history.replaceState(null, "", `#${id}`)
  }, [])

  // Sincronizar hash → módulo quando o usuário navega com back/forward
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "") as ModuleId
      if (hash && VALID_MODULES.includes(hash)) {
        setActiveModule(hash)
        try { localStorage.setItem(STORAGE_KEY, hash) } catch { /* ignore */ }
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Na montagem, garantir que o hash reflita o módulo ativo
  useEffect(() => {
    const current = window.location.hash.replace("#", "")
    if (current !== activeModule) {
      window.history.replaceState(null, "", `#${activeModule}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell activeModule={activeModule} onModuleChange={handleModuleChange}>
      {initialized ? <ActiveComponent /> : <ModuleSkeleton />}
    </AppShell>
  )
}
