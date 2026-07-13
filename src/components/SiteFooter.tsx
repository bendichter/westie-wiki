import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-paper/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <div className="font-display text-lg font-bold text-paper">
            Westie<span className="text-amber">&nbsp;Wiki</span>
          </div>
          <p className="mt-2 leading-relaxed max-w-md">
            A community-edited catalog of West Coast Swing moves, video examples, and learning
            paths. Anyone can browse; make an account to contribute.
          </p>
        </div>
        <div className="font-display sm:justify-self-end">
          <div className="text-paper font-semibold mb-2">Explore</div>
          <ul className="space-y-1">
            <li><Link href="/moves" className="hover:text-paper hover:underline">All moves</Link></li>
            <li><Link href="/dances" className="hover:text-paper hover:underline">Dances</Link></li>
            <li><Link href="/dancers" className="hover:text-paper hover:underline">Dancers</Link></li>
            <li><Link href="/events" className="hover:text-paper hover:underline">Events</Link></li>
            <li><Link href="/curricula" className="hover:text-paper hover:underline">Curricula</Link></li>
            <li><Link href="/changes" className="hover:text-paper hover:underline">Recent changes</Link></li>
            <li><Link href="/contributors" className="hover:text-paper hover:underline">Contributors</Link></li>
            <li><Link href="/guidelines" className="hover:text-paper hover:underline">Contribution guidelines</Link></li>
            <li><Link href="/sponsor" className="hover:text-paper hover:underline">Sponsor the wiki</Link></li>
            <li><Link href="/about" className="hover:text-paper hover:underline">About</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
