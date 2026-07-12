import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "westie.wiki";
const REDIRECT_HOSTS = new Set(["www.westie.wiki", "westie-wiki.fly.dev"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (REDIRECT_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // skip static assets; everything else gets the host check
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
