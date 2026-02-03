FROM node:20-alpine

WORKDIR /app

COPY back/shared/package.json back/shared/package.json
COPY back/shared/tsconfig.json back/shared/tsconfig.json
COPY back/shared/src back/shared/src

COPY back/package.json back/package.json
COPY back/tsconfig.json back/tsconfig.json
COPY back/src back/src

WORKDIR /app/back

RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["node", "lib/main.js"]

