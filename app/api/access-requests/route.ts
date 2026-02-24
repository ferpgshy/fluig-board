import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// POST /api/access-requests — qualquer pessoa (anon) envia solicitacao
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, email, empresa, cargo, telefone, mensagem } = body

    if (!nome || !email || !empresa) {
      return NextResponse.json({ error: "Nome, e-mail e empresa sao obrigatorios." }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "E-mail invalido." }, { status: 400 })
    }

    // Usar admin client para bypassar RLS (insert anon via API pode ter restricoes)
    const admin = createAdminClient()

    // Verificar se ja existe solicitacao pendente para esse email
    const { data: existing } = await admin
      .from("access_requests")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existing?.status === "pendente") {
      return NextResponse.json(
        { error: "Ja existe uma solicitacao pendente para este e-mail." },
        { status: 409 }
      )
    }

    if (existing?.status === "aprovado") {
      return NextResponse.json(
        { error: "Este e-mail ja possui acesso. Faca login normalmente." },
        { status: 409 }
      )
    }

    const { error } = await admin.from("access_requests").insert({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      empresa: empresa.trim(),
      cargo: cargo?.trim() || "",
      telefone: telefone?.trim() || "",
      mensagem: mensagem?.trim() || "",
      status: "pendente",
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao enviar solicitacao." }, { status: 500 })
  }
}

// GET /api/access-requests — somente admins
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { data, error } = await admin
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
