/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://cpprofiles-phuw.vercel.app').replace(/\/$/, '');
    return [
      {
        source: '/users/:path*',
        destination: `${backendUrl}/users/:path*`,
      },
      {
        source: '/hello',
        destination: `${backendUrl}/hello`,
      },
    ];
  },
};

export default nextConfig;
