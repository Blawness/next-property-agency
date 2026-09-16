"use client"

import { useState, type FormEvent } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PropertyLeadFormProps {
  propertyId: string
  propertyTitle: string
}

// POST /api/leads requires a message of at least 10 characters; keep the client
// guard in sync so the user sees an inline hint instead of a generic 400 toast.
const MIN_MESSAGE_LENGTH = 10

export default function PropertyLeadForm({ propertyId, propertyTitle }: PropertyLeadFormProps) {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: `Halo, saya tertarik dengan "${propertyTitle}". Bisa info lebih lanjut?`,
  })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "")
      }
      setSent(true)
      toast.success("Pertanyaan terkirim! Agen kami akan menghubungi Anda.")
      setForm((prev) => ({ ...prev, name: "", email: "" }))
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Gagal mengirim. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border/40 bg-secondary/60 p-6">
      <h2 className="font-sans text-xl font-semibold text-foreground">Tanya Tentang Properti Ini</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tinggalkan kontak Anda — kami balas dalam satu hari kerja.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="lead-name">Nama</Label>
            <Input
              id="lead-name"
              required
              minLength={2}
              placeholder="Nama lengkap"
              className="rounded-xl bg-background"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-email">Email</Label>
            <Input
              id="lead-email"
              type="email"
              required
              placeholder="nama@email.com"
              className="rounded-xl bg-background"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="lead-message">Pesan</Label>
          <textarea
            id="lead-message"
            required
            minLength={MIN_MESSAGE_LENGTH}
            rows={4}
            className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full rounded-xl sm:w-auto">
          <Send className="mr-2 h-4 w-4" />
          {submitting ? "Mengirim..." : sent ? "Terkirim" : "Kirim Pertanyaan"}
        </Button>
      </form>
    </div>
  )
}
