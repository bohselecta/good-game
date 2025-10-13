import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment configuration
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
