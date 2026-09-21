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

export default function UserMenu() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Link
        href="/masuk"
        className="hidden sm:flex items-center gap-1.5 rounded-xl border border-primary px-3.5 py-2 text-[12px] font-semibold tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
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
          className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle size={13} />
          Dashboard
        </Link>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
            <ChevronDown size={12} className="text-foreground/40 hidden sm:block" />
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
