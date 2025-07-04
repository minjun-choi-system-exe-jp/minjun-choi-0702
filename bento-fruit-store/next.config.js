/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/minjun-choi-0702' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/minjun-choi-0702/' : '',
}

module.exports = nextConfig