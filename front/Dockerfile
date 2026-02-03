FROM node:20-alpine AS build

WORKDIR /app

COPY shared/package.json shared/package.json
COPY shared/tsconfig.json shared/tsconfig.json
COPY shared/src shared/src

WORKDIR /app/shared
RUN npm install
RUN npm run build

WORKDIR /app

COPY front/package.json front/package.json
COPY front/angular.json front/angular.json
COPY front/tsconfig.json front/tsconfig.json
COPY front/tsconfig.app.json front/tsconfig.app.json
COPY front/src front/src

WORKDIR /app/front

RUN npm install
RUN npm run build

FROM nginx:alpine

COPY front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/front/dist/front/browser /usr/share/nginx/html

EXPOSE 80

