export type Source = "Created in IndieCredit" | "Forwarded email";

export type RecType =
  | "Agreement"
  | "Delivery confirmation"
  | "Change order"
  | "Invoice"
  | "Payment proof"
  | "IP assignment"
  | "Residency confirmation";

export interface Rec {
  id: string;
  type: RecType;
  engagementId: string;
  date: string; // ISO
  amount: number | null;
  source: Source;
  summary: string;
}

export type ReviewStatus = "Not sent" | "Pending review" | "Reviewed";

export interface Engagement {
  id: string;
  title: string;
  freelancer: string;
  role: string;
  location: string;
  reviewStatus: ReviewStatus;
}

export interface Agreement {
  title: string;
  deliverables: string[];
  revisionLimit: string;
  fileSpecs: string;
  deadline: string;
  price: number;
  ipClause: string;
  missingDetails: { detail: string; question: string }[];
}

export interface ScopeCheck {
  verdict: "In scope" | "Out of scope";
  reason: string;
  changeOrder: { description: string; price: number; timelineImpact: string };
}

export interface Extraction {
  date: string;
  amount: number;
  payer: string;
  payee: string;
  deliverable: string;
  documentType: "Invoice" | "Payment proof" | "Agreement" | "Other";
}

export type AiTask = "agreement" | "scope" | "extract";

export interface DemoState {
  records: Rec[];
  engagements: Engagement[];
  job: {
    request: string;
    agreement: Agreement | null;
    simulated: boolean;
    studioApproved: boolean;
    freelancerApproved: boolean;
    residency: boolean;
    saved: boolean;
  };
  project: {
    delivered: boolean;
    request: string;
    scope: ScopeCheck | null;
    scopeSimulated: boolean;
    changeApproved: boolean;
    invoiced: boolean;
  };
}
