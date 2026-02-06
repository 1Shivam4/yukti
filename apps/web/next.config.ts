import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Static export for S3 deployment
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable features not available in static export
  trailingSlash: true,
};

export default nextConfig;
