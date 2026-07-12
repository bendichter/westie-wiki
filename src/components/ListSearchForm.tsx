/**
 * Inline search form for list pages. GET-submits to `basePath`, preserving
 * the given params as hidden inputs (page intentionally resets on new search).
 */
export function ListSearchForm({
  basePath,
  query,
  placeholder,
  preserve = {},
}: {
  basePath: string;
  query: string;
  placeholder: string;
  preserve?: Record<string, string | undefined>;
}) {
  return (
    <form action={basePath} className="mb-5 flex max-w-md gap-2">
      {Object.entries(preserve).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null
      )}
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 rounded-md border border-line bg-panel px-3 py-2 font-display text-[15px] placeholder:text-muted/60 focus:border-denim focus:outline-none focus:ring-2 focus:ring-denim/50"
      />
      <button
        type="submit"
        className="cursor-pointer rounded-md bg-denim px-4 font-display text-sm font-semibold text-white hover:bg-denim-deep"
      >
        Search
      </button>
    </form>
  );
}
