module.exports = {
  apps: [
    {
      name: 'sahaay',
      cwd: './my-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HTTP_KEEP_ALIVE_TIMEOUT: 65000,
        CACHE_TTL_SECONDS: 300,
        ENABLE_RATE_LIMIT_HEADER: 'true',
        RATE_LIMIT_MAX_REQUESTS: '120',
        ENABLE_TELEMETRY_SAMPLE_HEADER: 'true',
      },
    },
  ],
};
