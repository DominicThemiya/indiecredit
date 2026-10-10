import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { Nav } from "@/components/Nav";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const heading = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const body = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IndieCredit",
  description: "Effortless records for indie game studios and freelancers in Nova Scotia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream font-sans text-lg text-navy">
        <StoreProvider>
          <Nav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
        </StoreProvider>
        <footer className="border-t border-navy/10 px-6 py-5 text-center text-base text-navy/70">
          Organized records for your accountant&apos;s review. Not tax advice. All demo data is fictional.
        </footer>
      </body>
    </html>
  );
}
