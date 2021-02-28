FROM node:14-alpine
WORKDIR /
COPY package.json .
COPY yarn.lock .
RUN yarn --production --frozen-lockfile
COPY . .

CMD ["yarn", "migrate"]
