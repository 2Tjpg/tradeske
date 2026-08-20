/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@deriv/core'],
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
