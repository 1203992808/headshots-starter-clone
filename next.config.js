/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  // Allow JSX/JS files to import each other
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Disable static optimization to force dynamic rendering
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
