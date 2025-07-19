import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async generateStaticParams() {
    return [
      { params: { slug: 'success' } },
      { params: { slug: 'cancel' } }
    ];
  },
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/success',
        destination: '/success',
      },
      {
        source: '/cancel', 
        destination: '/cancel',
      },
    ];
  },
};

export default nextConfig;
