"use client"

import { usePropertyForm } from "@/hooks/usePropertyForm"
import { useAgents } from "@/hooks/useAgents"
import PropertyFormFields from "@/components/PropertyFormFields"
import ImageUploadSection from "@/components/ImageUploadSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function CreatePropertyPage() {
  const { fields, imageUrls, setField, setImageUrls, setError, handleSubmit, loading, error } =
    usePropertyForm()
  const { agents } = useAgents()

  const wrappedSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e)
    if (!error) {
      toast.success("Properti berhasil ditambahkan")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/properti">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Tambah Properti</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properti Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={wrappedSubmit} className="space-y-5">
            <PropertyFormFields fields={fields} setField={setField} agents={agents} />
            <ImageUploadSection imageUrls={imageUrls} setImageUrls={setImageUrls} onError={setError} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Properti"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
