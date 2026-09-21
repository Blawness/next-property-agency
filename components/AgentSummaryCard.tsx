import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { PublicAgent } from "@/lib/types"

export default function AgentSummaryCard({ agent }: { agent: PublicAgent }) {
  return (
    <Link
      href={`/agen/${agent.id}`}
      className="group block rounded-sm border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <Avatar className="h-20 w-20 border-2 border-primary">
        {agent.avatarUrl ? (
          <AvatarImage src={agent.avatarUrl} alt={agent.fullName} className="object-cover" />
        ) : null}
        <AvatarFallback className="text-2xl">
          {agent.fullName[0]?.toUpperCase() ?? "A"}
        </AvatarFallback>
      </Avatar>

      <h3 className="mt-4 font-sans text-[17px] font-semibold text-foreground transition-colors group-hover:text-primary">
        {agent.fullName}
      </h3>

      {agent.title && (
        <p className="mt-0.5 text-[13px] text-muted-foreground">{agent.title}</p>
      )}

      <p className="mt-3 border-t border-border/60 pt-3 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
        {agent.listingCount > 0 ? `${agent.listingCount} listing aktif` : "Belum ada listing"}
      </p>
    </Link>
  )
}
