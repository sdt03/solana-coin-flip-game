import type { NextConfig } from "next";

type NextConfigWithEslint = NextConfig & {
  eslint?: { ignoreDuringBuilds?: boolean };
};

const nextConfig: NextConfigWithEslint = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds (optional)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
