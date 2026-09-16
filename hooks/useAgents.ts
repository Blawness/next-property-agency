"use client"

import { useEffect, useState } from "react"

export interface AgentOption {
  id: string
  fullName: string
}

// Feeds the agent picker on the admin property forms. Failures degrade to an
// empty list: the form still submits and the server falls back to the acting admin.
export function useAgents() {
  const [agents, setAgents] = useState<AgentOption[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/agents")
      .then((r) => (r.ok ? r.json() : { agents: [] }))
      .then((data) => {
        if (!cancelled) setAgents(data.agents ?? [])
      })
      .catch(() => {
        if (!cancelled) setAgents([])
      })
      .finally(() => {
        if (!cancelled) setLoadingAgents(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { agents, loadingAgents }
}
