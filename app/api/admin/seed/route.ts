import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/admin/seed — Cria ou atualiza um usuario admin via GoTrue Admin API
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body.email || "fernando.garcia2505@hotmail.com"
    const nome = body.nome || "Admin"
    const empresa = body.empresa || "Fluig | Ação Comercial"
    const senha = "TempAdmin2025!"

    const admin = createAdminClient()

    // Tentar criar o usuario
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, empresa },
    })

    let userId: string | undefined

    if (authError) {
      // Se ja existe, buscar o id pelo email
      if (authError.message.toLowerCase().includes("already")) {
        const { data: list } = await admin.auth.admin.listUsers()
        const existing = list?.users?.find((u) => u.email === email)
        if (!existing) return NextResponse.json({ error: authError.message }, { status: 400 })
        userId = existing.id
        // Atualizar senha para a temporaria
        await admin.auth.admin.updateUserById(userId, { password: senha })
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    } else {
      userId = authData.user?.id
    }

    if (!userId) return NextResponse.json({ error: "Falha ao obter ID do usuario" }, { status: 500 })

    // Atualizar profile para admin nao-ativado
    await admin.from("profiles").update({
      role: "admin",
      ativado: false,
      nome,
      empresa,
    }).eq("id", userId)

    return NextResponse.json({
      success: true,
      userId,
      email,
      senha_temp: senha,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    )
  }
}
