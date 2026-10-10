import { canned } from "@/lib/canned";
import type { AiTask } from "@/lib/types";

const MODEL = "claude-haiku-5-5";
// Tried in order; the next one is used if a model is overloaded or rate-limited.
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];

const SYSTEM =
  "You are IndieCredit, an assistant that organizes freelance work records for indie game studios in Nova Scotia. " +
  "You organize information only; you never give tax or legal advice. " +
  "Respond with a single JSON object and nothing else - no markdown, no code fences.";

function buildPrompt(task: AiTask, input: string, context: unknown): string {
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  if (task === "agreement") {
    return `Studio: Lighthouse Pixel Co. (Halifax, NS). Freelancer: Maya Chen, 2D character artist (Dartmouth, NS). Today is ${today}.

Turn this informal request into a draft agreement:
"""${input}"""

Return JSON with exactly these keys:
- title: string (short job title)
- deliverables: string[]
- revisionLimit: string (default to 2 rounds of revisions)
- fileSpecs: string
- deadline: string (a concrete date like "October 24, 2026")
- price: number (CAD, no symbol)
- ipClause: string (one or two sentences assigning IP to the studio on full payment)
- missingDetails: array of 2-4 objects { "detail": string, "question": string } for things the message left unclear, each with a friendly follow-up question.`;
  }
  if (task === "scope") {
    return `Here is the approved agreement as JSON:
${JSON.stringify(context)}

The studio has sent this new request:
"""${input}"""

Compare the request to the agreement. Return JSON with exactly these keys:
- verdict: "In scope" or "Out of scope"
- reason: string (one sentence)
- changeOrder: { "description": string, "price": number (CAD, 0 if in scope), "timelineImpact": string (e.g. "+5 business days" or "None") }`;
  }
  return `Extract a record from this forwarded email or pasted message:
"""${input}"""

Return JSON with exactly these keys:
- date: string (YYYY-MM-DD)
- amount: number (no currency symbol)
- payer: string
- payee: string
- deliverable: string (short description of what was delivered or billed)
- documentType: "Invoice", "Payment proof", "Agreement" or "Other"`;
}

function isValid(task: AiTask, d: Record<string, unknown>): boolean {
  if (task === "agreement") {
    return Array.isArray(d.deliverables) && Array.isArray(d.missingDetails) && typeof d.price === "number";
  }
  if (task === "scope") {
    const co = d.changeOrder as Record<string, unknown> | undefined;
    return (d.verdict === "In scope" || d.verdict === "Out of scope") && !!co && typeof co.price === "number";
  }
  return typeof d.amount === "number" && typeof d.payee === "string" && typeof d.date === "string";
}

async function claudeText(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return (body.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
}

async function geminiText(prompt: string, apiKey: string): Promise<string> {
  let lastError = "";
  for (const model of GEMINI_MODELS) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const body = await res.json();
      return (body.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
    }
    lastError = `Gemini API ${res.status} (${model}): ${await res.text()}`;
    if (res.status !== 503 && res.status !== 429) break;
  }
  throw new Error(lastError);
}

function parseJson(task: AiTask, text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON in model response");
  const data = JSON.parse(text.slice(start, end + 1));
  if (!isValid(task, data)) throw new Error("Model JSON did not match the expected shape");
  return data;
}

export async function POST(req: Request) {
  let task: AiTask = "agreement";
  try {
    const body = await req.json();
    if (!["agreement", "scope", "extract"].includes(body.task)) {
      return Response.json({ error: "Unknown task" }, { status: 400 });
    }
    task = body.task;
    // Anthropic if its key is set, otherwise Gemini.
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (anthropicKey || geminiKey) {
      const prompt = buildPrompt(task, String(body.input ?? "").slice(0, 20000), body.context ?? null);
      const text = anthropicKey ? await claudeText(prompt, anthropicKey) : await geminiText(prompt, geminiKey!);
      return Response.json({ simulated: false, data: parseJson(task, text) });
    }
  } catch (err) {
    console.error("[/api/ai] falling back to simulated response:", err);
  }
  // No key or a failed call: the demo must never break.
  await new Promise((r) => setTimeout(r, 700));
  return Response.json({ simulated: true, data: canned(task) });
}
