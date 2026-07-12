export function SearchBar() {
  return (
    <form action="/search" className="hidden md:block">
      <input
        type="search"
        name="q"
        placeholder="Search moves, dancers…"
        aria-label="Search"
        className="bg-ink-soft/60 border border-ink-soft rounded-md px-3 py-1.5 text-sm text-paper placeholder:text-paper/50 w-52 focus:outline-none focus:ring-2 focus:ring-amber/70 font-display"
      />
    </form>
  );
}
