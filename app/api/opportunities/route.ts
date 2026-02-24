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
    .from("opportunities")
    .select("*")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ opportunities: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

  const body = await request.json()

  // Verificar se ja existe oportunidade ativa para essa conta
  const { data: existing } = await supabase
    .from("opportunities")
    .select("id")
    .eq("account_id", body.account_id)
    .eq("user_id", user.id)
    .not("estagio", "in", '("works_fechado","perdido")')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "Ja existe uma oportunidade ativa para esta conta." }, { status: 409 })
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ opportunity: data })
}
