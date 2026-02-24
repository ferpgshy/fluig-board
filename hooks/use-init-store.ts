import { useEffect } from "react"
import { useStore } from "@/lib/store"

export function useInitStore() {
  const hydrate = useStore((s) => s.hydrate)
  const initialized = useStore((s) => s.initialized)

  useEffect(() => {
    if (initialized) return

    async function load() {
      const [accountsRes, oppsRes, visitsRes, reportsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/opportunities"),
        fetch("/api/visits"),
        fetch("/api/reports"),
      ])

      const [accountsData, oppsData, visitsData, reportsData] = await Promise.all([
        accountsRes.ok ? accountsRes.json() : { accounts: [] },
        oppsRes.ok ? oppsRes.json() : { opportunities: [] },
        visitsRes.ok ? visitsRes.json() : { visits: [] },
        reportsRes.ok ? reportsRes.json() : { reports: [] },
      ])

      hydrate({
        accounts: accountsData.accounts ?? [],
        opportunities: oppsData.opportunities ?? [],
        visits: visitsData.visits ?? [],
        reports: reportsData.reports ?? [],
      })
    }

    load()
  }, [hydrate, initialized])
}
