import { createMcpAuth } from "@neon/oauth/mcp"
import { SITE_URL } from "@/lib/constants"

/**
 * The MCP endpoint's public URL. Neon Auth's OAuth server issues tokens whose
 * `aud` is exactly this, so it must equal the branch's `--mcp-resource`
 * (`neon neon-auth config oauth-server get`) — https://trihuni.id/api/mcp in
 * production, http://localhost:3001/api/mcp when testing locally.
 */
export const MCP_RESOURCE = new URL("/api/mcp", SITE_URL).href

/** Verifies Neon Auth access tokens (signature, `iss`, `aud`) for `/api/mcp`. */
export const mcpAuth = createMcpAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  resource: MCP_RESOURCE,
})
