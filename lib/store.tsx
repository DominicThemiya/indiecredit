"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { canned } from "./canned";
import { seedState } from "./seed";
import type { AiTask, DemoState, Rec } from "./types";

const KEY = "indiecredit-demo-v1";

interface Store {
  state: DemoState;
  update: (fn: (s: DemoState) => DemoState) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const update = useCallback((fn: (s: DemoState) => DemoState) => setState(fn), []);
  const reset = useCallback(() => setState(seedState()), []);

  return <Ctx.Provider value={{ state, update, reset }}>{hydrated ? children : null}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export function newRecord(r: Omit<Rec, "id" | "date"> & { date?: string }): Rec {
  return { id: crypto.randomUUID(), date: new Date().toISOString(), ...r };
}

export async function callAI<T>(task: AiTask, input: string, context?: unknown): Promise<{ data: T; simulated: boolean }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, input, context }),
    });
    if (!res.ok) throw new Error(`AI route ${res.status}`);
    return await res.json();
  } catch {
    // Even if the route itself is unreachable, keep the demo moving.
    await new Promise((r) => setTimeout(r, 700));
    return { data: canned(task) as T, simulated: true };
  }
}

export const money = (n: number | null) =>
  n == null ? "-" : n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
