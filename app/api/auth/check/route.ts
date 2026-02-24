import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ redirect: "/login" })
    }

    // Usar admin client (service_role) para bypass de RLS e evitar erro de schema cache
    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from("profiles")
      .select("role, ativado")
      .eq("id", user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ redirect: "/app" })
    }

    if (profile.role === "admin" && !profile.ativado) {
      return NextResponse.json({ redirect: "/admin/setup" })
    }

    if (profile.role === "admin") {
      return NextResponse.json({ redirect: "/admin" })
    }

    if (!profile.ativado) {
      await supabase.auth.signOut()
      return NextResponse.json({
        redirect: "/login",
        error: "Sua conta ainda nao foi ativada. Entre em contato com o administrador.",
      })
    }

    return NextResponse.json({ redirect: "/app" })
  } catch {
    return NextResponse.json({ redirect: "/app" })
  }
}
