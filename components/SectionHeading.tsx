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
  align = "center",
  className,
}: SectionHeadingProps) {
  const centered = align === "center"
  return (
    <div className={cn("mb-10", centered ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary",
            centered && "justify-center",
          )}
        >
          {centered && <span aria-hidden className="h-px w-6 bg-gold/70" />}
          {eyebrow}
          {centered && <span aria-hidden className="h-px w-6 bg-gold/70" />}
        </p>
      ) : null}
      <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]",
            centered && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
