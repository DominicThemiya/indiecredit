import type { Rec, RecType } from "./types";

export interface CheckItem {
  key: string;
  label: string;
  done: boolean;
  askable: boolean; // a gap the freelancer can close
  recordType: RecType;
}

const ITEMS: { key: string; label: string; types: RecType[]; askable: boolean }[] = [
  { key: "agreement", label: "Agreement", types: ["Agreement"], askable: false },
  { key: "payment", label: "Invoice / payment proof", types: ["Invoice", "Payment proof"], askable: false },
  { key: "delivery", label: "Delivery confirmation", types: ["Delivery confirmation"], askable: false },
  { key: "ip", label: "IP assignment", types: ["IP assignment"], askable: true },
  { key: "residency", label: "Freelancer NS residency confirmed", types: ["Residency confirmation"], askable: true },
];

export function checklist(records: Rec[], engagementId: string): CheckItem[] {
  const mine = records.filter((r) => r.engagementId === engagementId);
  return ITEMS.map((i) => ({
    key: i.key,
    label: i.label,
    askable: i.askable,
    recordType: i.types[0],
    done: mine.some((r) => i.types.includes(r.type)),
  }));
}
