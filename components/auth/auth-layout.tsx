"use client"

import Link from "next/link"
import { Orbit } from "lucide-react"

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-10"
        style={{
          background: "linear-gradient(135deg, var(--fluig-primary) 0%, #005f8f 50%, var(--fluig-secondary) 100%)",
        }}
      >
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Fluig Board</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight text-balance">
            Transforme visitas comerciais em receita recorrente.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Pipeline visual, assessment consultivo, relatorios automatizados e dashboard com KPIs em tempo real.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Modulos</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Integrado</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">RT</p>
              <p className="text-xs text-white/60 uppercase tracking-wider">Tempo Real</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Fluig Board. Todos os direitos reservados.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ backgroundColor: "var(--fluig-primary)" }}
            >
              <Orbit className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Fluig Board</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
