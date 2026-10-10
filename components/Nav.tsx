"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/new-job", label: "New Job" },
  { href: "/project", label: "Project" },
  { href: "/inbox", label: "Inbox" },
  { href: "/records", label: "Records" },
  { href: "/claim", label: "Claim Readiness" },
];

export function Nav() {
  const path = usePathname();
  const { reset } = useStore();
  return (
    <nav className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4">
        <Link href="/claim" className="font-heading text-2xl font-bold tracking-tight">
          Indie<span className="text-apricot">Credit</span>
        </Link>
        <div className="flex flex-1 flex-wrap gap-x-6 gap-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`border-b-2 py-1 text-lg font-medium transition ${
                path === l.href ? "border-apricot text-apricot" : "border-transparent text-white/80 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => {
            if (confirm("Reset the demo to its starting data?")) reset();
          }}
          className="cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 text-base text-white/80 hover:border-white hover:text-white"
        >
          Reset demo
        </button>
      </div>
    </nav>
  );
}
