"use client"

import { useState, useEffect, useCallback, lazy, Suspense, useTransition } from "react"
import { createPortal } from "react-dom"
import { BookOpen, X, FileText, Code2 } from "lucide-react"

const ManualGuia = lazy(() => import("./manual-guia").then(m => ({ default: m.ManualGuia })))
const ManualTecnica = lazy(() => import("./manual-tecnica").then(m => ({ default: m.ManualTecnica })))

type Tab = "usuario" | "tecnica"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "usuario", label: "Guia do Usuário", icon: <FileText className="w-4 h-4" /> },
  { id: "tecnica", label: "Doc Técnica", icon: <Code2 className="w-4 h-4" /> },
]

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{
        width: 24, height: 24,
        border: "2px solid #0077b6",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "manual-spin 0.8s linear infinite",
      }} />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes manual-spin { to { transform: rotate(360deg) } }" }} />
    </div>
  )
}

function ManualPortal({ onClose, activeTab, onTabChange }: {
  onClose: () => void
  activeTab: Tab
  onTabChange: (t: Tab) => void
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  const [, startTransition] = useTransition()

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "relative",
        marginLeft: "auto",
        width: "100%",
        maxWidth: "56rem",
        height: "100%",
        background: "var(--background, #fff)",
        borderLeft: "1px solid var(--border, #e5e7eb)",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "linear-gradient(135deg, #0077b6 0%, #00a8a8 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
            <BookOpen style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: "1.125rem", fontWeight: 600 }}>Manual</span>
          </div>
          <button
            onClick={onClose}
            style={{ color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Fechar"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border, #e5e7eb)", background: "var(--muted, #fafafa)", flexShrink: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => startTransition(() => onTabChange(tab.id))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                fontSize: "0.875rem",
                fontWeight: 500,
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #0077b6" : "2px solid transparent",
                color: activeTab === tab.id ? "#0077b6" : "#6b7280",
                background: activeTab === tab.id ? "var(--background, #fff)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <Suspense fallback={<Spinner />}>
            {activeTab === "usuario" ? <ManualGuia /> : <ManualTecnica />}
          </Suspense>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ManualSheet() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("usuario")

  const handleClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Manual"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Manual</span>
      </button>

      {open && (
        <ManualPortal
          onClose={handleClose}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </>
  )
}
