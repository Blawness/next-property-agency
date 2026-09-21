import { render, screen } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import AgentCard from "@/components/AgentCard"

const agent = { id: "a1", fullName: "Ahmad Rahman", phone: "081234567890", avatarUrl: null }

function renderCard(props: Partial<React.ComponentProps<typeof AgentCard>> = {}) {
  return render(
    <SessionProvider>
      <AgentCard
        agent={agent}
        createdAt={null}
        propertyId="p1"
        propertyTitle="Rumah Bintaro"
        price="1000000000"
        listingType="jual"
        {...props}
      />
    </SessionProvider>,
  )
}

describe("AgentCard", () => {
  it("links the agent's name through to their public profile", () => {
    renderCard()
    expect(screen.getByRole("link", { name: /ahmad rahman/i })).toHaveAttribute("href", "/agen/a1")
  })

  it("still shows the name when the agent has no id to link to", () => {
    renderCard({ agent: { ...agent, id: null } })
    expect(screen.getByText("Ahmad Rahman")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /ahmad rahman/i })).not.toBeInTheDocument()
  })

  it("offers the WhatsApp enquiry for the listing", () => {
    renderCard()
    const link = screen.getByRole("link", { name: /whatsapp/i })
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/6281234567890"))
  })

  it("says so when there is no agent on the listing", () => {
    renderCard({ agent: null })
    expect(screen.getByText(/info agen tidak tersedia/i)).toBeInTheDocument()
  })
})
