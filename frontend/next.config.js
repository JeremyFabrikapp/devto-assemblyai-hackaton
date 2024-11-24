const nodeExternals = require('webpack-node-externals');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // config.target = "node"
  //     // config.externals = [nodeExternals()];
  //   }

  //   return config;
  // },
  images: { unoptimized: true },
};


module.exports = nextConfig;

