import { calculateMortgage } from "@/lib/mortgage"

describe("calculateMortgage", () => {
  it("returns the annuity instalment for a standard KPR", () => {
    // Rp 1 M, 20% DP, 15 years at 10%/yr → Rp 800 jt financed.
    const result = calculateMortgage({
      price: 1_000_000_000,
      downPaymentPercent: 20,
      years: 15,
      annualRatePercent: 10,
    })
    expect(result).not.toBeNull()
    expect(result!.principal).toBe(800_000_000)
    expect(result!.monthly).toBeCloseTo(8_596_840.94, 1)
  })

  it("reports the total paid and the interest on top of the principal", () => {
    const result = calculateMortgage({
      price: 1_000_000_000,
      downPaymentPercent: 20,
      years: 15,
      annualRatePercent: 10,
    })!
    expect(result.totalPayment).toBeCloseTo(1_547_431_369.5, 0)
    expect(result.totalInterest).toBeCloseTo(747_431_369.5, 0)
    expect(result.months).toBe(180)
  })

  it("handles a different tenor and rate", () => {
    const result = calculateMortgage({
      price: 1_000_000_000,
      downPaymentPercent: 30,
      years: 20,
      annualRatePercent: 11.5,
    })!
    expect(result.monthly).toBeCloseTo(7_465_007.42, 1)
  })

  it("splits the principal evenly when the rate is zero", () => {
    const result = calculateMortgage({
      price: 500_000_000,
      downPaymentPercent: 0,
      years: 10,
      annualRatePercent: 0,
    })!
    expect(result.monthly).toBeCloseTo(500_000_000 / 120, 6)
    expect(result.totalInterest).toBeCloseTo(0, 6)
  })

  it("accepts a fractional down payment percentage", () => {
    const result = calculateMortgage({
      price: 1_000_000_000,
      downPaymentPercent: 12.5,
      years: 10,
      annualRatePercent: 9,
    })!
    expect(result.principal).toBe(875_000_000)
  })

  it("returns null when the whole price is paid up front", () => {
    expect(
      calculateMortgage({
        price: 1_000_000_000,
        downPaymentPercent: 100,
        years: 10,
        annualRatePercent: 9,
      }),
    ).toBeNull()
  })

  it("returns null for a tenor of zero", () => {
    expect(
      calculateMortgage({
        price: 1_000_000_000,
        downPaymentPercent: 20,
        years: 0,
        annualRatePercent: 9,
      }),
    ).toBeNull()
  })

  it("returns null for a price that is missing or not positive", () => {
    const base = { downPaymentPercent: 20, years: 10, annualRatePercent: 9 }
    expect(calculateMortgage({ ...base, price: 0 })).toBeNull()
    expect(calculateMortgage({ ...base, price: -1 })).toBeNull()
    expect(calculateMortgage({ ...base, price: Number.NaN })).toBeNull()
  })

  it("returns null for out-of-range percentages", () => {
    const base = { price: 1_000_000_000, years: 10, annualRatePercent: 9 }
    expect(calculateMortgage({ ...base, downPaymentPercent: -5 })).toBeNull()
    expect(calculateMortgage({ ...base, downPaymentPercent: 101 })).toBeNull()
    expect(
      calculateMortgage({ price: 1_000_000_000, downPaymentPercent: 20, years: 10, annualRatePercent: -1 }),
    ).toBeNull()
  })

  it("returns null when an input is not a finite number", () => {
    expect(
      calculateMortgage({
        price: 1_000_000_000,
        downPaymentPercent: 20,
        years: Number.POSITIVE_INFINITY,
        annualRatePercent: 9,
      }),
    ).toBeNull()
  })
})
