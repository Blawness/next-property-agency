import { render, screen } from "@testing-library/react"
import MapCoverageNotice from "@/components/MapCoverageNotice"

describe("MapCoverageNotice", () => {
  it("states the plain count when every match has coordinates", () => {
    render(<MapCoverageNotice pinned={13} matching={13} />)
    expect(screen.getByText(/13/)).toBeInTheDocument()
    expect(screen.queryByText(/koordinat/i)).not.toBeInTheDocument()
  })

  it("says how many are missing when the map cannot show them all", () => {
    render(<MapCoverageNotice pinned={9} matching={13} />)
    expect(screen.getByText("9")).toBeInTheDocument()
    expect(screen.getByText("13")).toBeInTheDocument()
    expect(screen.getByText(/belum punya titik koordinat/i)).toBeInTheDocument()
  })

  it("does not claim a shortfall when the map somehow holds more", () => {
    render(<MapCoverageNotice pinned={13} matching={9} />)
    expect(screen.queryByText(/koordinat/i)).not.toBeInTheDocument()
  })
})
