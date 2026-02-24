import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function GET() {
  const supabase = createClient()
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
  const supabase = createClient()
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
