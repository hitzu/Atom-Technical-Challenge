# CI/CD

Este proyecto incluye un pipeline de CI/CD con GitHub Actions.

- Runs (historial): `https://github.com/hitzu/Atom-Technical-Challenge/actions`
- Workflow: `.github/workflows/ci-cd.yml`

## Qué hace el pipeline

### Job: build-and-test (push y PR)

- Instala dependencias del monorepo (`npm ci`).
- Configura Java 21 (requerido por Firebase emulators).
- Levanta **Firestore Emulator** (puerto `8080`) usando `back/firebase.json`.
- Ejecuta:
  - Tests backend (Vitest).
  - Tests frontend (Angular + ChromeHeadless).
  - Build backend.
  - Build frontend (prod).

### Job: deploy (solo `push` a `main`)

- Re-ejecuta install + builds.
- Hace deploy a Firebase:
  - **Hosting** (frontend)
  - **Functions** (backend)

## Secrets requeridos (GitHub)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`

Notas:

- `FIREBASE_SERVICE_ACCOUNT` se escribe en un archivo temporal (`gcloud-key.json`) y se usa vía `GOOGLE_APPLICATION_CREDENTIALS`.
- El deploy usa `firebase deploy --only hosting,functions --force`.
