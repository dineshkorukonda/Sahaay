import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Load repo root .env so GOOGLE_API_KEY etc. work when .env lives at Sahaay/.env
const rootEnv = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(rootEnv)) {
  const content = fs.readFileSync(rootEnv, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      if (process.env[key] === undefined) {
        process.env[key] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // CORS configuration for API routes
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Will be overridden by middleware for specific origins
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Client-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
