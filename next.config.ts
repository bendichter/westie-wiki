import type { NextConfig } from "next";

const securityHeaders = [
  // HTTPS only (Fly already redirects http → https; this stops the downgrade window)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Nobody may frame the site, so one-click action buttons can't be clickjacked.
  // X-Frame-Options covers browsers that ignore frame-ancestors.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // YouTube embeds need at least the origin as referrer, so keep the browser default
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
