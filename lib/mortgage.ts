export interface MortgageInput {
  /** Listing price in rupiah. */
  price: number
  /** Share of the price paid up front, 0–100. */
  downPaymentPercent: number
  /** Tenor in years. */
  years: number
  /** Nominal annual rate in percent, e.g. 10.5. */
  annualRatePercent: number
}

export interface MortgageResult {
  /** Amount actually financed, after the down payment. */
  principal: number
  months: number
  monthly: number
  totalPayment: number
  totalInterest: number
}

/**
 * Standard annuity (flat instalment) KPR maths — the same shape Indonesian
 * banks quote in their simulators:
 *
 *   M = P·i / (1 − (1 + i)^−n)
 *
 * Returns null rather than NaN or Infinity whenever the inputs describe
 * nothing to finance, so the UI can simply not render a figure.
 */
export function calculateMortgage({
  price,
  downPaymentPercent,
  years,
  annualRatePercent,
}: MortgageInput): MortgageResult | null {
  const inputs = [price, downPaymentPercent, years, annualRatePercent]
  if (inputs.some((n) => !Number.isFinite(n))) return null

  if (price <= 0) return null
  if (downPaymentPercent < 0 || downPaymentPercent > 100) return null
  if (annualRatePercent < 0) return null

  const months = Math.round(years * 12)
  if (months <= 0) return null

  const principal = price * (1 - downPaymentPercent / 100)
  if (principal <= 0) return null

  const monthlyRate = annualRatePercent / 100 / 12
  const monthly =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))

  const totalPayment = monthly * months

  return {
    principal,
    months,
    monthly,
    totalPayment,
    totalInterest: totalPayment - principal,
  }
}
