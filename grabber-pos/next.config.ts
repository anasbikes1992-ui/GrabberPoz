import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Previous concatenated paths → Grabber product routes
      { source: "/cashin", destination: "/cash-in", permanent: true },
      { source: "/cashout", destination: "/cash-out", permanent: true },
      { source: "/updates", destination: "/help", permanent: true },
    ];
  },
};

export default nextConfig;
