FROM node:20

WORKDIR /usr/src/client

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
RUN yarn global add serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000", "--no-clipboard", "--detached"]
