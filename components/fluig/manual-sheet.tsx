"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { BookOpen, X, FileText, Code2 } from "lucide-react"

type Tab = "usuario" | "tecnica"

const TABS: { id: Tab; label: string; icon: React.ReactNode; file: string }[] = [
  { id: "usuario", label: "Guia do Usuário", icon: <FileText className="w-4 h-4" />, file: "/docs/GUIA_DO_USUARIO.md" },
  { id: "tecnica", label: "Documentação Técnica", icon: <Code2 className="w-4 h-4" />, file: "/docs/DOCUMENTACAO_TECNICA.md" },
]

export function ManualSheet() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("usuario")
  const [content, setContent] = useState<Record<Tab, string>>({ usuario: "", tecnica: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const tab = TABS.find((t) => t.id === activeTab)!
    if (content[activeTab]) return // already loaded

    setLoading(true)
    fetch(tab.file)
      .then((res) => res.text())
      .then((text) => {
        setContent((prev) => ({ ...prev, [activeTab]: text }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open, activeTab, content])

  // Lock body scroll when open
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Manual"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Manual</span>
      </button>

      {/* Full-screen sheet */}
      {open && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-4xl h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-border/50"
              style={{ background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)" }}
            >
              <div className="flex items-center gap-3 text-white">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Manual</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-[var(--fluig-primary)] text-[var(--fluig-primary)] bg-card"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-6 h-6 border-2 border-[var(--fluig-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <article className="manual-prose px-8 py-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content[activeTab]}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scoped styles for markdown rendering */}
      <style jsx global>{`
        .manual-prose {
          color: var(--foreground);
          line-height: 1.7;
          font-size: 0.9rem;
        }
        .manual-prose h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--fluig-primary);
          color: var(--fluig-title);
        }
        .manual-prose h2 {
          font-size: 1.35rem;
          font-weight: 700;
          margin: 2rem 0 0.75rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid hsl(var(--border));
          color: var(--fluig-title);
        }
        .manual-prose h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 1.5rem 0 0.5rem;
          color: var(--foreground);
        }
        .manual-prose h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: var(--foreground);
        }
        .manual-prose p {
          margin: 0.5rem 0;
        }
        .manual-prose a {
          color: var(--fluig-primary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .manual-prose a:hover {
          opacity: 0.8;
        }
        .manual-prose strong {
          font-weight: 600;
          color: var(--foreground);
        }
        .manual-prose ul, .manual-prose ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .manual-prose ul { list-style-type: disc; }
        .manual-prose ol { list-style-type: decimal; }
        .manual-prose li {
          margin: 0.25rem 0;
        }
        .manual-prose blockquote {
          margin: 1rem 0;
          padding: 0.75rem 1rem;
          border-left: 4px solid var(--fluig-primary);
          background: hsl(var(--muted));
          border-radius: 0 0.5rem 0.5rem 0;
          color: var(--muted-foreground);
        }
        .manual-prose blockquote p {
          margin: 0;
        }
        .manual-prose code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.85em;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          background: hsl(var(--muted));
          color: var(--fluig-primary);
        }
        .manual-prose pre {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          background: hsl(var(--muted));
          overflow-x: auto;
          border: 1px solid hsl(var(--border));
        }
        .manual-prose pre code {
          padding: 0;
          background: transparent;
          color: var(--foreground);
          font-size: 0.8rem;
        }
        .manual-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.85rem;
        }
        .manual-prose thead {
          background: hsl(var(--muted));
        }
        .manual-prose th {
          padding: 0.6rem 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid hsl(var(--border));
          color: var(--foreground);
        }
        .manual-prose td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid hsl(var(--border));
          vertical-align: top;
        }
        .manual-prose tr:hover {
          background: hsl(var(--muted) / 0.5);
        }
        .manual-prose hr {
          margin: 2rem 0;
          border: none;
          border-top: 1px solid hsl(var(--border));
        }
        .manual-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        /* Hide HTML alignment paragraphs from markdown */
        .manual-prose p:has(img) {
          text-align: center;
        }
      `}</style>
    </>
  )
}
