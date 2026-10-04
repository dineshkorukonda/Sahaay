# CARF probe 4 / batch C4 infra marker
# PM2 starts Sahaay from the git checkout at /opt/sahaay/my-app. This image is not that start path.
FROM node:22-alpine
LABEL maintainer="Sahaay Core Team <dev@sahaay.internal>"
LABEL component="production-runtime"
LABEL carf.vector="infra"

WORKDIR /app

# Optimize layer ordering: copy package definitions prior to source files
COPY my-app/package*.json ./

# Same origin CARF probes via healthUrl (http://127.0.0.1:3000).
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
