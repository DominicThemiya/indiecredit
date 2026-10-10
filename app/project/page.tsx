"use client";

import Link from "next/link";
import { useState } from "react";
import { AiBadge, Button, Card, PageHeader, Status, textareaClass } from "@/components/ui";
import { callAI, fmtDateTime, money, newRecord, useStore } from "@/lib/store";
import type { ScopeCheck } from "@/lib/types";

const base = { engagementId: "maya", source: "Created in IndieCredit" as const };

export default function ProjectPage() {
  const { state, update } = useStore();
  const { job, project } = state;
  const [loading, setLoading] = useState(false);
  const a = job.agreement;

  if (!a || !job.saved) {
    return (
      <>
        <PageHeader title="Project" sub="Track delivery, scope changes and invoicing for an approved job." />
        <Card className="text-xl">
          No approved job yet.{" "}
          <Link href="/new-job" className="font-semibold text-rust underline underline-offset-4">
            Create and approve an agreement first →
          </Link>
        </Card>
      </>
    );
  }

  const mine = state.records.filter((r) => r.engagementId === "maya");
  const delivery = mine.find((r) => r.type === "Delivery confirmation");
  const invoice = mine.find((r) => r.type === "Invoice");
  const scope = project.scope;
  const extra = project.changeApproved && scope ? scope.changeOrder.price : 0;
  const total = a.price + extra;

  const check = async () => {
    setLoading(true);
    const { data, simulated } = await callAI<ScopeCheck>("scope", project.request, a);
    update((s) => ({ ...s, project: { ...s.project, scope: data, scopeSimulated: simulated, changeApproved: false } }));
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Project" sub={`${a.title} · Maya Chen · ${money(a.price)} · due ${a.deadline}`} />
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold">1. Delivery</h2>
              <p className="text-navy/70">Confirming delivery creates a timestamped record.</p>
            </div>
            {delivery ? (
              <Status ok>Delivered · {fmtDateTime(delivery.date)}</Status>
            ) : (
              <Button
                onClick={() =>
                  update((s) => ({
                    ...s,
                    project: { ...s.project, delivered: true },
                    records: [
                      ...s.records,
                      newRecord({ ...base, type: "Delivery confirmation", amount: null, summary: `${a.title} delivered and confirmed by studio` }),
                    ],
                  }))
                }
              >
                Mark delivered
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-2xl font-bold">2. Check a new request</h2>
          <p className="mb-3 text-navy/70">Paste a new ask. IndieCredit compares it to the approved agreement.</p>
          <textarea
            className={textareaClass}
            rows={2}
            value={project.request}
            onChange={(e) => update((s) => ({ ...s, project: { ...s.project, request: e.target.value } }))}
          />
          <Button className="mt-3" variant="navy" onClick={check} disabled={loading || !project.request.trim() || project.changeApproved}>
            {loading ? "Comparing to agreement…" : "Check against agreement"}
          </Button>

          {scope && (
            <div className="mt-5 rounded-xl bg-cream p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Status ok={scope.verdict === "In scope"}>{scope.verdict}</Status>
                <AiBadge simulated={project.scopeSimulated} />
              </div>
              <p className="mt-3 text-xl">{scope.reason}</p>

              {scope.verdict === "Out of scope" && (
                <div className="mt-4 rounded-xl border-2 border-navy/15 bg-white p-4">
                  <div className="text-sm font-semibold uppercase tracking-wide text-rust">Draft change order</div>
                  <p className="mt-1 text-xl font-semibold">{scope.changeOrder.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-10 gap-y-1 text-xl">
                    <span>
                      Price: <strong>+{money(scope.changeOrder.price)}</strong>
                    </span>
                    <span>
                      Timeline: <strong>{scope.changeOrder.timelineImpact}</strong>
                    </span>
                  </div>
                  <div className="mt-4">
                    {project.changeApproved ? (
                      <Status ok>Change order approved · saved as a record</Status>
                    ) : (
                      <Button
                        disabled={!!invoice}
                        onClick={() =>
                          update((s) => ({
                            ...s,
                            project: { ...s.project, changeApproved: true },
                            records: [
                              ...s.records,
                              newRecord({
                                ...base,
                                type: "Change order",
                                amount: scope.changeOrder.price,
                                summary: `${scope.changeOrder.description} (${scope.changeOrder.timelineImpact})`,
                              }),
                            ],
                          }))
                        }
                      >
                        Approve change order
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold">3. Invoice</h2>
              <p className="text-navy/70">
                Agreement {money(a.price)}
                {extra > 0 && <> + change order {money(extra)}</>} = <strong className="text-navy">{money(total)}</strong>
              </p>
            </div>
            {invoice ? (
              <Status ok>Invoice created · {money(invoice.amount)}</Status>
            ) : (
              <Button
                onClick={() =>
                  update((s) => ({
                    ...s,
                    project: { ...s.project, invoiced: true },
                    records: [
                      ...s.records,
                      newRecord({
                        ...base,
                        type: "Invoice",
                        amount: total,
                        summary: `Invoice from Maya Chen to Lighthouse Pixel Co. - ${a.title}${extra > 0 ? " + change order" : ""}`,
                      }),
                    ],
                  }))
                }
              >
                Generate invoice
              </Button>
            )}
          </div>
        </Card>

        <p className="text-center">
          <Link href="/claim" className="font-semibold text-rust underline underline-offset-4">
            See how this changes Claim Readiness →
          </Link>
        </p>
      </div>
    </>
  );
}
