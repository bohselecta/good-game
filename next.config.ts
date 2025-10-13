import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment configuration
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Disable Turbopack for stable builds
  // turbopack: false, // Commented out for Vercel compatibility
};

export default nextConfig;
