"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PropertyFormFields from "@/components/PropertyFormFields"
import { useAgents } from "@/hooks/useAgents"
import ImageManager from "@/components/ImageManager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const { agents } = useAgents()

  const [fields, setFields] = useState({
    title: "",
    description: "",
    price: "",
    type: "rumah",
    listingType: "jual",
    status: "active",
    city: "",
    address: "",
    lat: "",
    lng: "",
    landArea: "",
    buildingArea: "",
    bedrooms: "",
    bathrooms: "",
    agentId: "",
  })

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setFields({
          title: data.title ?? "",
          description: data.description ?? "",
          price: data.price ?? "",
          type: data.type ?? "rumah",
          listingType: data.listingType ?? "jual",
          status: data.status ?? "active",
          city: data.city ?? "",
          address: data.address ?? "",
          lat: data.lat ?? "",
          lng: data.lng ?? "",
          landArea: data.landArea?.toString() ?? "",
          buildingArea: data.buildingArea?.toString() ?? "",
          bedrooms: data.bedrooms?.toString() ?? "",
          bathrooms: data.bathrooms?.toString() ?? "",
          agentId: data.agentId ?? "",
        })
        setImageUrls(data.images?.map((img: { url: string }) => img.url) ?? [])
      })
      .catch(() => setError("Gagal memuat data properti."))
      .finally(() => setLoading(false))
  }, [id])

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const body: Record<string, string | string[] | null> = { ...fields, imageUrls }

    const res = await fetch(`/api/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Gagal menyimpan perubahan.")
      setSaving(false)
      return
    }

    toast.success("Properti diperbarui")
    router.push("/admin/properti")
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/properti">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Properti</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit: {fields.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <PropertyFormFields fields={fields} setField={setField} agents={agents} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select value={fields.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="sold">Terjual</SelectItem>
                    <SelectItem value="rented">Tersewa</SelectItem>
                    <SelectItem value="archived">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageManager imageUrls={imageUrls} setImageUrls={setImageUrls} onError={setError} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
