"use client"

import { useState } from "react"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building, Users, History, Mail, LogOut, Menu, X, Loader2 } from "lucide-react"
import { BRAND } from "@/lib/brand"

function SidebarContent({
  links,
  pathname,
  email,
  mobile,
  onClose,
}: {
  links: { href: string; icon: React.ComponentType<{ size?: number }>; label: string }[]
  pathname: string
  email: string
  mobile?: boolean
  onClose?: () => void
}) {
  const handleClose = () => onClose?.()
  return (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b flex items-center justify-between ${mobile ? "border-border/40" : ""}`}>
        <Link href="/admin" className="flex items-center gap-2" onClick={handleClose}>
          <span className="w-2 h-2 rounded-full bg-brown-500" />
          <span className="font-display font-bold text-lg italic">{BRAND.name}</span>
          <span className="text-[10px] bg-brown-100 text-brown-700 px-1.5 py-0.5 rounded font-semibold ml-auto">
            ADMIN
          </span>
        </Link>
        {mobile && (
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brown-50 text-brown-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t">
        <div className="text-xs text-muted-foreground px-2 mb-2 truncate">{email}</div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={14} />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === "loading") return (
    <div className="h-screen flex items-center justify-center bg-muted/30">
      <Loader2 className="animate-spin text-muted-foreground" size={24} />
    </div>
  )
  if (!session || session.user.role !== "admin") {
    redirect("/masuk")
  }

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/properti", icon: Building, label: "Properti" },
    { href: "/admin/agent", icon: Users, label: "Agent" },
    { href: "/admin/leads", icon: Mail, label: "Leads" },
    { href: "/admin/aktivitas", icon: History, label: "Aktivitas" },
  ]

  return (
    <div className="h-screen flex overflow-hidden">
      <aside className="hidden md:flex w-56 border-r bg-card shrink-0 flex-col">
        <SidebarContent links={links} pathname={pathname} email={session.user.email ?? ""} />
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-background/95 backdrop-blur border-b flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-muted rounded-md">
          <Menu size={20} />
        </button>
        <Link href="/admin" className="flex items-center gap-2 ml-3 flex-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brown-500" />
          <span className="font-display font-bold text-base italic">{BRAND.name}</span>
        </Link>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-xl border-r">
            <SidebarContent
              links={links}
              pathname={pathname}
              email={session.user.email ?? ""}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 bg-muted/30 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
