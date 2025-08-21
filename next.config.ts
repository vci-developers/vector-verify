import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.vectorcam.org",
        pathname: "/specimens/**",
      },
    ],
  },
};

export default nextConfig;
