# When copying this Dockerfile for use in other apps, don't forget to change the scope (api, docs, etc.) in RUN commands

FROM node:18-alpine AS pnpm
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install -g pnpm

# --------------------------------------------------------

FROM pnpm AS pruner
WORKDIR /app
RUN pnpm install -g turbo
COPY . .
RUN turbo prune --scope=docs --docker

# --------------------------------------------------------

FROM pnpm AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=docs

# --------------------------------------------------------

FROM node:18-alpine AS runner
WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/docs/next.config.js .
COPY --from=builder /app/apps/docs/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/static ./apps/docs/.next/static

ENV PORT 3001

CMD node apps/docs/server.js
