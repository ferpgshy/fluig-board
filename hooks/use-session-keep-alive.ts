import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Mantém a sessão do Supabase ativa:
 * 1. Escuta eventos de auth (TOKEN_REFRESHED, SIGNED_OUT, etc.)
 * 2. Faz refresh proativo do token a cada 10 minutos
 * 3. Faz refresh quando a aba volta a ficar visível (ex: usuário saiu e voltou)
 */
export function useSessionKeepAlive() {
  useEffect(() => {
    const supabase = createClient()

    // Listener de mudança de estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          // Redirecionar para login caso o token expire sem conseguir refresh
          window.location.href = "/login"
        }
      }
    )

    // Refresh proativo a cada 10 minutos para manter a sessão viva
    const interval = setInterval(async () => {
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.warn("[session] Erro ao renovar sessão:", error.message)
      }
    }, 10 * 60 * 1000) // 10 minutos

    // Quando a aba volta a ficar visível, tenta renovar a sessão
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        supabase.auth.refreshSession().catch(() => {
          // Se falhar, o getUser no próximo request do middleware vai redirecionar
        })
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])
}
