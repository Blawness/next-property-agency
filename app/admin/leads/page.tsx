"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone } from "lucide-react"
import { toast } from "sonner"

interface Lead {
  id: string
  name: string
  email: string
  message: string
  propertyId: string | null
  propertyTitle: string | null
  status: string
  createdAt: string | null
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "Baru", variant: "default" },
  contacted: { label: "Dihubungi", variant: "secondary" },
  closed: { label: "Selesai", variant: "outline" },
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
      toast.success("Status diperbarui")
    } catch {
      toast.error("Gagal memperbarui status")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
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
        <h1 className="font-display text-2xl font-bold italic text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Permintaan kontak dari calon pembeli
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada leads masuk.
            </p>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => {
                const config = statusConfig[lead.status] ?? statusConfig.new
                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-border/60 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                        {lead.propertyTitle && (
                          <p className="text-xs text-primary mb-2">
                            Properti: {lead.propertyTitle}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">{lead.message}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant={lead.status === "contacted" ? "default" : "outline"}
                          onClick={() => updateStatus(lead.id, "contacted")}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Hubungi
                        </Button>
                        <Button
                          size="sm"
                          variant={lead.status === "closed" ? "default" : "outline"}
                          onClick={() => updateStatus(lead.id, "closed")}
                        >
                          Selesai
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
