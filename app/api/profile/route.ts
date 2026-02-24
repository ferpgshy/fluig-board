import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/profile — Retorna o profile do usuario logado
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: "Perfil nao encontrado." }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
