import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.superbancos.gob.pa",
        pathname: "/sites/**",
      },
    ],
  },
};

export default nextConfig;
