import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// PATCH /api/access-requests/[id] — aprovar ou recusar
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })

    const admin = createAdminClient()

    // Verificar se e admin
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const body = await req.json()
    const { acao, motivo_recusa } = body // acao: "aprovar" | "recusar"

    // Buscar a solicitacao
    const { data: request } = await admin
      .from("access_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (!request) return NextResponse.json({ error: "Solicitacao nao encontrada." }, { status: 404 })
    if (request.status !== "pendente") {
      return NextResponse.json({ error: "Solicitacao ja foi processada." }, { status: 409 })
    }

    if (acao === "recusar") {
      const { error } = await admin
        .from("access_requests")
        .update({
          status: "recusado",
          motivo_recusa: motivo_recusa || "",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      return NextResponse.json({ success: true, acao: "recusado" })
    }

    if (acao === "aprovar") {
      // Criar usuario no Supabase Auth
      const tempPassword = `Fluig@${Math.random().toString(36).slice(2, 8).toUpperCase()}!`
      let userId: string | undefined

      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nome: request.nome,
          empresa: request.empresa,
        },
      })

      if (createError) {
        if (createError.message.includes("already been registered")) {
          // Usuario ja existe — buscar pelo email e atualizar senha
          const { data: listData } = await admin.auth.admin.listUsers()
          const existingUser = listData?.users?.find(
            (u) => u.email?.toLowerCase() === request.email.toLowerCase()
          )
          if (existingUser) {
            userId = existingUser.id
            // Atualizar senha temporaria para o usuario existente
            await admin.auth.admin.updateUserById(userId, { password: tempPassword })
          }
        } else {
          throw createError
        }
      } else {
        userId = newUser?.user?.id
      }

      // Atualizar profile com dados da solicitacao
      if (userId) {
        // Upsert: se profile nao existe, cria; se existe, atualiza
        await admin
          .from("profiles")
          .upsert({
            id: userId,
            nome: request.nome,
            email: request.email,
            empresa: request.empresa,
            cargo: request.cargo || "",
            telefone: request.telefone || "",
            role: "user",
            ativado: true,
          }, { onConflict: "id" })
      }

      // Marcar solicitacao como aprovada
      await admin
        .from("access_requests")
        .update({
          status: "aprovado",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)

      return NextResponse.json({
        success: true,
        acao: "aprovado",
        email: request.email,
        senha_temp: tempPassword,
      })
    }

    return NextResponse.json({ error: "Acao invalida." }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
