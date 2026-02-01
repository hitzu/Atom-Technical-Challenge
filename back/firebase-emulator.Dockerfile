FROM node:20-alpine

WORKDIR /app

RUN npm i -g firebase-tools

# Install deps (includes local file dependency ../shared)
COPY shared/package.json shared/package.json
COPY shared/tsconfig.json shared/tsconfig.json
COPY shared/src shared/src

COPY back/package.json back/package.json
COPY back/tsconfig.json back/tsconfig.json
COPY back/firebase.json back/firebase.json
COPY back/firestore.rules back/firestore.rules
COPY back/src back/src

WORKDIR /app/back

RUN npm install
RUN npm run build

EXPOSE 8080 5001 4001

CMD ["firebase", "emulators:start", "--only", "firestore,functions", "--project", "demo-project"]

