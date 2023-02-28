FROM node:18.14.2-alpine
WORKDIR /app
RUN apk --no-cache add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm add typescript ts-node
COPY . .

ENTRYPOINT ["pnpm", "ts-node", "docker.ts"]
