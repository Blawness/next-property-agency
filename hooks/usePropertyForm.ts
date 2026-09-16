"use client"

import { useReducer, useState } from "react"
import { useRouter } from "next/navigation"

interface FormFields {
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
  agentId: string
}

type FormAction = { type: "SET_FIELD"; key: string; value: string }

const initialFields: FormFields = {
  title: "",
  description: "",
  price: "",
  type: "rumah",
  listingType: "jual",
  city: "",
  address: "",
  lat: "",
  lng: "",
  landArea: "",
  buildingArea: "",
  bedrooms: "",
  bathrooms: "",
  agentId: "",
}

function formReducer(state: FormFields, action: FormAction): FormFields {
  if (action.type === "SET_FIELD") {
    return { ...state, [action.key]: action.value }
  }
  return state
}

export function usePropertyForm() {
  const router = useRouter()
  const [fields, dispatch] = useReducer(formReducer, initialFields)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function setField(key: string, value: string) {
    dispatch({ type: "SET_FIELD", key, value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, imageUrls }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Gagal menyimpan properti.")
      setLoading(false)
      return
    }

    void res.json()
    router.push("/admin/properti")
  }

  return { fields, imageUrls, setField, setImageUrls, setError, handleSubmit, loading, error }
}
