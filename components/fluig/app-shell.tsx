"use client"

import { useState, type ReactNode, useEffect } from "react"
import { useStore } from "@/lib/store"
import {
  Building2,
  LayoutDashboard,
  KanbanSquare,
  ClipboardList,
  FileText,
  Menu,
  X,
} from "lucide-react"

export type ModuleId = "dashboard" | "contas" | "pipeline" | "roteiro" | "relatorio"

const NAV_ITEMS: { id: ModuleId; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "contas", label: "Contas", icon: <Building2 className="w-5 h-5" /> },
  { id: "pipeline", label: "Pipeline", icon: <KanbanSquare className="w-5 h-5" /> },
  { id: "roteiro", label: "Roteiro", icon: <ClipboardList className="w-5 h-5" /> },
  { id: "relatorio", label: "Relatórios", icon: <FileText className="w-5 h-5" /> },
]

interface AppShellProps {
  activeModule: ModuleId
  onModuleChange: (id: ModuleId) => void
  children: ReactNode
}

export function AppShell({ activeModule, onModuleChange, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const seedDemoData = useStore((s) => s.seedDemoData)

  useEffect(() => {
    seedDemoData()
  }, [seedDemoData])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="text-primary-foreground px-6 py-5 rounded-b-[20px]"
        style={{
          background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)",
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Fluig CRM</h1>
              <p className="text-sm opacity-80">Gestão Comercial Inteligente</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeModule === item.id
                    ? "bg-white/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-b border-border bg-card p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onModuleChange(item.id)
                setMobileOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeModule === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 lg:px-6">
        {children}
      </main>
    </div>
  )
}
