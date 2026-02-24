import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/admin/setup — Ativa o admin: define nome, telefone, empresa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, telefone, empresa } = body

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: "Nome e obrigatorio." }, { status: 400 })
    }

    const supabase = await createClient()

    // Verifica se o usuario logado existe e e admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    // Busca o profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil nao encontrado." }, { status: 404 })
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado. Apenas administradores." }, { status: 403 })
    }

    if (profile.ativado) {
      return NextResponse.json({ error: "Admin ja ativado." }, { status: 400 })
    }

    // Atualiza o profile do admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        nome: nome.trim(),
        telefone: (telefone || "").trim(),
        empresa: (empresa || "").trim(),
        ativado: true,
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
