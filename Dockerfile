FROM node:20.12.2-alpine
WORKDIR /app
RUN corepack enable pnpm
RUN node -v
RUN pnpm -v
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm add typescript tsx
COPY . .

ENTRYPOINT ["pnpm", "tsx", "docker.ts"]
