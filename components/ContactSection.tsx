"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import Reveal from "@/components/Reveal"
import { BRAND } from "@/lib/brand"

// POST /api/leads requires a dialable phone and a message of at least 10
// characters. This form used to send neither, so every submission came back
// 400; the fields and the minlength below mirror that schema.
const MIN_MESSAGE_LENGTH = 10

const EMPTY = { name: "", phone: "", email: "", message: "" }

const FIELD =
  "w-full border-0 border-b border-foreground/20 bg-transparent px-0 py-4 text-[17px] text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"

export default function ContactSection() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(EMPTY)

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "")
      }
      setSent(true)
      toast.success("Pesan terkirim! Kami akan menghubungi Anda segera.")
      setFormData(EMPTY)
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Gagal mengirim pesan. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="bg-background text-foreground">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-16 px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(6rem,11vw,9rem)] lg:grid-cols-12 lg:gap-x-12">
        <Reveal effect="drift" className="lg:col-span-5">
          <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            <span className="font-serif text-[15px] italic tracking-normal text-primary">05</span>
            <span aria-hidden className="h-px w-8 bg-gold" />
            Kontak
          </p>
          <h2 className="m-0 font-serif text-[clamp(3rem,6vw,5.5rem)] font-light italic leading-[0.98] tracking-[-0.01em]">
            {BRAND.contactSection.heading}
          </h2>
          <p className="mt-8 max-w-[40ch] text-[16px] leading-[1.85] text-muted-foreground text-pretty">
            {BRAND.contactSection.body}
          </p>

          <dl className="mt-12 space-y-6 text-[14px] leading-relaxed">
            <div>
              <dt className="mb-1 text-[10px] font-medium uppercase tracking-[0.28em] text-primary">Email</dt>
              <dd className="m-0">
                <a href={`mailto:${BRAND.contact.email}`} className="text-foreground/85 hover:text-primary">
                  {BRAND.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[10px] font-medium uppercase tracking-[0.28em] text-primary">Jam kantor</dt>
              <dd className="m-0 text-foreground/85">{BRAND.contact.hours}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal effect="drift" delay={150} className="lg:col-span-6 lg:col-start-7 lg:self-end">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <input
                type="text"
                aria-label="Nama lengkap"
                placeholder="Nama lengkap"
                required
                minLength={2}
                autoComplete="name"
                value={formData.name}
                onChange={(e) => set("name")(e.target.value)}
                className={FIELD}
              />
              <input
                type="tel"
                aria-label="Nomor WhatsApp"
                placeholder="Nomor WhatsApp"
                required
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => set("phone")(e.target.value)}
                className={FIELD}
              />
            </div>
            <input
              type="email"
              aria-label="Email (opsional)"
              placeholder="Email (opsional)"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => set("email")(e.target.value)}
              className={FIELD}
            />
            <textarea
              aria-label="Properti yang Anda cari"
              placeholder="Properti seperti apa yang Anda cari?"
              required
              minLength={MIN_MESSAGE_LENGTH}
              rows={3}
              value={formData.message}
              onChange={(e) => set("message")(e.target.value)}
              className={`${FIELD} resize-none`}
            />
            <button
              type="submit"
              disabled={submitting}
              className="group mt-8 inline-flex h-14 items-center justify-between gap-6 self-start bg-accent px-8 text-[12px] font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-colors duration-500 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Mengirim…" : sent ? "Terima kasih" : "Kirim permintaan"}
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
