"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { isHashLink } from "@/components/navbar/nav-links"

interface NavLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string
  /** Called after a click, e.g. to close the mobile drawer. */
  onNavigate?: () => void
}

/**
 * One place decides anchor vs Link, so the desktop dropdowns and the mobile
 * drawer cannot drift apart. Route links used to be plain anchors in both,
 * which meant every visit to /properti reloaded the entire app shell. Extra
 * props and the ref pass through, so Radix can wrap it with `asChild`.
 */
export default function NavLink({ href, onNavigate, onClick, ...rest }: NavLinkProps) {
  const handleClick: NavLinkProps["onClick"] = (event) => {
    onClick?.(event)
    onNavigate?.()
  }

  if (isHashLink(href)) {
    return <a href={href} onClick={handleClick} {...rest} />
  }

  return <Link href={href} onClick={handleClick} {...rest} />
}
