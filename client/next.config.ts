import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development", // disable SW in dev to avoid stale caching
});

const nextConfig: NextConfig = {
  // Turbopack is the default in Next.js 16. Declaring this empty config
  // tells Next.js we're aware and prevents the build warning from next-pwa's
  // webpack plugin being present alongside turbopack.
  turbopack: {},
};

export default withPWA(nextConfig);
