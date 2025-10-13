import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for now to avoid import issues
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
