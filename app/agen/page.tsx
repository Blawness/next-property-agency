import type { Metadata } from "next"
import { getPublicAgents } from "@/lib/db-helpers"
import AgentSummaryCard from "@/components/AgentSummaryCard"
import SectionHeading from "@/components/SectionHeading"
import Reveal from "@/components/Reveal"
import { BRAND, brandTitle } from "@/lib/brand"
import { Users } from "lucide-react"

export const revalidate = 300

export const metadata: Metadata = {
  title: brandTitle("Tim Agen"),
  description: `Agen properti ${BRAND.name} — hubungi langsung agen yang menangani area dan tipe properti yang Anda cari.`,
}

export default async function AgenPage() {
  const agents = await getPublicAgents()

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading eyebrow="Tim" title="Agen Kami" />

      {agents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-sm border border-border bg-card py-20 text-center">
          <Users className="h-8 w-8 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">Belum ada agen terdaftar.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent, i) => (
            <Reveal key={agent.id} delay={i * 60}>
              <AgentSummaryCard agent={agent} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
