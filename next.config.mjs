
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
*/
await import("./src/env.mjs");
import webpack from "webpack"

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
  *
  * @see https://github.com/vercel/next.js/issues/41980
  */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "firebasestorage.googleapis.com",
    ]
  },
  webpack: (config, { isServer }) => {

    config.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react'
      })
    );

    return config
  }
};

export default config;
