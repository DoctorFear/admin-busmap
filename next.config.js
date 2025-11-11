/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8888/api/:path*", // proxy sang backend
      },
    ];
  },
};

export default nextConfig;
