import { createMetadataHandlers } from "@neon/oauth/mcp/next"
import { mcpAuth } from "@/lib/mcp/auth"

// RFC 9728: tells MCP clients (Claude) that Neon Auth is the authorization
// server for /api/mcp. The catch-all serves both the bare URL and the
// path-suffixed one clients try first.
export const { GET, OPTIONS } = createMetadataHandlers(mcpAuth)
