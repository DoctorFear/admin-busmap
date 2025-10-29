import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",          // khi vào trang gốc
        destination: "/driver", // chuyển đến trang driver
        permanent: true,       // true = chuyển hướng vĩnh viễn (308)
      },
    ];
  },
};

export default nextConfig;
