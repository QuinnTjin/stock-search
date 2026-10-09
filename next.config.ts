import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // argon2 is a native addon; keep it out of the bundler so it loads at runtime.
  serverExternalPackages: ["argon2"],
};

export default nextConfig;
