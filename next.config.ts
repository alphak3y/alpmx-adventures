import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["3.129.63.181"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.alpmxadventures.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
