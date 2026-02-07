import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker builds
  output: "standalone",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
