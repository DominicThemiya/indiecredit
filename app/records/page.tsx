"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { fmtDate, money, useStore } from "@/lib/store";

export default function RecordsPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState("all");
  const name = (id: string) => {
    const e = state.engagements.find((x) => x.id === id);
    return e ? `${e.title} - ${e.freelancer}` : id;
  };
  const rows = state.records
    .filter((r) => filter === "all" || r.engagementId === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title="Records" sub="Every step of every job, kept as it happens. Newest first.">
        <label className="flex items-center gap-3 font-semibold">
          Engagement
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border-2 border-navy/20 bg-white px-4 py-2.5 text-lg font-normal"
          >
            <option value="all">All engagements</option>
            {state.engagements.map((e) => (
              <option key={e.id} value={e.id}>
                {name(e.id)}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>

      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left">
          <thead className="bg-navy text-base text-white">
            <tr>
              {["Date", "Type", "Engagement", "Amount", "Source"].map((h) => (
                <th key={h} className={`px-5 py-3 font-semibold ${h === "Amount" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-5 py-4">{fmtDate(r.date)}</td>
                <td className="px-5 py-4">
                  <div className="font-semibold">{r.type}</div>
                  <div className="text-base text-navy/70">{r.summary}</div>
                </td>
                <td className="px-5 py-4">{name(r.engagementId)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums">{money(r.amount)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-base font-medium ${
                      r.source === "Forwarded email" ? "bg-apricot/30 text-navy" : "bg-navy/10 text-navy"
                    }`}
                  >
                    {r.source}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-navy/60">
                  No records for this engagement yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="mt-4 text-navy/70">
        {rows.length} {rows.length === 1 ? "record" : "records"} shown
      </p>
    </>
  );
}
