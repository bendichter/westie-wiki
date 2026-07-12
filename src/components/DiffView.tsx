import { diffLines } from "@/lib/diff";

export function DiffView({ before, after }: { before: string; after: string }) {
  const ops = diffLines(before, after);
  if (ops.every((op) => op.type === "equal")) {
    return <p className="text-sm text-muted font-display italic">No changes to the description.</p>;
  }

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-panel font-mono text-[13px] leading-relaxed">
      {ops.map((op, i) => (
        <div
          key={i}
          className={
            op.type === "add"
              ? "bg-success/10 text-success px-3 py-0.5 whitespace-pre-wrap"
              : op.type === "del"
                ? "bg-danger/10 text-danger px-3 py-0.5 whitespace-pre-wrap line-through decoration-danger/40"
                : "px-3 py-0.5 whitespace-pre-wrap text-ink-soft"
          }
        >
          <span className="select-none inline-block w-4 text-muted/70">
            {op.type === "add" ? "+" : op.type === "del" ? "−" : " "}
          </span>
          {op.text || " "}
        </div>
      ))}
    </div>
  );
}
