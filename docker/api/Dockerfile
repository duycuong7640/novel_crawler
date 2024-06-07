FROM node:20.10-alpine

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

#RUN apk update && apk upgrade && \
#    apk add --no-cache chromium nss freetype freetype-dev harfbuzz ttf-freefont
RUN apk update && apk upgrade && \
    apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ttf-freefont \
    alsa-lib \
    atk \
    cups-libs \
    gtk+3.0 \
    libxcomposite \
    libx11 \
    libxrandr \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrender \
    libxtst \
    pango \
    xorg-server \
    udev \
    ttf-opensans

WORKDIR /var/www

RUN npm install -g yarn --force

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

RUN echo 'module.exports = { launch: { args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-zygote", "--single-process"] } };' > puppeteer.config.js

CMD ["sh", "-c", "yarn start:prod"]
