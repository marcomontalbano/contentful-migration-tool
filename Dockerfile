FROM node:14-alpine
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn --production --frozen-lockfile
RUN yarn add typescript ts-node
COPY . .

ENTRYPOINT ["yarn", "ts-node", "docker.ts"]
