FROM node:20.10-alpine

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apk update && apk upgrade && \
    apk add --no-cache chromium nss freetype freetype-dev harfbuzz ttf-freefont

WORKDIR /var/www

RUN npm install -g yarn --force

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

CMD ["sh", "-c", "yarn start:prod"]
