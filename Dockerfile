FROM node:14-alpine
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn --production --frozen-lockfile
COPY . .

CMD ["yarn", "migrate"]
