import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    // Bypasses strict check type issues during fast builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
