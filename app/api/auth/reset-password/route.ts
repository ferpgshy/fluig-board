import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { resetPasswordEmailTemplate } from "@/lib/email-templates"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "E-mail obrigatorio." }, { status: 400 })

    const adminDb = createAdminClient()

    // Gerar link de recuperacao via Supabase Admin API
    const { data, error } = await adminDb.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/redefinir-senha`,
      },
    })

    if (error) {
      // Nao revelar se o email existe ou nao por seguranca
      console.error("[v0] Reset password error:", error.message)
      return NextResponse.json({ success: true }) // retorna sucesso mesmo com erro
    }

    const resetLink = data?.properties?.action_link
    if (!resetLink) return NextResponse.json({ success: true })

    // Buscar nome do usuario no profile
    const { data: profile } = await adminDb
      .from("profiles")
      .select("nome")
      .eq("email", email.trim().toLowerCase())
      .single()

    const html = resetPasswordEmailTemplate({
      nome: profile?.nome,
      resetLink,
      expiry: "1 hora",
    })

    // Enviar via Supabase SMTP configurado (usando fetch para a API interna)
    // Se nao houver SMTP configurado, o link eh retornado no console do servidor
    // e pode ser enviado via outro provider (Resend, SendGrid, etc.)
    const smtpRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to: email,
          subject: "Redefinir sua senha — Fluig Board",
          html,
        }),
      }
    ).catch(() => null)

    // Se nao houver Edge Function de email, loga o link para uso em dev
    if (!smtpRes?.ok) {
      console.log("[v0] Reset link (dev):", resetLink)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Reset password route error:", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
