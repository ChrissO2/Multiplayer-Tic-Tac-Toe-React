FROM node:20

WORKDIR /usr/src/server

COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile
RUN yarn remove bcrypt
RUN yarn add bcrypt
RUN yarn install

COPY . .

EXPOSE 3001

CMD ["yarn", "start"]
