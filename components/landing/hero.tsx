"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Users, Target, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ background: "linear-gradient(135deg, #0077b6 0%, #00a8a8 100%)" }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full border border-white/30" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full border border-white/20" />
        <div className="absolute top-40 right-1/3 w-48 h-48 rounded-full border border-white/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left - Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white mb-8 backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Plataforma de Governanca Comercial
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance mb-6">
              {"Gestao Estrategica de Contas com Inteligencia e Governanca"}
            </h1>

            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-xl mb-10 text-pretty">
              Score automatico de contas, Tier inteligente recalculado em tempo real e pipeline estruturado com transicao linear. Controle total da sua operacao comercial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold bg-white text-[#0077b6] hover:bg-white/90 transition-colors shadow-lg"
              >
                Solicitar Demonstracao
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white border-2 border-white/40 hover:bg-white/10 transition-colors"
              >
                Ver Funcionalidades
              </a>
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="flex-1 w-full max-w-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#f44336]" />
                <div className="w-3 h-3 rounded-full bg-[#ffc107]" />
                <div className="w-3 h-3 rounded-full bg-[#4caf50]" />
                <span className="ml-2 text-xs text-white/50 font-mono">Fluig Board Dashboard</span>
              </div>

              {/* Mock KPI Row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "MRR Pipeline", value: "R$ 48.5k", icon: TrendingUp, change: "+12%" },
                  { label: "Contas Ativas", value: "127", icon: Users, change: "+8" },
                  { label: "Taxa Conversao", value: "34%", icon: Target, change: "+5pp" },
                  { label: "Score Medio", value: "18.4", icon: BarChart3, change: "Tier A" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <kpi.icon className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-[10px] text-white/60 uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <div className="text-xl font-bold text-white">{kpi.value}</div>
                    <div className="text-[10px] text-[#4caf50] font-medium">{kpi.change}</div>
                  </div>
                ))}
              </div>

              {/* Mock Chart */}
              <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                <div className="text-xs text-white/60 mb-3">Funil de Pipeline</div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Selecionado", w: "100%", count: 45 },
                    { label: "Contato", w: "78%", count: 35 },
                    { label: "Visita Agendada", w: "56%", count: 25 },
                    { label: "Diagnostico", w: "38%", count: 17 },
                    { label: "Proposta", w: "24%", count: 11 },
                    { label: "Works Fechado", w: "16%", count: 7 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-[10px] text-white/60 w-24 text-right shrink-0">{s.label}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-white/40 to-white/20 flex items-center justify-end pr-2"
                          style={{ width: s.w }}
                        >
                          <span className="text-[9px] text-white font-medium">{s.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
