import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { withMcpAuth } from "@neon/oauth/mcp/next"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { mcpAuth } from "@/lib/mcp/auth"
import { buildMcpServer } from "@/lib/mcp/server"
import { BRAND } from "@/lib/brand"

/**
 * MCP over Streamable HTTP, stateless. `withMcpAuth` answers a missing or bad
 * token with the 401 that starts Claude's OAuth sign-in (Neon Auth is the
 * authorization server); a valid token's `sub` is the Neon Auth user, and only
 * a profile with role='admin' may use the tools — the same gate as /admin.
 */
export const POST = withMcpAuth(mcpAuth, async (request, auth) => {
  const [profile] = await db
    .select({ id: profiles.id, name: profiles.fullName, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.authUserId, auth.sub))
    .limit(1)
  if (profile?.role !== "admin") {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: `Akun ini bukan admin ${BRAND.name}. Hubungkan dengan akun admin.` },
        id: null,
      },
      { status: 403 },
    )
  }

  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await buildMcpServer({ id: profile.id, name: profile.name }).connect(transport)
  return transport.handleRequest(request, { authInfo: mcpAuth.toAuthInfo(auth) })
})

// Stateless: no standalone SSE stream to open and no session to delete. The
// token is still checked first, so an unauthenticated GET starts sign-in.
const methodNotAllowed = withMcpAuth(mcpAuth, () =>
  Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null },
    { status: 405, headers: { Allow: "POST" } },
  ),
)

export const GET = methodNotAllowed
export const DELETE = methodNotAllowed
