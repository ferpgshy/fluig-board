"use client"

import { useState } from "react"
import Link from "next/link"
import { Orbit, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Produto", href: "#produto" },
  { label: "Como Funciona", href: "#como-funciona" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b6]">
              <Orbit className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Fluig Board</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-[#0077b6] text-white hover:bg-[#0077b6]/90 transition-colors"
            >
              Solicitar Acesso
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="block w-full text-center rounded-lg px-5 py-2.5 text-sm font-medium text-foreground border border-border hover:bg-muted transition-colors mt-3"
              onClick={() => setMobileOpen(false)}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="block w-full text-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-[#0077b6] text-white hover:bg-[#0077b6]/90 transition-colors mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Solicitar Acesso
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
