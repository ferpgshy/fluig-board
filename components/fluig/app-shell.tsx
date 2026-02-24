"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import {
  Building2,
  LayoutDashboard,
  KanbanSquare,
  ClipboardList,
  FileText,
  Menu,
  X,
  LogOut,
  Shield,
  User,
  ChevronDown,
  Orbit,
} from "lucide-react"

export type ModuleId = "dashboard" | "contas" | "pipeline" | "roteiro" | "relatorio"

const NAV_ITEMS: { id: ModuleId; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "contas", label: "Contas", icon: <Building2 className="w-5 h-5" /> },
  { id: "pipeline", label: "Pipeline", icon: <KanbanSquare className="w-5 h-5" /> },
  { id: "roteiro", label: "Roteiro", icon: <ClipboardList className="w-5 h-5" /> },
  { id: "relatorio", label: "Relatorios", icon: <FileText className="w-5 h-5" /> },
]

interface AppShellProps {
  activeModule: ModuleId
  onModuleChange: (id: ModuleId) => void
  children: ReactNode
}

interface UserProfile {
  nome: string
  email: string
  role: string
}

export function AppShell({ activeModule, onModuleChange, children }: AppShellProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const seedDemoData = useStore((s) => s.seedDemoData)

  useEffect(() => {
    seedDemoData()
  }, [seedDemoData])

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
        }
      } catch {
        // silently fail
      }
    }
    loadProfile()
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile?.nome
    ? profile.nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — mesmo estilo da landing page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Abrir menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b6]">
                  <Orbit className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">Fluig Board</span>
              </Link>
            </div>

            {/* Nav modulos (desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === item.id
                      ? "bg-[#0077b6]/10 text-[#0077b6]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--fluig-primary)" }}
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                  {profile?.nome || "Carregando..."}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{profile?.nome || "Carregando..."}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
                    {profile?.role === "admin" && (
                      <span
                        className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: "rgba(0,119,182,0.1)", color: "var(--fluig-primary)" }}
                      >
                        <Shield className="w-3 h-3" />
                        Administrador
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    {profile?.role === "admin" && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/admin") }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        Painel Admin
                      </button>
                    )}
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push("/perfil") }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Meu Perfil
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para o header fixo */}
      <div className="h-16" />

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
