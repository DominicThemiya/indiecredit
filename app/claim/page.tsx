"use client";

import { useEffect, useState } from "react";
import { Button, Card, PageHeader, Status, textareaClass } from "@/components/ui";
import { checklist, type CheckItem } from "@/lib/readiness";
import { STUDIO } from "@/lib/seed";
import { fmtDate, newRecord, useStore } from "@/lib/store";
import type { DemoState, Engagement } from "@/lib/types";

function draftRequest(e: Engagement, gaps: CheckItem[]) {
  const first = e.freelancer.split(" ")[0];
  const asks = gaps.map((g) =>
    g.key === "ip"
      ? `- A short signed note confirming that the rights to the "${e.title}" work are assigned to ${STUDIO.name} (we can send a one-page template).`
      : `- A quick confirmation that you were a Nova Scotia resident while you worked on this project (a reply to this message is enough).`
  );
  return `Hi ${first},

Thanks again for the great work on "${e.title}". We're tidying up our project records and are missing ${
    gaps.length === 1 ? "one small thing" : "a couple of small things"
  } from you:

${asks.join("\n")}

No rush - whenever you have five minutes this week would be wonderful. Let us know if you have any questions.

Thanks so much,
${STUDIO.name}`;
}

const csvCell = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function exportPackage(state: DemoState) {
  const title = (id: string) => {
    const e = state.engagements.find((x) => x.id === id);
    return e ? `${e.title} - ${e.freelancer}` : id;
  };
  const rows: (string | number | null)[][] = [
    ["IndieCredit accountant package"],
    ["Studio", `${STUDIO.name}, ${STUDIO.location}`],
    ["Exported", new Date().toISOString()],
    ["Note", "Organized records for your accountant's review. Not tax advice."],
    [],
    ["SUMMARY"],
    ["Engagement", "Records", "Total invoiced / paid (CAD)", "Checklist", "Gaps", "Human review"],
    ...state.engagements.map((e) => {
      const items = checklist(state.records, e.id);
      const mine = state.records.filter((r) => r.engagementId === e.id);
      const total = mine
        .filter((r) => r.type === "Invoice" || r.type === "Payment proof")
        .reduce((sum, r) => sum + (r.amount ?? 0), 0);
      return [
        title(e.id),
        mine.length,
        total.toFixed(2),
        `${items.filter((i) => i.done).length} of ${items.length} complete`,
        items.filter((i) => !i.done).map((i) => i.label).join("; ") || "None",
        e.reviewStatus,
      ];
    }),
    [],
    ["RECORDS"],
    ["Date", "Type", "Engagement", "Amount (CAD)", "Source", "Summary"],
    ...[...state.records]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [r.date.slice(0, 10), r.type, title(r.engagementId), r.amount?.toFixed(2) ?? "", r.source, r.summary]),
  ];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "indiecredit-accountant-package.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function EngagementCard({ e }: { e: Engagement }) {
  const { state, update } = useStore();
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const items = checklist(state.records, e.id);
  const gaps = items.filter((i) => !i.done);
  const askable = gaps.filter((i) => i.askable);
  const ready = gaps.length === 0;
  const lastRecord = state.records.filter((r) => r.engagementId === e.id).sort((a, b) => b.date.localeCompare(a.date))[0];

  const setReview = (reviewStatus: Engagement["reviewStatus"]) =>
    update((s) => ({ ...s, engagements: s.engagements.map((x) => (x.id === e.id ? { ...x, reviewStatus } : x)) }));

  const markReceived = () => {
    update((s) => ({
      ...s,
      records: [
        ...s.records,
        ...askable.map((g) =>
          newRecord({
            type: g.recordType,
            engagementId: e.id,
            amount: null,
            source: "Forwarded email",
            summary: `${g.label} received from ${e.freelancer} (simulated reply)`,
          })
        ),
      ],
    }));
    setDraft(null);
  };

  return (
    <Card className={`border-l-8 ${ready ? "border-l-emerald-600" : "border-l-amber-500"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">{e.title}</h2>
          <p className="text-navy/70">
            {e.freelancer} · {e.role}
            {lastRecord && <> · last record {fmtDate(lastRecord.date)}</>}
          </p>
        </div>
        <Status ok={ready}>
          {ready ? "Ready for review" : `${gaps.length} ${gaps.length === 1 ? "gap" : "gaps"} to close`}
        </Status>
      </div>

      <ul className="mt-5 divide-y divide-navy/10">
        {items.map((i) => (
          <li key={i.key} className="flex items-center justify-between gap-4 py-3">
            <span className="text-xl">{i.label}</span>
            <Status ok={i.done}>{i.done ? "Complete" : "Missing"}</Status>
          </li>
        ))}
      </ul>

      {draft !== null && (
        <div className="mt-4 rounded-xl bg-cream p-4">
          <p className="mb-2 font-semibold">Draft request to {e.freelancer} - edit before sending</p>
          <textarea className={textareaClass} rows={11} value={draft} onChange={(ev) => setDraft(ev.target.value)} />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button
              variant="navy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(draft);
                } catch {}
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy message"}
            </Button>
            <Button variant="ghost" onClick={markReceived}>
              Mark as received (simulated)
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {askable.length > 0 && draft === null && (
          <Button onClick={() => setDraft(draftRequest(e, askable))}>Ask freelancer</Button>
        )}
        <Button variant="navy" disabled={e.reviewStatus !== "Not sent"} onClick={() => setReview("Pending review")}>
          Send to human review
        </Button>
        <span className="text-navy/80">
          Human review:{" "}
          <strong className={e.reviewStatus === "Reviewed" ? "text-emerald-800" : ""}>
            {e.reviewStatus === "Pending review" ? "Pending review…" : e.reviewStatus}
          </strong>
        </span>
      </div>
    </Card>
  );
}

export default function ClaimPage() {
  const { state, update } = useStore();
  const pending = state.engagements.some((e) => e.reviewStatus === "Pending review");

  // Simulated reviewer: anything pending comes back reviewed after a short wait.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(
      () =>
        update((s) => ({
          ...s,
          engagements: s.engagements.map((e) =>
            e.reviewStatus === "Pending review" ? { ...e, reviewStatus: "Reviewed" } : e
          ),
        })),
      3000
    );
    return () => clearTimeout(t);
  }, [pending, update]);

  const all = state.engagements.map((e) => checklist(state.records, e.id));
  const readyCount = all.filter((items) => items.every((i) => i.done)).length;
  const gapCount = all.flat().filter((i) => !i.done).length;

  return (
    <>
      <PageHeader
        title="Claim Readiness"
        sub={`Is ${STUDIO.name} ready to hand its records to an accountant? Every engagement, checked against what a claim file usually needs.`}
      >
        <Button onClick={() => exportPackage(state)}>Export accountant package</Button>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { n: state.records.length, label: "records organized" },
          { n: `${readyCount} of ${state.engagements.length}`, label: "engagements ready" },
          { n: gapCount, label: gapCount === 1 ? "gap to close" : "gaps to close" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-navy p-5 text-white">
            <div className="font-heading text-4xl font-bold text-apricot">{s.n}</div>
            <div className="text-lg text-white/80">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {state.engagements.map((e) => (
          <EngagementCard key={e.id} e={e} />
        ))}
      </div>
    </>
  );
}
