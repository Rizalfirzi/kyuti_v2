/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*.php',
        destination: '/api/:path*',
      },
      {
        source: '/api/kopken/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
