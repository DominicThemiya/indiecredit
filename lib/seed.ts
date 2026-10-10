import type { DemoState } from "./types";

// All names, companies and amounts are fictional demo data.
export const STUDIO = { name: "Lighthouse Pixel Co.", location: "Halifax, NS", size: 3 };

export const JOB_REQUEST =
  "hey can you do 3 character portraits for our game, painterly style, need them in ~2 weeks, budget around $900?";

export const CHANGE_REQUEST = "Could you also add 2 extra poses for each character?";

export const INBOX_EMAIL = `From: Leo Arsenault <leo@arsenault3d.example>
To: accounts@lighthousepixel.example
Date: Tue, Oct 6, 2026
Subject: Invoice LA-014 - Harbour District environment pack (milestone 2)

Hi team,

Milestone 2 is wrapped - the last 3 modular dock assets are in the shared drive.
Invoice LA-014 is attached for $1,200.00 CAD, payable by e-transfer to this address within 15 days.

Thanks!
Leo`;

export const seedState = (): DemoState => ({
  engagements: [
    {
      id: "leo",
      title: "Harbour District environment pack",
      freelancer: "Leo Arsenault",
      role: "3D environment artist",
      location: "Nova Scotia (not yet confirmed)",
      reviewStatus: "Not sent",
    },
    {
      id: "maya",
      title: "Character portraits",
      freelancer: "Maya Chen",
      role: "2D character artist",
      location: "Dartmouth, NS",
      reviewStatus: "Not sent",
    },
  ],
  records: [
    {
      id: "seed-1",
      type: "Agreement",
      engagementId: "leo",
      date: "2026-08-04T14:10:00.000Z",
      amount: 2400,
      source: "Forwarded email",
      summary: "Scope email: 6 modular harbour environment assets, 2 milestones",
    },
    {
      id: "seed-2",
      type: "Delivery confirmation",
      engagementId: "leo",
      date: "2026-09-12T18:30:00.000Z",
      amount: null,
      source: "Created in IndieCredit",
      summary: "Milestone 1 delivered: 3 modular wharf assets",
    },
    {
      id: "seed-3",
      type: "Payment proof",
      engagementId: "leo",
      date: "2026-09-19T15:05:00.000Z",
      amount: 1200,
      source: "Forwarded email",
      summary: "Interac e-Transfer confirmation, milestone 1",
    },
  ],
  job: {
    request: JOB_REQUEST,
    agreement: null,
    simulated: false,
    studioApproved: false,
    freelancerApproved: false,
    residency: false,
    saved: false,
  },
  project: {
    delivered: false,
    request: CHANGE_REQUEST,
    scope: null,
    scopeSimulated: false,
    changeApproved: false,
    invoiced: false,
  },
});
