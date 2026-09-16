import { Skeleton } from "@/components/ui/skeleton"

export default function PetaLoading() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="h-[calc(100vh-280px)] min-h-[480px] bg-muted/40 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </div>
    </div>
  )
}
