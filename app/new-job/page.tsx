"use client";

import Link from "next/link";
import { useState } from "react";
import { AiBadge, Button, Card, PageHeader, Status, textareaClass } from "@/components/ui";
import { STUDIO } from "@/lib/seed";
import { callAI, money, newRecord, useStore } from "@/lib/store";
import type { Agreement, DemoState } from "@/lib/types";

function approve(s: DemoState, who: "studioApproved" | "freelancerApproved"): DemoState {
  const job = { ...s.job, [who]: true };
  const a = job.agreement;
  if (!a || job.saved || !job.studioApproved || !job.freelancerApproved) return { ...s, job };
  // Both sides approved: the agreement (and what it confirms) becomes records.
  const base = { engagementId: "maya", source: "Created in IndieCredit" as const };
  const records = [
    ...s.records,
    newRecord({ ...base, type: "Agreement", amount: a.price, summary: `${a.title} - approved by studio and freelancer` }),
    newRecord({ ...base, type: "IP assignment", amount: null, summary: "IP assignment clause accepted in agreement" }),
  ];
  if (job.residency) {
    records.push(
      newRecord({ ...base, type: "Residency confirmation", amount: null, summary: "Maya Chen confirmed Nova Scotia residency (Dartmouth, NS)" })
    );
  }
  return { ...s, records, job: { ...job, saved: true } };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-wide text-navy/60">{label}</div>
      <div className="text-xl">{children}</div>
    </div>
  );
}

export default function NewJobPage() {
  const { state, update } = useStore();
  const { job } = state;
  const [loading, setLoading] = useState(false);
  const a = job.agreement;

  const create = async () => {
    setLoading(true);
    const { data, simulated } = await callAI<Agreement>("agreement", job.request);
    update((s) => ({
      ...s,
      job: { ...s.job, agreement: data, simulated, studioApproved: false, freelancerApproved: false, residency: false },
    }));
    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="New Job"
        sub="Paste the message where the work was requested. IndieCredit turns it into a clear agreement both sides can approve."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 self-start">
          <h2 className="font-heading text-xl font-bold">Request</h2>
          <p className="mb-3 text-navy/70">
            {STUDIO.name} → Maya Chen, via Discord
          </p>
          <textarea
            className={textareaClass}
            rows={6}
            value={job.request}
            disabled={job.saved}
            onChange={(e) => update((s) => ({ ...s, job: { ...s.job, request: e.target.value } }))}
          />
          <Button className="mt-4 w-full" onClick={create} disabled={loading || job.saved || !job.request.trim()}>
            {loading ? "Organizing…" : a ? "Recreate agreement" : "Create agreement"}
          </Button>
        </Card>

        <div className="lg:col-span-3">
          {!a ? (
            <Card className="flex min-h-64 items-center justify-center border-dashed text-center text-xl text-navy/50">
              {loading ? "Reading the request and drafting an agreement…" : "The structured agreement will appear here."}
            </Card>
          ) : (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-rust">Draft agreement</div>
                  <h2 className="font-heading text-2xl font-bold">{a.title}</h2>
                  <p className="text-navy/70">{STUDIO.name} and Maya Chen</p>
                </div>
                <AiBadge simulated={job.simulated} />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Price">{money(a.price)}</Field>
                <Field label="Deadline">{a.deadline}</Field>
                <Field label="Revision limit">{a.revisionLimit}</Field>
                <Field label="File specs">{a.fileSpecs}</Field>
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold uppercase tracking-wide text-navy/60">Deliverables</div>
                <ul className="mt-1 list-disc space-y-1 pl-6 text-xl">
                  {a.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-xl bg-cream p-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-navy/60">IP assignment clause</div>
                <p>{a.ipClause}</p>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-navy/15 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-6 w-6 accent-rust"
                  checked={job.residency}
                  disabled={job.saved}
                  onChange={(e) => update((s) => ({ ...s, job: { ...s.job, residency: e.target.checked } }))}
                />
                <span>
                  <strong>Residency confirmation.</strong> Freelancer confirms they are a Nova Scotia resident for the
                  duration of this work.
                </span>
              </label>

              {a.missingDetails.length > 0 && (
                <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                  <div className="font-heading text-lg font-bold text-amber-900">
                    Missing details · {a.missingDetails.length} suggested follow-ups
                  </div>
                  <ul className="mt-2 space-y-2">
                    {a.missingDetails.map((m) => (
                      <li key={m.detail}>
                        <strong>{m.detail}:</strong> <span className="text-navy/80">&ldquo;{m.question}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant={job.studioApproved ? "ghost" : "navy"}
                  disabled={job.studioApproved}
                  onClick={() => update((s) => approve(s, "studioApproved"))}
                >
                  {job.studioApproved ? "✓ Studio approved" : "Studio approves"}
                </Button>
                <Button
                  variant={job.freelancerApproved ? "ghost" : "navy"}
                  disabled={job.freelancerApproved}
                  onClick={() => update((s) => approve(s, "freelancerApproved"))}
                >
                  {job.freelancerApproved ? "✓ Freelancer approved" : "Freelancer approves"}
                </Button>
              </div>

              {job.saved && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4">
                  <Status ok>Saved as a record</Status>
                  {!job.residency && <span className="text-amber-900">Residency not confirmed - flagged in Claim Readiness.</span>}
                  <Link href="/project" className="font-semibold text-rust underline underline-offset-4">
                    Go to the project →
                  </Link>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
