"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"

interface Agent {
  id: string
  fullName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  propertyCount: number
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formError, setFormError] = useState("")
  const [formSaving, setFormSaving] = useState(false)
  const [createdPassword, setCreatedPassword] = useState("")
  const [formAvatarUrl, setFormAvatarUrl] = useState("")

  const fetchAgents = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/agents")
      .then((r) => r.json())
      .then((data) => setAgents(data.agents ?? []))
      .catch((err) => { setError(err.message); setLoading(false) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAgents()
  }, [fetchAgents])

  const openCreate = () => {
    setEditId(null)
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormError("")
    setCreatedPassword("")
    setFormAvatarUrl("")
    setDialogOpen(true)
  }

  const openEdit = (agent: Agent) => {
    setEditId(agent.id)
    setFormName(agent.fullName)
    setFormEmail(agent.email)
    setFormPhone(agent.phone ?? "")
    setFormError("")
    setCreatedPassword("")
    setFormAvatarUrl(agent.avatarUrl ?? "")
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSaving(true)
    setFormError("")

    if (editId) {
      const res = await fetch(`/api/admin/agents/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, phone: formPhone, avatarUrl: formAvatarUrl || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? "Gagal menyimpan.")
        setFormSaving(false)
        return
      }
      toast.success("Agent diperbarui")
    } else {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, phone: formPhone, avatarUrl: formAvatarUrl || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? "Gagal membuat agent.")
        setFormSaving(false)
        return
      }
      const data = await res.json()
      setCreatedPassword(data.tempPassword)
      toast.success("Agent berhasil dibuat")
    }

    setFormSaving(false)
    setDialogOpen(false)
    fetchAgents()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus agent "${name}"? Properti mereka akan dialihkan ke admin.`)) return
    await fetch(`/api/admin/agents/${id}`, { method: "DELETE" })
    toast.success("Agent dihapus")
    fetchAgents()
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Agent</h1>
        <div className="text-center py-12 border rounded-xl">
          <p className="text-destructive font-medium">Gagal memuat data</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setError(""); setLoading(true); fetchAgents() }}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agent</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" />
          Tambah Agent
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">Belum ada agent</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Klik Tambah Agent untuk membuat akun agent pertama</p>
            </div>
          ) : (
            <div className="divide-y">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {agent.avatarUrl ? (
                        <AvatarImage src={agent.avatarUrl} alt={agent.fullName} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {agent.fullName[0]?.toUpperCase() ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{agent.fullName}</p>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.phone ?? "No phone"} &middot; {agent.propertyCount} properti
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(agent)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(agent.id, agent.fullName)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Agent" : "Tambah Agent Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="agentName">Nama Lengkap</Label>
              <Input
                id="agentName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            {!editId && (
              <div className="space-y-1">
                <Label htmlFor="agentEmail">Email</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="agentPhone">Telepon (opsional)</Label>
              <Input
                id="agentPhone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+6281234567890"
              />
            </div>

            <div className="space-y-1">
              <Label>Foto Profil (opsional)</Label>
              <div className="flex items-center gap-3">
                {formAvatarUrl ? (
                  <div className="relative">
                    <Avatar size="lg">
                      <AvatarImage src={formAvatarUrl} alt="Preview" />
                      <AvatarFallback>
                        {formName[0]?.toUpperCase() ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => setFormAvatarUrl("")}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg text-center transition-colors hover:border-brown-300 hover:bg-brown-50/30">
                    <div className="p-2">
                      <UploadButton<OurFileRouter, "profileImage">
                        endpoint="profileImage"
                        onClientUploadComplete={(res) => {
                          const url = res?.[0]?.ufsUrl
                          if (url) setFormAvatarUrl(url)
                        }}
                        onUploadError={(err) => {
                          toast.error(`Upload gagal: ${err.message}`)
                        }}
                        appearance={{
                          button: "text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors",
                          container: "",
                          allowedContent: "hidden",
                        }}
                        content={{
                          button: (
                            <span className="flex items-center gap-1">
                              <Upload size={12} /> Upload
                            </span>
                          ),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {createdPassword && (
              <div className="bg-brown-50 border border-brown-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-brown-800">Agent berhasil dibuat!</p>
                <p className="text-brown-700 mt-1">
                  Password sementara: <code className="bg-brown-100 px-1 rounded">{createdPassword}</code>
                </p>
                <p className="text-brown-600 text-xs mt-1">Simpan password ini. Tidak akan ditampilkan lagi.</p>
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <Button type="submit" className="w-full" disabled={formSaving}>
              {formSaving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Agent"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
