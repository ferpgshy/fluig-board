"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { BookOpen, X, FileText, Code2 } from "lucide-react"

type Tab = "usuario" | "tecnica"

const TABS: { id: Tab; label: string; icon: React.ReactNode; file: string }[] = [
  { id: "usuario", label: "Guia do Usuário", icon: <FileText className="w-4 h-4" />, file: "/docs/GUIA_DO_USUARIO.md" },
  { id: "tecnica", label: "Documentação Técnica", icon: <Code2 className="w-4 h-4" />, file: "/docs/DOCUMENTACAO_TECNICA.md" },
]

/* ── Markdown prose styles (injected once) ── */
const PROSE_STYLES = `
.manual-prose { color: var(--foreground); line-height: 1.7; font-size: 0.9rem; }
.manual-prose h1 { font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #0077b6; color: #0099a0; }
.manual-prose h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid #e5e7eb; color: #0099a0; }
.manual-prose h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
.manual-prose h4 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
.manual-prose p { margin: 0.5rem 0; }
.manual-prose a { color: #0077b6; text-decoration: underline; text-underline-offset: 2px; }
.manual-prose a:hover { opacity: 0.8; }
.manual-prose strong { font-weight: 600; }
.manual-prose ul, .manual-prose ol { margin: 0.5rem 0; padding-left: 1.5rem; }
.manual-prose ul { list-style-type: disc; }
.manual-prose ol { list-style-type: decimal; }
.manual-prose li { margin: 0.25rem 0; }
.manual-prose blockquote { margin: 1rem 0; padding: 0.75rem 1rem; border-left: 4px solid #0077b6; background: #f5f5f5; border-radius: 0 0.5rem 0.5rem 0; }
.manual-prose blockquote p { margin: 0; }
.manual-prose code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85em; padding: 0.15rem 0.4rem; border-radius: 0.25rem; background: #f5f5f5; color: #0077b6; }
.manual-prose pre { margin: 1rem 0; padding: 1rem; border-radius: 0.5rem; background: #f5f5f5; overflow-x: auto; border: 1px solid #e5e7eb; }
.manual-prose pre code { padding: 0; background: transparent; color: inherit; font-size: 0.8rem; }
.manual-prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
.manual-prose thead { background: #f5f5f5; }
.manual-prose th { padding: 0.6rem 0.75rem; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
.manual-prose td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
.manual-prose tr:hover { background: rgba(0,0,0,0.02); }
.manual-prose hr { margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb; }
.manual-prose img { max-width: 100%; height: auto; border-radius: 0.5rem; }
`

function ManualPortal({ onClose, activeTab, onTabChange, content, loading }: {
  onClose: () => void
  activeTab: Tab
  onTabChange: (t: Tab) => void
  content: string
  loading: boolean
}) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
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
        background: "white",
        borderLeft: "1px solid #e5e7eb",
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
          borderBottom: "1px solid rgba(255,255,255,0.2)",
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
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#fafafa", flexShrink: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
                background: activeTab === tab.id ? "white" : "transparent",
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
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
              <div style={{
                width: 24, height: 24,
                border: "2px solid #0077b6",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          ) : (
            <article className="manual-prose" style={{ padding: "24px 32px" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>

      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: PROSE_STYLES + "\n@keyframes spin { to { transform: rotate(360deg) } }" }} />
    </div>,
    document.body
  )
}

export function ManualSheet() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("usuario")
  const [content, setContent] = useState<Record<Tab, string>>({ usuario: "", tecnica: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const tab = TABS.find((t) => t.id === activeTab)!
    if (content[activeTab]) return

    setLoading(true)
    fetch(tab.file)
      .then((res) => {
        if (!res.ok) throw new Error("Failed")
        return res.text()
      })
      .then((text) => {
        setContent((prev) => ({ ...prev, [activeTab]: text }))
        setLoading(false)
      })
      .catch(() => {
        setContent((prev) => ({ ...prev, [activeTab]: "Erro ao carregar o documento." }))
        setLoading(false)
      })
  }, [open, activeTab, content])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
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
          onClose={() => setOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          content={content[activeTab]}
          loading={loading}
        />
      )}
    </>
  )
}
