FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openjdk21-jre-headless

RUN npm i -g firebase-tools

# Install deps (includes local file dependency ./shared)
COPY back/shared/package.json back/shared/package.json
COPY back/shared/tsconfig.json back/shared/tsconfig.json
COPY back/shared/src back/shared/src

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

