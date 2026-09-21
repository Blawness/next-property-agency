"use client"

import Link from "next/link"
import { isHashLink } from "@/components/navbar/nav-links"

interface NavLinkProps {
  href: string
  id: string
  className: string
  onNavigate?: () => void
  children: React.ReactNode
}

/**
 * One place decides anchor vs Link, so the desktop bar and the mobile drawer
 * cannot drift apart. Route links used to be plain anchors in both, which meant
 * every visit to /properti or /agen reloaded the entire app shell.
 */
export default function NavLink({ href, id, className, onNavigate, children }: NavLinkProps) {
  if (isHashLink(href)) {
    return (
      <a href={href} data-nav={id} onClick={onNavigate} className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} data-nav={id} onClick={onNavigate} className={className}>
      {children}
    </Link>
  )
}
