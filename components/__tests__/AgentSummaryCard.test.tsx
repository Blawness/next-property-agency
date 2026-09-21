import { render, screen } from "@testing-library/react"
import AgentSummaryCard from "@/components/AgentSummaryCard"
import type { PublicAgent } from "@/lib/types"

const agent: PublicAgent = {
  id: "a1",
  fullName: "Ahmad Rahman",
  title: "Spesialis Tanah & Kavling",
  bio: "Sepuluh tahun di pasar Tangerang.",
  phone: "081234567890",
  avatarUrl: null,
  createdAt: null,
  listingCount: 4,
}

describe("AgentSummaryCard", () => {
  it("shows the agent's name and job title", () => {
    render(<AgentSummaryCard agent={agent} />)
    expect(screen.getByText("Ahmad Rahman")).toBeInTheDocument()
    expect(screen.getByText("Spesialis Tanah & Kavling")).toBeInTheDocument()
  })

  it("links through to the agent's profile", () => {
    render(<AgentSummaryCard agent={agent} />)
    expect(screen.getByRole("link", { name: /ahmad rahman/i })).toHaveAttribute("href", "/agen/a1")
  })

  it("reports how many listings the agent carries", () => {
    render(<AgentSummaryCard agent={agent} />)
    expect(screen.getByText(/4 listing/i)).toBeInTheDocument()
  })

  it("says so plainly when an agent carries none", () => {
    render(<AgentSummaryCard agent={{ ...agent, listingCount: 0 }} />)
    expect(screen.getByText(/belum ada listing/i)).toBeInTheDocument()
  })

  it("falls back to an initial when there is no photo", () => {
    render(<AgentSummaryCard agent={agent} />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders without a job title", () => {
    render(<AgentSummaryCard agent={{ ...agent, title: null }} />)
    expect(screen.getByText("Ahmad Rahman")).toBeInTheDocument()
    expect(screen.queryByText("Spesialis Tanah & Kavling")).not.toBeInTheDocument()
  })
})
