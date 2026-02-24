"use client"

import { useState } from "react"

const ADMINS = [
  { email: "fernando.garcia2505@hotmail.com", nome: "Fernando Garcia", empresa: "Fluig Board" },
  { email: "marcio.souto@fluig.com", nome: "Marcio Souto", empresa: "Fluig Board" },
]

export default function SeedPage() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSeed() {
    setLoading(true)
    const out: Record<string, string> = {}
    for (const admin of ADMINS) {
      try {
        const res = await fetch("/api/admin/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(admin),
        })
        const data = await res.json()
        out[admin.email] = res.ok ? `OK — senha: ${data.senha_temp}` : `ERRO: ${data.error}`
      } catch (e) {
        out[admin.email] = `ERRO: ${e}`
      }
    }
    setResults(out)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-8">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Seed Admins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cria os dois usuarios admin via GoTrue Admin API. Se ja existirem, atualiza o role.
          </p>
        </div>
        <div className="space-y-1.5">
          {ADMINS.map((a) => (
            <p key={a.email} className="text-sm text-muted-foreground font-mono">{a.email}</p>
          ))}
        </div>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "#0077b6" }}
        >
          {loading ? "Criando..." : "Criar / Atualizar Admins"}
        </button>
        {Object.keys(results).length > 0 && (
          <div className="space-y-2">
            {Object.entries(results).map(([email, msg]) => (
              <div key={email} className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs font-medium text-foreground">{email}</p>
                <p className={`text-xs mt-0.5 font-mono ${msg.startsWith("OK") ? "text-green-600" : "text-destructive"}`}>
                  {msg}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
