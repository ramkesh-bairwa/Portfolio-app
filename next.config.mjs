/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ['mysql2', 'bcryptjs'] },
  images: { unoptimized: true },
  optimizeFonts: false,
};
export default nextConfig;
