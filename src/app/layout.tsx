import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Serif_4, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Hit } from "@/components/Hit";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://westie.wiki"),
  title: {
    default: "Westie Wiki — West Coast Swing moves, documented by dancers",
    template: "%s · Westie Wiki",
  },
  description:
    "A community-edited catalog of West Coast Swing moves, video examples, and learning paths. Descriptive, not prescriptive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${sourceSerif.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Westie Wiki",
            url: "https://westie.wiki",
            description:
              "A community-edited catalog of West Coast Swing moves, video examples, and learning paths.",
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: "https://westie.wiki/search?q={search_term_string}" },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <Hit />
        <SiteHeader />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
