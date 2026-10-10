import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-navy/10 bg-white p-6 shadow-sm ${className}`}>{children}</section>;
}

const VARIANTS = {
  primary: "bg-rust text-white hover:bg-rust/90",
  navy: "bg-navy text-white hover:bg-navy/90",
  ghost: "border-2 border-navy/20 text-navy hover:border-navy/50 bg-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS }) {
  return (
    <button
      {...props}
      className={`rounded-xl px-5 py-3 text-lg font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Status({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold whitespace-nowrap ${
        ok ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
      }`}
    >
      <span aria-hidden>{ok ? "✓" : "!"}</span>
      {children}
    </span>
  );
}

export function AiBadge({ simulated }: { simulated: boolean }) {
  return simulated ? (
    <span className="rounded-full border border-navy/30 px-3 py-1 text-sm font-semibold text-navy/70">Simulated AI</span>
  ) : (
    <span className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-apricot">Live AI</span>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-3xl text-xl text-navy/70">{sub}</p>
      </div>
      {children}
    </header>
  );
}

export const textareaClass =
  "w-full rounded-xl border-2 border-navy/15 bg-cream/60 p-4 text-lg leading-relaxed focus:border-rust focus:outline-none";
