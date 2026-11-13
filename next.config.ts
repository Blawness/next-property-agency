import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP only (Next's default). AVIF was measured at quality 75 on these
    // photographs and came out no smaller than WebP (hero at 1920w: 377KB vs
    // 386KB; at 1080w: 144KB vs 140KB), for a slower encode and a second
    // cache variant per image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Neon Object Storage, bucket `property-images` (lib/storage.ts). The
        // host carries the branch id, so any branch's endpoint is allowed.
        protocol: "https",
        hostname: "**.aws.neon.tech",
        pathname: "/property-images/**",
      },
    ],
  },

  // The map is a view of the catalog now, not a page of its own. A framework
  // redirect gives bookmarks and crawlers a real 308; a page calling redirect()
  // was prerendered as a 200 HTML shell, which is not a redirect to a bot.
  async redirects() {
    return [{ source: "/peta", destination: "/properti?view=peta", permanent: true }]
  },

  // The OAuth sign-in and consent pages (Neon Auth's login/consent pages for
  // Claude's connector) must not be framed, or a page could overlay "Izinkan".
  async headers() {
    const noFraming = [{ key: "Content-Security-Policy", value: "frame-ancestors 'none'" }]
    return [
      { source: "/masuk", headers: noFraming },
      { source: "/oauth/persetujuan", headers: noFraming },
    ]
  },
};

export default nextConfig;
