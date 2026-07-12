import { describe, expect, it } from "vitest";
import { diffLines } from "../diff";
import { slugify, uniqueSlug } from "../slug";
import { formatTimestamp, parseTimestamp } from "../time";
import { parseYoutubeUrl, youtubeEmbedUrl } from "../youtube";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Sugar Push")).toBe("sugar-push");
    expect(slugify("Whip with Inside Turn")).toBe("whip-with-inside-turn");
  });
  it("strips punctuation and diacritics", () => {
    expect(slugify("Spins & Turns!")).toBe("spins-turns");
    expect(slugify("Béla's Whip")).toBe("bela-s-whip");
  });
  it("handles empty input", () => {
    expect(slugify("!!!")).toBe("untitled");
  });
});

describe("uniqueSlug", () => {
  it("returns base when free", () => {
    expect(uniqueSlug("whip", () => false)).toBe("whip");
  });
  it("appends counter when taken", () => {
    const taken = new Set(["whip", "whip-2"]);
    expect(uniqueSlug("whip", (c) => taken.has(c))).toBe("whip-3");
  });
});

describe("parseTimestamp", () => {
  it("parses bare seconds", () => {
    expect(parseTimestamp("83")).toBe(83);
    expect(parseTimestamp("0")).toBe(0);
  });
  it("parses m:ss", () => {
    expect(parseTimestamp("1:23")).toBe(83);
    expect(parseTimestamp("10:05")).toBe(605);
  });
  it("parses h:mm:ss", () => {
    expect(parseTimestamp("1:02:03")).toBe(3723);
  });
  it("parses unit style", () => {
    expect(parseTimestamp("1m23s")).toBe(83);
    expect(parseTimestamp("2h")).toBe(7200);
    expect(parseTimestamp("90s")).toBe(90);
  });
  it("rejects garbage", () => {
    expect(parseTimestamp("")).toBeNull();
    expect(parseTimestamp("abc")).toBeNull();
    expect(parseTimestamp("1:99")).toBeNull();
  });
});

describe("formatTimestamp", () => {
  it("formats m:ss", () => {
    expect(formatTimestamp(83)).toBe("1:23");
    expect(formatTimestamp(5)).toBe("0:05");
  });
  it("formats h:mm:ss", () => {
    expect(formatTimestamp(3723)).toBe("1:02:03");
  });
});

describe("parseYoutubeUrl", () => {
  it("parses watch URLs", () => {
    expect(parseYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      id: "dQw4w9WgXcQ",
      startSec: null,
    });
  });
  it("parses short URLs with timestamps", () => {
    expect(parseYoutubeUrl("https://youtu.be/dQw4w9WgXcQ?t=90")).toEqual({
      id: "dQw4w9WgXcQ",
      startSec: 90,
    });
    expect(parseYoutubeUrl("https://youtu.be/dQw4w9WgXcQ?t=1m30s")).toEqual({
      id: "dQw4w9WgXcQ",
      startSec: 90,
    });
  });
  it("parses shorts and embed URLs", () => {
    expect(parseYoutubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeUrl("youtube.com/embed/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
  });
  it("accepts bare ids", () => {
    expect(parseYoutubeUrl("dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
  });
  it("rejects non-youtube URLs", () => {
    expect(parseYoutubeUrl("https://vimeo.com/12345")).toBeNull();
    expect(parseYoutubeUrl("not a url at all")).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  it("includes start and end", () => {
    const url = youtubeEmbedUrl("dQw4w9WgXcQ", 90, 120);
    expect(url).toContain("start=90");
    expect(url).toContain("end=120");
  });
  it("omits end when not after start", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", 90, 50)).not.toContain("end=");
  });
});

describe("diffLines", () => {
  it("marks equal content", () => {
    expect(diffLines("a\nb", "a\nb")).toEqual([
      { type: "equal", text: "a" },
      { type: "equal", text: "b" },
    ]);
  });
  it("detects additions and deletions", () => {
    const ops = diffLines("a\nb\nc", "a\nx\nc");
    expect(ops).toContainEqual({ type: "del", text: "b" });
    expect(ops).toContainEqual({ type: "add", text: "x" });
    expect(ops.filter((o) => o.type === "equal")).toHaveLength(2);
  });
  it("handles empty sides", () => {
    expect(diffLines("", "a")).toEqual([{ type: "add", text: "a" }]);
    expect(diffLines("a", "")).toEqual([{ type: "del", text: "a" }]);
    expect(diffLines("", "")).toEqual([]);
  });
});

describe("safeNextPath", () => {
  it("allows same-origin absolute paths", async () => {
    const { safeNextPath } = await import("../redirects");
    expect(safeNextPath("/moves/whip")).toBe("/moves/whip");
    expect(safeNextPath("/curricula/foo/edit?x=1")).toBe("/curricula/foo/edit?x=1");
  });
  it("rejects open-redirect vectors", async () => {
    const { safeNextPath } = await import("../redirects");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
    expect(safeNextPath("\\/evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("/ok/\\evil")).toBe("/");
  });
});

describe("diffLines pathological input", () => {
  it("survives huge many-line inputs without quadratic memory", () => {
    const a = Array.from({ length: 10000 }, (_, i) => `${i % 7}`).join("\n");
    const b = Array.from({ length: 10000 }, (_, i) => `${(i + 3) % 5}`).join("\n");
    const start = performance.now();
    const ops = diffLines(a, b);
    expect(performance.now() - start).toBeLessThan(2000);
    // coarse fallback still accounts for every line
    expect(ops.filter((o) => o.type !== "add")).toHaveLength(10000);
    expect(ops.filter((o) => o.type !== "del")).toHaveLength(10000);
  });
  it("still trims common prefix/suffix on large inputs", () => {
    const common = Array.from({ length: 5000 }, (_, i) => `line ${i}`);
    const a = [...common, "old middle", ...common].join("\n");
    const b = [...common, "new middle", ...common].join("\n");
    const ops = diffLines(a, b);
    expect(ops.filter((o) => o.type === "del")).toEqual([{ type: "del", text: "old middle" }]);
    expect(ops.filter((o) => o.type === "add")).toEqual([{ type: "add", text: "new middle" }]);
  });
});
