import {
  Calculator,
  FileCheck,
  Heart,
  KeyRound,
  Map as MapIcon,
  MessageCircle,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BRAND } from "@/lib/brand"

type BenefitIcon = (typeof BRAND.benefits.items)[number]["icon"]

const ICONS: Record<BenefitIcon, LucideIcon> = {
  FileCheck,
  Users,
  MessageCircle,
  Calculator,
  Map: MapIcon,
  SlidersHorizontal,
  Heart,
  KeyRound,
}

export default function BenefitsGrid() {
  const { benefits } = BRAND
  return (
    <section className="bg-muted">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-accent sm:text-2xl">{benefits.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{benefits.subtitle}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {benefits.items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.title}>
                <Card className="h-full ring-0">
                  <CardContent className="sm:px-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={20} aria-hidden />
                    </span>
                    <h3 className="mt-3 text-[15px] font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
