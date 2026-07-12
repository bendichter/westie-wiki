import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

const fontDir = path.join(process.cwd(), "src", "assets", "fonts");

export function ogFonts() {
  return [
    {
      name: "Bricolage",
      data: fs.readFileSync(path.join(fontDir, "BricolageGrotesque-Regular.ttf")),
      weight: 400 as const,
    },
    {
      name: "Bricolage",
      data: fs.readFileSync(path.join(fontDir, "BricolageGrotesque-Bold.ttf")),
      weight: 700 as const,
    },
  ];
}

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared card chrome: paper background, slot line, wordmark footer. */
export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f6f6f2",
        padding: "72px 80px",
        fontFamily: "Bricolage",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 28,
            color: "#b8681b",
            textTransform: "uppercase",
            letterSpacing: 6,
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: title.length > 26 ? 72 : 96,
            fontWeight: 700,
            color: "#212842",
            lineHeight: 1.05,
            marginTop: 24,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 34, color: "#6b7086", marginTop: 24 }}>{subtitle}</div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* the slot line */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#b8681b",
            }}
          />
          <div style={{ flex: 1, height: 3, backgroundColor: "#deddd3" }} />
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#b8681b",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#212842" }}>
            <span>Westie&nbsp;</span>
            <span style={{ color: "#b8681b" }}>Wiki</span>
          </div>
          <div style={{ fontSize: 28, color: "#6b7086" }}>westie.wiki</div>
        </div>
      </div>
    </div>
  );
}

export function ogResponse(card: ReactElement) {
  return new ImageResponse(card, { ...OG_SIZE, fonts: ogFonts() });
}
