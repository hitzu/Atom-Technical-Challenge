# Backend (`back/`)

Express + TypeScript API designed to be compatible with Firebase Cloud Functions, using Firestore via Firebase Admin SDK.

## Local (dev)

From repo root (with Firestore emulator running):

```bash
export PORT=4000
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
export JWT_SECRET=dev-secret
export ALLOW_INSECURE_HEADER_AUTH=true

npm run dev:back
```

API base URL:

- `http://localhost:4000/api`
