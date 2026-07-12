import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/profile",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/s/",
          "/search",
          "/*/edit",
          "/moves/new",
          "/dances/new",
          "/curricula/new",
        ],
      },
    ],
    sitemap: "https://westie.wiki/sitemap.xml",
  };
}
