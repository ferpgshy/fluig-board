import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calcScoreTotal, calcTier, calcOnda } from "@/lib/models"

const DATE_FIELDS = ["data_registro", "data_ultimo_contato", "data_proxima_visita"]

function sanitizeDates<T extends Record<string, unknown>>(obj: T): T {
  const copy = { ...obj }
  for (const key of DATE_FIELDS) {
    if (key in copy && copy[key] === "") (copy as Record<string, unknown>)[key] = null
  }
  return copy
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("score_total", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accounts: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const body = await request.json()
  const score_total = calcScoreTotal(body)
  const tier = calcTier(score_total)
  const onda = calcOnda(tier)

  const { data, error } = await supabase
    .from("accounts")
    .insert(sanitizeDates({ ...body, user_id: user.id, score_total, tier, onda }))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}
