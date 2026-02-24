import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ReportStatus } from "@/lib/models"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Se for advance, calcular próximo status
  if (body.advance) {
    const { data: current } = await supabase.from("reports").select("status").eq("id", id).single()
    const flow: Record<ReportStatus, ReportStatus | null> = {
      Rascunho: "Revisão",
      "Revisão": "Enviado",
      Enviado: null,
    }
    const next = current ? flow[current.status as ReportStatus] : null
    if (!next) return NextResponse.json({ error: "Status nao pode avancar." }, { status: 400 })
    const { data, error } = await supabase
      .from("reports").update({ status: next }).eq("id", id).eq("user_id", user.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ report: data })
  }

  const { data, error } = await supabase
    .from("reports")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ report: data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from("reports").delete().eq("id", id).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
