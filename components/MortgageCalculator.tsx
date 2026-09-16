"use client"

import { useId, useState } from "react"
import { Calculator } from "lucide-react"
import { calculateMortgage } from "@/lib/mortgage"

const DEFAULT_DOWN_PAYMENT_PERCENT = 20
const DEFAULT_YEARS = 15
const DEFAULT_ANNUAL_RATE = 10

function rupiah(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`
}

export default function MortgageCalculator({ price }: { price: string }) {
  const listingPrice = Number.parseInt(price, 10)

  const [amount, setAmount] = useState(Number.isFinite(listingPrice) ? listingPrice : 0)
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT)
  const [years, setYears] = useState(DEFAULT_YEARS)
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULT_ANNUAL_RATE)

  const ids = useId()
  const fieldId = (name: string) => `${ids}-${name}`

  const result = calculateMortgage({ price: amount, downPaymentPercent, years, annualRatePercent })

  return (
    <section className="rounded-sm border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
        <Calculator className="h-4 w-4 text-primary" aria-hidden />
        Simulasi KPR
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor={fieldId("price")}
            className="block text-[13px] font-medium text-muted-foreground"
          >
            Harga properti (Rp)
          </label>
          <input
            id={fieldId("price")}
            type="number"
            min={0}
            step={1_000_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2 font-sans text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label
            htmlFor={fieldId("dp")}
            className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground"
          >
            Uang muka
            <span className="font-semibold text-foreground">{downPaymentPercent}%</span>
          </label>
          <input
            id={fieldId("dp")}
            type="range"
            min={0}
            max={100}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </div>

        <div>
          <label
            htmlFor={fieldId("tenor")}
            className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground"
          >
            Tenor
            <span className="font-semibold text-foreground">{years} tahun</span>
          </label>
          <input
            id={fieldId("tenor")}
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={fieldId("rate")}
            className="block text-[13px] font-medium text-muted-foreground"
          >
            Bunga per tahun (%)
          </label>
          <input
            id={fieldId("rate")}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={annualRatePercent}
            onChange={(e) => setAnnualRatePercent(Number(e.target.value))}
            className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2 font-sans text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="mt-6 rounded-sm bg-accent p-5 text-accent-foreground">
        {result ? (
          <>
            <p className="text-[12px] uppercase tracking-[0.16em] text-accent-foreground/70">
              Angsuran per bulan
            </p>
            <p className="mt-1 font-sans text-[30px] font-bold leading-none">
              {rupiah(result.monthly)}
            </p>
            <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-3">
              <div>
                <dt className="text-accent-foreground/70">Dana dipinjam</dt>
                <dd className="font-semibold">{rupiah(result.principal)}</dd>
              </div>
              <div>
                <dt className="text-accent-foreground/70">Total bunga</dt>
                <dd className="font-semibold">{rupiah(result.totalInterest)}</dd>
              </div>
              <div>
                <dt className="text-accent-foreground/70">Total dibayar</dt>
                <dd className="font-semibold">{rupiah(result.totalPayment)}</dd>
              </div>
            </dl>
          </>
        ) : amount > 0 ? (
          <p className="text-[14px]">
            Dengan uang muka {downPaymentPercent}% properti ini sudah lunas di muka — tidak ada
            yang perlu dicicil.
          </p>
        ) : (
          <p className="text-[14px]">Masukkan harga properti untuk melihat simulasi angsuran.</p>
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        Angka di atas adalah simulasi anuitas dengan bunga tetap. Angsuran sebenarnya bergantung
        pada kebijakan bank, asuransi, dan biaya provisi.
      </p>
    </section>
  )
}
