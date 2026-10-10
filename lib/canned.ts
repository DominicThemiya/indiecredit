import type { Agreement, AiTask, Extraction, ScopeCheck } from "./types";

// Realistic canned responses used when there is no API key or the AI call fails.

const inTwoWeeks = () =>
  new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const agreement = (): Agreement => {
  const deadline = inTwoWeeks();
  return {
    title: "3 painterly character portraits",
    deliverables: [
      "3 character portraits in a painterly style",
      "One portrait per character, bust framing",
      "Layered source file for each portrait",
    ],
    revisionLimit: "2 rounds of revisions per portrait",
    fileSpecs: "PNG, 2048 x 2048 px, transparent background, plus layered PSD",
    deadline,
    price: 900,
    ipClause:
      "On full payment, Maya Chen assigns all rights in the delivered artwork to Lighthouse Pixel Co. Maya may show the work in her portfolio once the game is announced.",
    missingDetails: [
      {
        detail: "Which characters",
        question: "Which three characters are these for, and do you have reference sheets?",
      },
      {
        detail: "Exact deadline",
        question: `"About 2 weeks" - can we lock in ${deadline} as the delivery date?`,
      },
      {
        detail: "Payment terms",
        question: "Is $900 CAD the total, and is it paid on delivery or 50% up front?",
      },
      {
        detail: "File format and size",
        question: "Do 2048 px PNGs with layered PSDs work for your engine?",
      },
    ],
  };
};

const scope = (): ScopeCheck => ({
  verdict: "Out of scope",
  reason:
    "The agreement covers 3 portraits with 2 revision rounds; 6 extra poses are new deliverables, not revisions.",
  changeOrder: {
    description: "2 additional poses for each of the 3 characters (6 poses total)",
    price: 540,
    timelineImpact: "+5 business days",
  },
});

const extract = (): Extraction => ({
  date: "2026-10-06",
  amount: 1200,
  payer: "Lighthouse Pixel Co.",
  payee: "Leo Arsenault",
  deliverable: "Harbour District environment pack - milestone 2 (3 modular dock assets)",
  documentType: "Invoice",
});

export function canned(task: AiTask): unknown {
  if (task === "agreement") return agreement();
  if (task === "scope") return scope();
  return extract();
}
