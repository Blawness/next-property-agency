"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { PROPERTY_TYPE_LABELS } from "@/lib/constants"

interface PropertyItem {
  id: string
  title: string
  type: string
  listingType: string
  city: string
  price: string
  status: string | null
  primaryImageUrl: string | null
}

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  sold: "Terjual",
  rented: "Tersewa",
  archived: "Diarsipkan",
}

export default function AdminPropertiesPage() {
  const [items, setItems] = useState<PropertyItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const searchParamsHook = useSearchParams()
  const router = useRouter()

  const page = parseInt(searchParamsHook.get("page") ?? "1", 10)
  const search = searchParamsHook.get("search") ?? ""
  const statusFilter = searchParamsHook.get("status") ?? ""
  const typeFilter = searchParamsHook.get("type") ?? ""
  const limit = 20

  const [searchInput, setSearchInput] = useState(search)

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsHook.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    router.push(`/admin/properti?${params.toString()}`)
  }

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParamsHook.toString())
    params.set("page", String(newPage))
    router.push(`/admin/properti?${params.toString()}`)
  }

  const fetchProperties = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", limit.toString())
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (typeFilter) params.set("type", typeFilter)

    fetch(`/api/properties?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? [])
        setTotal(data.total ?? 0)
        setSelectedIds(new Set())
      })
      .catch((err) => { setError(err.message); setLoading(false) })
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, typeFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties()
  }, [fetchProperties])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchInput, page: "1" })
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus "${title}"?`)) return
    await fetch(`/api/properties/${id}`, { method: "DELETE" })
    toast.success("Properti dihapus")
    fetchProperties()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  const handleBulkStatus = async (status: string) => {
    if (!confirm(`Ubah ${selectedIds.size} properti ke "${STATUS_LABELS[status] ?? status}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/properties/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds], status }),
      })
      if (!res.ok) throw new Error("Gagal")
      const data = await res.json()
      toast.success(`${data.updated} properti diubah ke ${STATUS_LABELS[status] ?? status}`)
    } catch {
      toast.error("Gagal mengubah status")
    } finally {
      fetchProperties()
      setBusy(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.size} properti? Tindakan ini tidak bisa dibatalkan.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/properties/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selectedIds] }),
      })
      if (!res.ok) throw new Error("Gagal")
      const data = await res.json()
      toast.success(`${data.updated} properti dipindahkan ke arsip`)
    } catch {
      toast.error("Gagal menghapus properti")
    } finally {
      fetchProperties()
      setBusy(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Properti</h1>
        <div className="text-center py-12 border rounded-xl">
          <p className="text-destructive font-medium">Gagal memuat data</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setError(""); setLoading(true); fetchProperties() }}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properti</h1>
        <Button asChild size="sm">
          <Link href="/admin/properti/create">
            <Plus size={14} className="mr-1" />
            Tambah Properti
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau kota..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(v) => updateFilters({ status: v === "all" ? "" : v, page: "1" })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="sold">Terjual</SelectItem>
                <SelectItem value="rented">Tersewa</SelectItem>
                <SelectItem value="archived">Diarsipkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter || "all"} onValueChange={(v) => updateFilters({ type: v === "all" ? "" : v, page: "1" })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="rumah">Rumah</SelectItem>
                <SelectItem value="apartemen">Apartemen</SelectItem>
                <SelectItem value="tanah">Tanah</SelectItem>
                <SelectItem value="ruko">Ruko</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary" size="sm">Cari</Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">
                {search || statusFilter || typeFilter
                  ? "Tidak ada hasil filter"
                  : "Belum ada properti"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs mx-auto">
                {search || statusFilter || typeFilter
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Klik tombol Tambah Properti untuk menambah listing pertama"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-3 w-10">
                        <input
                          type="checkbox"
                          checked={items.length > 0 && selectedIds.size === items.length}
                          onChange={toggleSelectAll}
                          className="size-4 rounded border-border accent-brown-500 cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-3 font-medium w-14"></th>
                      <th className="text-left p-3 font-medium">Judul</th>
                      <th className="text-left p-3 font-medium">Tipe</th>
                      <th className="text-left p-3 font-medium">Kota</th>
                      <th className="text-left p-3 font-medium">Harga</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="size-4 rounded border-border accent-brown-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                            {item.primaryImageUrl ? (
                              <Image
                                src={item.primaryImageUrl}
                                alt=""
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium truncate max-w-44">{item.title}</td>
                        <td className="p-3 text-muted-foreground">
                          {PROPERTY_TYPE_LABELS[item.type] ?? item.type}
                        </td>
                        <td className="p-3 text-muted-foreground">{item.city}</td>
                        <td className="p-3 text-muted-foreground">
                          Rp {parseInt(item.price, 10).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            item.status === "active" ? "default" : item.status === "archived" ? "outline" : "secondary"
                          }>
                            {item.status === "active" ? "Aktif" : item.status === "sold" ? "Terjual" : item.status === "rented" ? "Tersewa" : "Diarsipkan"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/admin/properti/${item.id}/edit`}>
                                <Pencil size={14} />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id, item.title)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="size-4 mt-1 rounded border-border accent-brown-500 cursor-pointer shrink-0"
                    />
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.primaryImageUrl ? (
                        <Image src={item.primaryImageUrl} alt="" width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm line-clamp-1 flex-1">{item.title}</p>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                            <Link href={`/admin/properti/${item.id}/edit`}>
                              <Pencil size={12} />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id, item.title)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{PROPERTY_TYPE_LABELS[item.type]}</span>
                        <span>&middot;</span>
                        <span>{item.city}</span>
                        <span>&middot;</span>
                        <span>Rp {parseInt(item.price, 10).toLocaleString("id-ID")}</span>
                      </div>
                      <Badge variant={item.status === "active" ? "default" : item.status === "archived" ? "outline" : "secondary"} className="text-[10px]">
                        {item.status === "active" ? "Aktif" : item.status === "sold" ? "Terjual" : item.status === "rented" ? "Tersewa" : "Diarsipkan"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    {total} properti &middot; Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Bulk action bar ──────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-card border shadow-lg rounded-xl px-4 py-3 animate-in fade-in-up duration-200">
            <span className="text-sm font-semibold whitespace-nowrap">
              {selectedIds.size} terpilih
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={busy}>
                  Ubah Status
                  <ChevronDown size={12} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleBulkStatus("active")} disabled={busy}>
                  Aktif
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatus("sold")} disabled={busy}>
                  Terjual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatus("rented")} disabled={busy}>
                  Tersewa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatus("archived")} disabled={busy}>
                  Diarsipkan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={busy}
            >
              <Trash2 size={13} className="mr-1" />
              Hapus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              disabled={busy}
            >
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
