import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to support dynamic routes
  // For S3 deployment, we'll use client-side routing instead
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
