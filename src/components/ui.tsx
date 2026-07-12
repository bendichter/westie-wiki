import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function inputClass(extra = ""): string {
  return `w-full bg-panel border border-line rounded-md px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-denim/50 focus:border-denim placeholder:text-muted/60 ${extra}`;
}

export function Input(props: ComponentProps<"input">) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={inputClass(className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={inputClass(className)} />;
}

export function Select(props: ComponentProps<"select">) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={inputClass(`cursor-pointer ${className}`)} />;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block font-display text-sm font-semibold text-ink-soft mb-1">
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-muted mt-1 font-display">{children}</p>;
}

export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="bg-danger/8 border border-danger/30 text-danger rounded-md px-3 py-2 text-sm font-display"
    >
      {error}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={`bg-denim text-white font-display font-semibold rounded-md px-4 py-2 text-sm hover:bg-denim-deep disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...rest
}: ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={`bg-panel border border-line text-ink font-display font-semibold rounded-md px-4 py-2 text-sm hover:border-denim hover:text-denim disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-denim text-white hover:bg-denim-deep"
      : "bg-panel border border-line text-ink hover:border-denim hover:text-denim";
  return (
    <Link
      href={href}
      className={`inline-block font-display font-semibold rounded-md px-4 py-2 text-sm ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-panel border border-line rounded-lg p-5 ${className}`}>{children}</div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{children}</h1>
      {sub ? <p className="text-muted mt-1 font-display text-[15px]">{sub}</p> : null}
      <div className="slot-line mt-3" aria-hidden />
    </div>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const colors: Record<string, string> = {
    beginner: "bg-success/10 text-success border-success/30",
    intermediate: "bg-amber/10 text-amber border-amber/30",
    advanced: "bg-danger/10 text-danger border-danger/30",
  };
  return (
    <span
      className={`inline-block border rounded-full px-2.5 py-0.5 text-xs font-display font-semibold ${colors[difficulty] ?? ""}`}
    >
      {difficulty}
    </span>
  );
}

export function TagChip({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/moves?tag=${encodeURIComponent(slug)}`}
      className="inline-block bg-denim/8 border border-denim/25 text-denim rounded-full px-2.5 py-0.5 text-xs font-display font-medium hover:bg-denim/15"
    >
      {name}
    </Link>
  );
}

export function CountChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block font-mono text-[11px] bg-ink/5 border border-line rounded px-1.5 py-0.5 text-ink-soft">
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line rounded-lg py-10 px-6 text-center bg-panel/50">
      <div className="font-display font-semibold text-ink-soft">{title}</div>
      {children ? <div className="text-muted text-sm mt-2 font-display">{children}</div> : null}
    </div>
  );
}
