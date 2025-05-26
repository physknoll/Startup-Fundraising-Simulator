import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold">Startup Fundraising Simulator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Model your startup's fundraising journey from pre-seed to exit. Understand dilution, valuation, and revenue requirements.
        </p>
        <p className="text-sm mt-1">brought to you by PREQUEL VENTURES (Placeholder)</p>
      </header>

      {/* Input Parameters Section (Phase 2) */}
      <section id="input-parameters" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Input Parameters</h2>
        {/* Placeholder for input table */}
      </section>

      {/* Results Section (Phase 3 & 4) */}
      <section id="results" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Results</h2>
        {/* Placeholder for tabs (Summary, Revenue Growth, Ownership, Investor Returns) */}
      </section>

      <footer className="text-center text-sm text-muted-foreground my-8">
        © {new Date().getFullYear()} Prequel Ventures GmbH. All calculations are simulations and should not be considered financial advice.
      </footer>
    </main>
  );
}
