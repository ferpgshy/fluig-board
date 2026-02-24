import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const body = await request.json()

  // Verificar se ja existe rascunho para esta visita
  if (body.visit_id) {
    const { data: existing } = await supabase
      .from("reports")
      .select("id")
      .eq("visit_id", body.visit_id)
      .neq("status", "Enviado")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Ja existe um rascunho para esta visita.", id: existing.id }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({ ...body, user_id: user.id, status: "Rascunho" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ report: data })
}
