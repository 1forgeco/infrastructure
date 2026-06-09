import { notFound } from "next/navigation";
import { getOrgBySlug } from "@/modules/auth/api";
import { LoginForm } from "@/modules/auth/LoginForm";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) return { title: "Not Found" };
  return {
    title: `Login — ${org.name}`,
    description: `Sign in to your ${org.name} resident portal.`,
  };
}

export default async function TenantLoginPage({ params }: Props) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);

  if (!org) {
    notFound();
  }

  const brandColor = org.brand_color || "#0f172a";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: brandColor }}
    >
      {/* Login card */}
      <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        {/* Card header — branded */}
        <div
          className="px-8 pt-8 pb-6 flex flex-col items-center gap-3 text-center"
          style={{ backgroundColor: brandColor }}
        >
          {/* Org logo */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logo_url}
                alt={`${org.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="h-7 w-7 text-white" />
            )}
          </div>

          {/* Org name + tagline */}
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              {org.name}
            </h1>
            {org.tagline && (
              <p className="mt-0.5 text-xs text-white/70">{org.tagline}</p>
            )}
          </div>
        </div>

        {/* Form section */}
        <div className="px-8 py-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Resident Login
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sign in to access your portal
            </p>
          </div>

          <LoginForm org={org} />
        </div>

        {/* Card footer */}
        <div className="px-8 pb-6 pt-2 text-center">
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            ← Back to search
          </a>
        </div>
      </div>

      {/* Platform attribution */}
      <p className="mt-6 text-xs text-white/50 text-center select-none">
        Powered by{" "}
        <a href="/" className="underline underline-offset-4 hover:text-white/80">
          1forge
        </a>
      </p>
    </main>
  );
}
