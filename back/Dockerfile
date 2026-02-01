FROM node:20-alpine

WORKDIR /app

COPY shared/package.json shared/package.json
COPY shared/tsconfig.json shared/tsconfig.json
COPY shared/src shared/src

COPY back/package.json back/package.json
COPY back/tsconfig.json back/tsconfig.json
COPY back/src back/src

WORKDIR /app/back

RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["node", "lib/main.js"]

