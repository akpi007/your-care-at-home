import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LegalPageProps {
  title: string;
  updated?: string;
  children: ReactNode;
}

const LegalPage = ({ title, updated, children }: LegalPageProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="container py-10 flex-1">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
        {updated && (
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        )}
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default LegalPage;
