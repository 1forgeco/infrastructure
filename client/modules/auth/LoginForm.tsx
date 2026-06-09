"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/modules/auth/api";
import type { OrgPublic } from "@/modules/auth/types";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  org: OrgPublic;
}

export function LoginForm({ org }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived brand color — fallback to app primary
  const brandColor = org.brand_color || "#0f172a";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter your email/phone and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await login({ username: username.trim(), password });

      // Persist tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("roles", JSON.stringify(data.roles));

      // Navigate to the org's dashboard
      router.push(`/${org.slug}/dashboard`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}

      {/* Email / Phone */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-username"
          className="block text-sm font-medium text-foreground"
        >
          Email or Phone
        </label>
        <input
          id="login-username"
          type="text"
          autoComplete="username"
          placeholder="your@email.com or 9876543210"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
          className={cn(
            "w-full h-10 px-3 rounded-md border border-border bg-background",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "outline-none focus:ring-2 focus:border-transparent disabled:opacity-50",
            "shadow-sm"
          )}
          style={
            { "--tw-ring-color": `${brandColor}40` } as React.CSSProperties
          }
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className={cn(
              "w-full h-10 pl-3 pr-10 rounded-md border border-border bg-background",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "outline-none focus:ring-2 focus:border-transparent disabled:opacity-50",
              "shadow-sm"
            )}
            style={
              { "--tw-ring-color": `${brandColor}40` } as React.CSSProperties
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-10 rounded-md text-sm font-semibold text-white",
          "flex items-center justify-center gap-2",
          "disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed",
          "shadow-sm"
        )}
        style={{ backgroundColor: brandColor }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Log In"
        )}
      </button>

      {/* Forgot password placeholder */}
      <p className="text-center text-xs text-muted-foreground">
        Forgot your password?{" "}
        <a
          href={`mailto:${org.name.toLowerCase().replace(/\s/g, "")}@1forge.in`}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Contact your warden
        </a>
      </p>
    </form>
  );
}
