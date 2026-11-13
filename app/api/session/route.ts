import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

/** The signed-in user with their app role, for `useSession()` in the browser. */
export async function GET() {
  const session = await getSession()
  return NextResponse.json(session, { headers: { "Cache-Control": "no-store" } })
}
