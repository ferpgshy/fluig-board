"use client"

import { useState } from "react"

export default function SeedPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleSeed() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Erro")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-foreground">Seed Admin</h1>
        <p className="text-sm text-muted-foreground">
          Clique para criar o usuario admin fernando.garcia2505@hotmail.com
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--fluig-primary)" }}
        >
          {loading ? "Criando..." : "Criar Admin"}
        </button>
        {result && (
          <pre className="p-4 rounded-lg bg-muted text-xs overflow-auto whitespace-pre-wrap text-foreground">
            {result}
          </pre>
        )}
      </div>
    </div>
  )
}
