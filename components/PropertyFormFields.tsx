"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@/lib/constants"
import type { AgentOption } from "@/hooks/useAgents"

// Radix Select has no empty-string value, so "unassigned" needs a sentinel.
const NO_AGENT = "__none__"

interface PropertyFormFieldsProps {
  fields: {
    title: string
    description: string
    price: string
    type: string
    listingType: string
    city: string
    address: string
    lat: string
    lng: string
    landArea: string
    buildingArea: string
    bedrooms: string
    bathrooms: string
    agentId?: string
  }
  setField: (key: string, value: string) => void
  agents?: AgentOption[]
}

export default function PropertyFormFields({ fields, setField, agents = [] }: PropertyFormFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1 col-span-2">
        <Label htmlFor="title">Judul Iklan</Label>
        <Input
          id="title"
          placeholder="Rumah 3KT di Kebayoran Baru"
          value={fields.title}
          onChange={(e) => setField("title", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="type">Tipe Properti</Label>
        <Select value={fields.type} onValueChange={(v) => setField("type", v)}>
          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="listingType">Jual / Sewa</Label>
        <Select value={fields.listingType} onValueChange={(v) => setField("listingType", v)}>
          <SelectTrigger id="listingType"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(LISTING_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 col-span-2">
        <Label htmlFor="price">Harga (Rp)</Label>
        <Input
          id="price"
          type="number"
          placeholder="500000000"
          value={fields.price}
          onChange={(e) => setField("price", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="city">Kota</Label>
        <Input
          id="city"
          placeholder="Jakarta"
          value={fields.city}
          onChange={(e) => setField("city", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Alamat</Label>
        <Input
          id="address"
          placeholder="Jl. Contoh No. 1"
          value={fields.address}
          onChange={(e) => setField("address", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="landArea">Luas Tanah (m²)</Label>
        <Input
          id="landArea"
          type="number"
          value={fields.landArea}
          onChange={(e) => setField("landArea", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="buildingArea">Luas Bangunan (m²)</Label>
        <Input
          id="buildingArea"
          type="number"
          value={fields.buildingArea}
          onChange={(e) => setField("buildingArea", e.target.value)}
        />
      </div>

      {fields.type !== "tanah" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="bedrooms">Kamar Tidur</Label>
            <Input
              id="bedrooms"
              type="number"
              value={fields.bedrooms}
              onChange={(e) => setField("bedrooms", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bathrooms">Kamar Mandi</Label>
            <Input
              id="bathrooms"
              type="number"
              value={fields.bathrooms}
              onChange={(e) => setField("bathrooms", e.target.value)}
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label htmlFor="lat">Latitude (opsional)</Label>
        <Input
          id="lat"
          type="number"
          step="any"
          placeholder="-6.2088"
          value={fields.lat}
          onChange={(e) => setField("lat", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="lng">Longitude (opsional)</Label>
        <Input
          id="lng"
          type="number"
          step="any"
          placeholder="106.8456"
          value={fields.lng}
          onChange={(e) => setField("lng", e.target.value)}
        />
      </div>

      <div className="space-y-1 col-span-2">
        <Label htmlFor="agentId">Agen Penanggung Jawab</Label>
        <Select
          value={fields.agentId ? fields.agentId : NO_AGENT}
          onValueChange={(v) => setField("agentId", v === NO_AGENT ? "" : v)}
        >
          <SelectTrigger id="agentId">
            <SelectValue placeholder="Belum ditentukan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_AGENT}>Belum ditentukan</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 col-span-2">
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm resize-y"
          placeholder="Ceritakan detail properti..."
          value={fields.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>
    </div>
  )
}
