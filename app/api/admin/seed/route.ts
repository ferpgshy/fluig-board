import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/admin/seed — Cria o usuario admin via GoTrue Admin API
// Executar apenas 1x para seed inicial
export async function POST() {
  try {
    const admin = createAdminClient()

    // Criar usuario via GoTrue Admin API (cria identity corretamente)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: "fernando.garcia2505@hotmail.com",
      password: "TempAdmin2025!",
      email_confirm: true,
      user_metadata: {
        nome: "Fernando Garcia",
        empresa: "Fluig Board",
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Falha ao criar usuario" }, { status: 500 })
    }

    // Atualizar profile para admin nao-ativado
    const { error: profileError } = await admin
      .from("profiles")
      .update({ role: "admin", ativado: false })
      .eq("id", authData.user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email: authData.user.email,
      message: "Admin criado. Login com TempAdmin2025! e acesse /admin/setup para ativar.",
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    )
  }
}
