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
        className="hidden h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
      >
        Masuk / Daftar
      </Link>
    )
  }

  return (
    <>
      {session.user.role === "admin" ? (
        <Link
          href="/admin"
          className="hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
        >
          <PlusCircle size={13} />
          Dashboard
        </Link>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
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
            <ChevronDown size={12} className="hidden text-foreground/40 sm:block" />
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
