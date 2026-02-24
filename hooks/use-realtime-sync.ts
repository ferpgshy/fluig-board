"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"
import type { Account, Opportunity, Visit, ReportDraft } from "@/lib/models"

/**
 * Hook that subscribes to Supabase Realtime changes on all main tables.
 * Automatically updates the Zustand store when data changes in the database,
 * enabling real-time updates without page refresh.
 */
export function useRealtimeSync() {
  const initialized = useStore((s) => s.initialized)

  useEffect(() => {
    if (!initialized) return

    const supabase = createClient()
    const store = useStore.getState

    // Helper to get current state and set new state
    const setState = useStore.setState

    const channel = supabase
      .channel("realtime-sync")

      // === ACCOUNTS ===
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "accounts" },
        (payload) => {
          const newAccount = payload.new as Account
          const exists = store().accounts.some((a) => a.id === newAccount.id)
          if (!exists) {
            setState((s) => ({ accounts: [newAccount, ...s.accounts] }))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "accounts" },
        (payload) => {
          const updated = payload.new as Account
          setState((s) => ({
            accounts: s.accounts.map((a) => (a.id === updated.id ? updated : a)),
          }))
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "accounts" },
        (payload) => {
          const deletedId = payload.old.id as string
          setState((s) => ({
            accounts: s.accounts.filter((a) => a.id !== deletedId),
          }))
        }
      )

      // === OPPORTUNITIES ===
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "opportunities" },
        (payload) => {
          const newOpp = payload.new as Opportunity
          const exists = store().opportunities.some((o) => o.id === newOpp.id)
          if (!exists) {
            setState((s) => ({ opportunities: [newOpp, ...s.opportunities] }))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "opportunities" },
        (payload) => {
          const updated = payload.new as Opportunity
          setState((s) => ({
            opportunities: s.opportunities.map((o) => (o.id === updated.id ? updated : o)),
          }))
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "opportunities" },
        (payload) => {
          const deletedId = payload.old.id as string
          setState((s) => ({
            opportunities: s.opportunities.filter((o) => o.id !== deletedId),
          }))
        }
      )

      // === VISITS ===
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visits" },
        (payload) => {
          const newVisit = payload.new as Visit
          const exists = store().visits.some((v) => v.id === newVisit.id)
          if (!exists) {
            setState((s) => ({ visits: [newVisit, ...s.visits] }))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "visits" },
        (payload) => {
          const updated = payload.new as Visit
          setState((s) => ({
            visits: s.visits.map((v) => (v.id === updated.id ? updated : v)),
          }))
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "visits" },
        (payload) => {
          const deletedId = payload.old.id as string
          setState((s) => ({
            visits: s.visits.filter((v) => v.id !== deletedId),
          }))
        }
      )

      // === REPORTS ===
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => {
          const newReport = payload.new as ReportDraft
          const exists = store().reports.some((r) => r.id === newReport.id)
          if (!exists) {
            setState((s) => ({ reports: [newReport, ...s.reports] }))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reports" },
        (payload) => {
          const updated = payload.new as ReportDraft
          setState((s) => ({
            reports: s.reports.map((r) => (r.id === updated.id ? updated : r)),
          }))
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reports" },
        (payload) => {
          const deletedId = payload.old.id as string
          setState((s) => ({
            reports: s.reports.filter((r) => r.id !== deletedId),
          }))
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialized])
}
