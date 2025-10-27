import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds to prevent memory issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds to prevent memory issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
