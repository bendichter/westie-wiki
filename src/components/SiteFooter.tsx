import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-paper/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-display text-lg font-bold text-paper">
            Westie<span className="text-amber">&nbsp;Wiki</span>
          </div>
          <p className="mt-2 leading-relaxed">
            A community-edited catalog of West Coast Swing moves, video examples, and learning
            paths. Anyone can browse; make an account to contribute.
          </p>
        </div>
        <div className="font-display">
          <div className="text-paper font-semibold mb-2">Explore</div>
          <ul className="space-y-1">
            <li><Link href="/moves" className="hover:text-paper hover:underline">All moves</Link></li>
            <li><Link href="/dancers" className="hover:text-paper hover:underline">Dancers</Link></li>
            <li><Link href="/events" className="hover:text-paper hover:underline">Events</Link></li>
            <li><Link href="/curricula" className="hover:text-paper hover:underline">Curricula</Link></li>
            <li><Link href="/changes" className="hover:text-paper hover:underline">Recent changes</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-paper font-semibold mb-2">The fine print</div>
          <p className="leading-relaxed">
            This wiki is <strong className="text-paper/90">descriptive, not prescriptive</strong>. It records
            how the community names and dances moves — it is a learning tool, not a source of truth
            about West Coast Swing. Styles vary, names collide, and that&apos;s part of the dance.{" "}
            <Link href="/about" className="underline hover:text-paper">About this project</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
