"use client"

import { useState, type FormEvent } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import Reveal from "@/components/Reveal"

export default function ContactSection() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

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
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success("Pesan terkirim! Kami akan menghubungi Anda segera.")
      setFormData({ name: "", email: "", message: "" })
    } catch {
      toast.error("Gagal mengirim pesan. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative min-h-[768px]">
      <Reveal className="absolute left-[clamp(1.5rem,5vw,4.5rem)] top-[clamp(6rem,11vw,10rem)] z-[2]">
        <h2
          className="m-0 font-sans text-[clamp(4rem,9vw,9rem)] leading-none font-extrabold tracking-[-0.03em]"
          style={{
            color: "#fff",
            WebkitTextStroke: "4px var(--primary)",
            paintOrder: "stroke fill",
          }}
        >
          Contact
        </h2>
      </Reveal>

      <Reveal
        delay={150}
        className="absolute left-0 right-0 top-[clamp(11rem,16vw,15.75rem)] bottom-0 bg-primary text-white"
      >
        <div
          className="h-full w-full"
          style={{
            padding: "clamp(4rem, 8vw, 8.25rem) clamp(1.5rem, 5vw, 4.5rem) 56px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 560px)",
            columnGap: "80px",
            alignItems: "center",
            rowGap: "clamp(2rem, 4vw, 3rem)",
          }}
        >
        <div>
          <p className="m-0 max-w-[440px] font-sans text-[clamp(1.25rem,1.7vw,1.625rem)] leading-[38px] font-light italic text-pretty text-white">
            Tell us what you are looking for — we reply with a shortlist within one
            working day.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="h-14 px-[22px] rounded-xl border border-white/45 bg-transparent text-white text-[19px] outline-none placeholder:text-white/50 focus:border-white"
          />
          <input
            type="email"
            placeholder="Work email"
            required
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="h-14 px-[22px] rounded-xl border border-white/45 bg-transparent text-white text-[19px] outline-none placeholder:text-white/50 focus:border-white"
          />
          <input
            type="text"
            placeholder="What are you looking for?"
            required
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            className="h-14 px-[22px] rounded-xl border border-white/45 bg-transparent text-white text-[19px] outline-none placeholder:text-white/50 focus:border-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-14 border-0 rounded-xl bg-white text-primary font-sans text-[19px] font-bold tracking-[0.05em] uppercase cursor-pointer hover:bg-[#111] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {submitting ? "Sending..." : sent ? "Thank you" : "Send request"}
              <Send size={16} strokeWidth={2.1} />
            </span>
          </button>
        </form>
        </div>
      </Reveal>
    </section>
  )
}
