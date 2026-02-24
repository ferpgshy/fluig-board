import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// Helper: verifica se o usuario logado e admin
async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Usa admin client para ler o profile (bypassa RLS)
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") return null
  return user
}

// GET /api/admin/users — Lista todos os profiles (apenas admin)
export async function GET() {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const adminDb = createAdminClient()
    const { data: users, error } = await adminDb
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

// POST /api/admin/users — Admin cria usuario diretamente
export async function POST(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) return NextResponse.json({ error: "Acesso negado." }, { status: 403 })

    const body = await request.json()
    const { nome, email, empresa, cargo } = body

    if (!nome || !email || !empresa) {
      return NextResponse.json({ error: "Nome, e-mail e empresa sao obrigatorios." }, { status: 400 })
    }

    const adminDb = createAdminClient()
    const tempPassword = `Fluig@${Math.random().toString(36).slice(2, 8).toUpperCase()}!`

    const { data: newUser, error: createError } = await adminDb.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nome: nome.trim(), empresa: empresa.trim() },
    })

    if (createError) return NextResponse.json({ error: createError.message }, { status: 400 })

    const userId = newUser.user?.id
    if (userId) {
      await adminDb.from("profiles").update({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        empresa: empresa.trim(),
        cargo: cargo?.trim() || "",
        role: "user",
        ativado: true,
      }).eq("id", userId)
    }

    return NextResponse.json({ success: true, email: email.trim().toLowerCase(), senha_temp: tempPassword })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}

// PATCH /api/admin/users — Atualiza role ou ativado de um usuario (apenas admin)
export async function PATCH(request: Request) {
  try {
    const user = await verifyAdmin()
    if (!user) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const body = await request.json()
    // suporta `id` ou `userId` para compatibilidade
    const targetId = body.id || body.userId
    const { role, ativado } = body

    if (!targetId) {
      return NextResponse.json({ error: "ID do usuario e obrigatorio." }, { status: 400 })
    }

    // Nao pode desativar a si mesmo
    if (targetId === user.id && ativado === false) {
      return NextResponse.json({ error: "Voce nao pode desativar a si mesmo." }, { status: 400 })
    }

    const adminDb = createAdminClient()
    const updates: Record<string, unknown> = {}
    if (role !== undefined) updates.role = role
    if (ativado !== undefined) updates.ativado = ativado

    const { error: updateError } = await adminDb
      .from("profiles")
      .update(updates)
      .eq("id", targetId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
