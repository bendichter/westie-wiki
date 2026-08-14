import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { logout } from "@/lib/actions/auth";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { TaglineBanner } from "./TaglineBanner";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

const NAV = [
  { href: "/dances", label: "Dances" },
  { href: "/moves", label: "Moves" },
  { href: "/curricula", label: "Curricula" },
  { href: "/loop", label: "Loop" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 py-3 flex-wrap">
          <Link href="/" className="group shrink-0">
            <span className="font-display text-2xl font-bold tracking-tight">
              Westie<span className="text-amber">&nbsp;Wiki</span>
            </span>
            <div className="slot-line !bg-ink-soft mt-0.5 transition-all" aria-hidden />
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm font-display sm:order-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-paper/80 hover:text-paper hover:underline underline-offset-4"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-paper/80 hover:text-paper hover:underline underline-offset-4 md:hidden"
            >
              Search
            </Link>
          </nav>
          <MobileNav />

          <div className="flex items-center gap-3 ml-auto order-2 sm:order-3">
            <SearchBar />
            {user ? (
              <div className="flex items-center gap-3 text-sm font-display">
                {isAdmin(user) ? (
                  <Link
                    href="/admin/moderation"
                    className="text-amber/90 hover:text-amber hover:underline underline-offset-4"
                  >
                    Admin
                  </Link>
                ) : null}
                <Link href="/profile" className="text-paper/90 hover:text-paper hover:underline underline-offset-4">
                  {user.username}
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-paper/60 hover:text-paper cursor-pointer"
                    title="Log out"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-display">
                <Link href="/login" className="text-paper/90 hover:text-paper hover:underline underline-offset-4">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-amber text-white rounded-md px-3 py-1.5 hover:bg-amber/85 font-medium"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {user && user.emailVerifiedAt == null ? <VerifyEmailBanner /> : null}
      <TaglineBanner />
    </header>
  );
}
