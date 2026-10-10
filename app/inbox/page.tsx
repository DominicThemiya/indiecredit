"use client";

import Link from "next/link";
import { useState } from "react";
import { AiBadge, Button, Card, PageHeader, Status, textareaClass } from "@/components/ui";
import { INBOX_EMAIL } from "@/lib/seed";
import { callAI, money, newRecord, useStore } from "@/lib/store";
import type { Extraction, RecType } from "@/lib/types";

export default function InboxPage() {
  const { state, update } = useStore();
  const [text, setText] = useState(INBOX_EMAIL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data: Extraction; simulated: boolean; engagement: string } | null>(null);

  const extract = async () => {
    setLoading(true);
    const { data, simulated } = await callAI<Extraction>("extract", text);
    // File under the engagement whose freelancer is named in the message.
    const people = `${data.payee} ${data.payer}`.toLowerCase();
    const eng =
      state.engagements.find((e) => people.includes(e.freelancer.split(" ")[0].toLowerCase())) ?? state.engagements[0];
    const type: RecType =
      data.documentType === "Payment proof" || data.documentType === "Agreement" ? data.documentType : "Invoice";
    const parsed = new Date(`${data.date}T12:00:00`);
    update((s) => ({
      ...s,
      records: [
        ...s.records,
        newRecord({
          type,
          engagementId: eng.id,
          amount: data.amount,
          source: "Forwarded email",
          summary: `${data.deliverable} (${data.payer} → ${data.payee})`,
          date: isNaN(parsed.getTime()) ? undefined : parsed.toISOString(),
        }),
      ],
    }));
    setResult({ data, simulated, engagement: `${eng.title} - ${eng.freelancer}` });
    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Inbox"
        sub="Forward an email or paste a message. IndieCredit pulls out the details and files it as a record."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="self-start">
          <h2 className="mb-3 font-heading text-xl font-bold">Forward an email or paste a message</h2>
          <textarea className={`${textareaClass} font-mono !text-base`} rows={13} value={text} onChange={(e) => setText(e.target.value)} />
          <Button className="mt-4 w-full" onClick={extract} disabled={loading || !text.trim()}>
            {loading ? "Extracting…" : "Extract record"}
          </Button>
          <p className="mt-4 rounded-xl bg-cream p-3 text-base text-navy/80">
            🔒 Users share only what they choose. We never read whole inboxes.
          </p>
        </Card>

        {result ? (
          <Card className="self-start">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Status ok>Record created</Status>
              <AiBadge simulated={result.simulated} />
            </div>
            <dl className="mt-5 divide-y divide-navy/10">
              {[
                ["Type", result.data.documentType],
                ["Date", result.data.date],
                ["Amount", money(result.data.amount)],
                ["Payer", result.data.payer],
                ["Payee", result.data.payee],
                ["Deliverable", result.data.deliverable],
                ["Filed under", result.engagement],
                ["Source", "Forwarded email"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-sm font-semibold uppercase tracking-wide text-navy/60">{k}</dt>
                  <dd className="col-span-2 text-xl">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/records" className="mt-4 inline-block font-semibold text-rust underline underline-offset-4">
              View all records →
            </Link>
          </Card>
        ) : (
          <Card className="flex min-h-64 items-center justify-center border-dashed text-center text-xl text-navy/50">
            {loading ? "Reading the message…" : "The extracted record will appear here."}
          </Card>
        )}
      </div>
    </>
  );
}
