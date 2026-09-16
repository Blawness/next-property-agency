import { render, screen, fireEvent } from "@testing-library/react"
import MortgageCalculator from "@/components/MortgageCalculator"

function renderCalculator(price = "1000000000") {
  return render(<MortgageCalculator price={price} />)
}

describe("MortgageCalculator", () => {
  it("prefills the price from the listing", () => {
    renderCalculator()
    expect(screen.getByLabelText(/harga properti/i)).toHaveValue(1_000_000_000)
  })

  it("shows the monthly instalment for the default terms", () => {
    // 20% DP, 15 years, 10%/yr on Rp 1 M → Rp 8.596.841/bulan
    renderCalculator()
    expect(screen.getByText(/Rp\s*8\.596\.841/)).toBeInTheDocument()
  })

  it("recalculates when the down payment changes", () => {
    renderCalculator()
    fireEvent.change(screen.getByLabelText(/uang muka/i), { target: { value: "30" } })
    expect(screen.getByText(/Rp\s*7\.522\.236/)).toBeInTheDocument()
  })

  it("recalculates when the tenor changes", () => {
    renderCalculator()
    fireEvent.change(screen.getByLabelText(/tenor/i), { target: { value: "10" } })
    expect(screen.queryByText(/Rp\s*8\.596\.841/)).not.toBeInTheDocument()
  })

  it("reports the amount financed alongside the instalment", () => {
    renderCalculator()
    expect(screen.getByText(/Rp\s*800\.000\.000/)).toBeInTheDocument()
  })

  it("explains itself instead of showing a figure when nothing is financed", () => {
    renderCalculator()
    fireEvent.change(screen.getByLabelText(/uang muka/i), { target: { value: "100" } })
    expect(screen.queryByText(/Rp\s*8\.596\.841/)).not.toBeInTheDocument()
    expect(screen.getByText(/lunas/i)).toBeInTheDocument()
  })

  it("handles a listing price that cannot be parsed", () => {
    renderCalculator("")
    expect(screen.getByText(/masukkan harga/i)).toBeInTheDocument()
  })

  it("notes that the figure is an estimate", () => {
    renderCalculator()
    expect(screen.getByText(/simulasi anuitas dengan bunga tetap/i)).toBeInTheDocument()
  })
})
