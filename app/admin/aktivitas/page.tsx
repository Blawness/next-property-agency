"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { History } from "lucide-react"

interface AdminAction {
  id: string
  adminId: string | null
  adminName: string
  action: string
  entityType: string
  entityId: string | null
  metadata: string | null
  createdAt: string | null
}

export default function AdminActionsPage() {
  const [actions, setActions] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/actions")
      .then((r) => r.json())
      .then((data) => setActions(data.actions ?? []))
      .catch(() => setActions([]))
      .finally(() => setLoading(false))
  }, [])

  const formatAction = (action: string) => {
    const parts = action.split(".")
    if (parts.length === 2) {
      const [entity, verb] = parts
      const verbMap: Record<string, string> = {
        create: "Membuat",
        update: "Memperbarui",
        soft_delete: "Menghapus",
        bulk_update: "Bulk update",
      }
      return `${verbMap[verb] ?? verb} ${entity}`
    }
    return action
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold italic text-foreground">Log Aktivitas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Riwayat perubahan data oleh admin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : actions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada aktivitas tercatat.
            </p>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 rounded-lg border border-border/60 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatAction(action.action)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.adminName} • {formatDate(action.createdAt)}
                    </p>
                    {action.entityId && (
                      <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                        ID: {action.entityId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
