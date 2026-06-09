import { SearchBox } from "@/components/landing/SearchBox";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1forge — Find Your PG or Hostel",
  description:
    "Search for your PG or hostel by name to access your resident portal.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <Building2 className="h-5 w-5 text-foreground" />
          <span className="font-semibold text-sm text-foreground tracking-tight">
            1forge
          </span>
        </div>
        <a
          href="mailto:support@1forge.in"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Support
        </a>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Resident Portal
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Find your PG or hostel
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Type the name of your PG or hostel below. We&apos;ll take you to
              your property&apos;s login page.
            </p>
          </div>

          {/* Search box */}
          <div className="flex justify-center">
            <SearchBox />
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground">
            Can&apos;t find your property?{" "}
            <a
              href="mailto:support@1forge.in"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact support
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 1forge Studio &middot; Hostel &amp;
          PG Management Platform
        </p>
      </footer>
    </main>
  );
}
