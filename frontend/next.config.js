const nodeExternals = require("webpack-node-externals");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: "/",
  // experimental: {
  //   serverActions: true,
  // },
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
