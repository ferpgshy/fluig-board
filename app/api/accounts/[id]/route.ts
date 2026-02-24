import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calcScoreTotal, calcTier, calcOnda } from "@/lib/models"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const scoreFields = ["score_potencial", "score_maturidade", "score_dor", "score_risco_churn", "score_acesso"]
  const hasScoreChange = scoreFields.some((f) => f in body)

  let updates = { ...body }
  if (hasScoreChange) {
    // Need existing data to compute total
    const { data: existing } = await supabase.from("accounts").select("*").eq("id", id).single()
    if (existing) {
      const merged = { ...existing, ...body }
      const score_total = calcScoreTotal(merged)
      const tier = calcTier(score_total)
      const onda = calcOnda(tier)
      updates = { ...updates, score_total, tier, onda }
    }
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
