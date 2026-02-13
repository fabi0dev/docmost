/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita conflito entre /path e /path/ na Vercel
  trailingSlash: false,
  // Build otimizado para serverless (Vercel)
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
