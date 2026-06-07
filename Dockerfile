FROM refinedev/node:22 AS base

FROM base AS deps

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm@10.12.1 && \
    pnpm config set onlyBuiltDependencies esbuild && \
    pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
    corepack enable && \
    yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder

ENV NODE_ENV production

COPY --from=deps /app/refine/node_modules ./node_modules

COPY . .

RUN npm run build

FROM base AS runner

ENV NODE_ENV production

RUN npm install -g serve

COPY --from=builder /app/refine/dist ./

USER refine

CMD ["serve", "-s", "."]
