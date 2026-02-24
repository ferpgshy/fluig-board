import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Client com service_role key — APENAS para uso server-side em API routes de admin
// Bypassa RLS, cuidado ao usar!
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
