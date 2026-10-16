import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center"
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center"
  return (
    <div className={cn("mb-6", centered ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="mb-1 text-[13px] font-semibold text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-accent sm:text-3xl">{title}</h2>
      {subtitle ? (
        <p className={cn("mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground", centered && "mx-auto")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
