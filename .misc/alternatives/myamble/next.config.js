/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.ctfassets.net'],
  },
  experimental: {
    runtime: 'nodejs',
  },
}

module.exports = nextConfig