import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/admin/users — Lista todos os profiles (apenas admin)
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    // Verifica se e admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    // Busca todos os profiles
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}

// PATCH /api/admin/users — Atualiza role ou ativado de um usuario (apenas admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, role, ativado } = body

    if (!userId) {
      return NextResponse.json({ error: "userId e obrigatorio." }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    // Verifica se e admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    // Nao pode desativar a si mesmo
    if (userId === user.id && ativado === false) {
      return NextResponse.json({ error: "Voce nao pode desativar a si mesmo." }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (role !== undefined) updates.role = role
    if (ativado !== undefined) updates.ativado = ativado

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
