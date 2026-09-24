"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UserMenu({ light = false }: { light?: boolean }) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Link
        href="/masuk"
        className={cn(
          "hidden sm:flex h-9 items-center border px-5 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors duration-300",
          light
            ? "border-white/50 text-white hover:bg-white hover:text-foreground"
            : "border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        )}
      >
        Masuk
      </Link>
    )
  }

  return (
    <>
      {session.user.role === "admin" ? (
        <Link
          href="/admin"
          className="hidden sm:flex h-9 items-center gap-2 bg-primary px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle size={13} />
          Dashboard
        </Link>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              light ? "hover:bg-white/10" : "hover:bg-muted",
            )}
          >
            <div className="h-7 w-7 rounded-full bg-secondary border-2 border-border flex items-center justify-center shrink-0 overflow-hidden">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-bold text-primary">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
            <ChevronDown size={12} className={cn("hidden sm:block", light ? "text-white/70" : "text-foreground/40")} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-[13px] font-semibold truncate leading-tight">
              {session.user.name ?? "Pengguna"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {session.user.email}
            </p>
          </div>

          <DropdownMenuItem asChild className="mt-1 cursor-pointer">
            <Link href="/profil">Profil &amp; Favorit</Link>
          </DropdownMenuItem>

          {session.user.role === "admin" && (
            <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
              <Link href="/admin">Dashboard</Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
