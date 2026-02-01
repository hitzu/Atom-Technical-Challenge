# Atom Tech Challenge — Fullstack Monorepo

Monorepo scaffold for a simple To‑Do application:

- `front/` — Angular 17 app (login + tasks)
- `back/` — Express + TypeScript API (Firebase Cloud Functions compatible) using Firestore
- `shared/` — Shared Zod schemas + TypeScript types used by both front and back

## How to run with Docker

Target command (brings up Firebase emulators + backend + frontend):

```bash
docker compose up --build
```

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:4000/api`

## Desarrollo local (sin Docker)

Esta guía te permite levantar el proyecto **en modo desarrollo** usando los comandos **desde la raíz del monorepo**, sin Docker.

### Requisitos

- **Node.js**: \(>= 20\). Este repo usa TypeScript y dependencias alineadas a Node 20 (por ejemplo `@types/node@20` en backend).
- **npm**: el repo incluye `package-lock.json`, así que el flujo esperado es con npm.
- **Firestore emulator (recomendado para desarrollo local)**:
  - Para usar Firestore _sin tocar recursos reales_, necesitas correr el emulador.
  - Puedes usar Firebase CLI instalado globalmente o vía `npx` (ver comandos más abajo).

### Variables de entorno (backend)

El backend lee configuración desde variables de entorno (no hay `back/.env.example` en el repo, y el backend no carga `.env` automáticamente).

Variables relevantes:

- **`PORT`**: puerto del backend. Default `4000`.
- **`FIREBASE_PROJECT_ID`**: id del proyecto Firebase. Default `demo-project`.
- **`GCLOUD_PROJECT`**: alternativa compatible con Firebase Admin SDK. Default `demo-project`.
- **`FIRESTORE_EMULATOR_HOST`**: host:puerto del emulador de Firestore (por ejemplo `localhost:8080`).
- **`JWT_SECRET`**: secreto para firmar JWT. Default `dev-secret`.
- **`ALLOW_INSECURE_HEADER_AUTH`**: `true|false`. Default `false`.  
  Si está en `true`, el backend acepta headers inseguros para debugging (ver `docs/current_status.md`).

Valores recomendados para local (macOS / Linux):

```bash
export PORT=4000
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
export JWT_SECRET=dev-secret
export ALLOW_INSECURE_HEADER_AUTH=true
```

### Paso a paso (dev local)

#### 1) Instalar dependencias del monorepo

Desde la raíz:

```bash
npm install
```

#### 2) Levantar Firestore emulator (recomendado)

Este repo incluye configuración del emulador en `back/firebase.json` (puerto **8080** para Firestore; UI **4001**).

Opción A (sin instalar nada global): usar `npx` desde la raíz

```bash
npx firebase-tools --config back/firebase.json --project demo-project emulators:start --only firestore

agregar que necesitamos java y Eclipse Temurin
```

Opción B (instalación global): usar Firebase CLI

```bash
npm install -g firebase-tools
firebase --config back/firebase.json --project demo-project emulators:start --only firestore
```

#### 3) Levantar backend (modo dev)

En otra terminal, desde la raíz:

```bash
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run dev:back
```

Por defecto, el backend levanta en:

- API base: `http://localhost:4000/api`
- Health: `http://localhost:4000/health`

#### 4) Levantar frontend (modo dev)

En otra terminal, desde la raíz:

```bash
npm run dev:front
```

Por defecto, Angular levanta en:

- Frontend: `http://localhost:4200`

### Cómo conectar front ↔ back en dev local

En este repo el frontend hace requests a rutas **relativas** como `'/api/tasks'` y `'/api/auth/login-or-create'`.  
En Docker eso funciona porque Nginx hace proxy de `/api/` hacia el backend (ver `front/nginx.conf`). En `ng serve` **no hay proxy configurado por defecto**, así que necesitas una de estas opciones:

#### Opción 1 (recomendada): Angular dev server con proxy

1. Crea el archivo `front/proxy.conf.json` con este contenido:

```json
{
  "/api": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

2. Levanta el backend y el frontend usando el proxy (desde la raíz):

```bash
npm run dev:back
```

```bash
npm run dev:front -- --proxy-config proxy.conf.json
```

Con esto, cuando el front llame `http://localhost:4200/api/...`, Angular lo redirige a `http://localhost:4000/api/...`.

#### Opción 2: usar Docker (recomendado para el revisor)

Si el objetivo es “levantar y probar end-to-end” con cero fricción (incluyendo emulador + proxy `/api`), el camino más directo sigue siendo:

```bash
docker compose up --build
```

### Problemas comunes

- **“Me sale error de conexión a Firestore”**
  - Verifica que el emulador esté corriendo.
  - Verifica que exportaste `FIRESTORE_EMULATOR_HOST=localhost:8080` **antes** de `npm run dev:back`.
  - Si no vas a usar emulador, vas a necesitar credenciales para Firestore real (no recomendado para el challenge).

- **“El frontend no llega al backend”**
  - Si estás en local con `ng serve`, asegúrate de haber configurado el proxy (archivo `front/proxy.conf.json`) y de correr:
    - `npm run dev:front -- --proxy-config proxy.conf.json`
  - Asegúrate de que el backend esté levantado en `http://localhost:4000` y que `/health` responda.

- **“Auth falla / el token no se guarda / 401”**
  - Revisa `localStorage` en el navegador: `auth.user` y `auth.token`.
  - Revisa en DevTools → Network que se envíe `Authorization: Bearer <token>` a `/api/*`.
  - Si estás debugeando con headers alternativos, confirma si `ALLOW_INSECURE_HEADER_AUTH=true` está seteado en el backend.

## Package docs

- Backend details: `back/README.md`
- Frontend details: `front/README.md`

## Comandos desde la raíz

- `npm run dev` – levanta backend y frontend en paralelo.
- `npm run dev:back` – solo backend.
- `npm run dev:front` – solo frontend.
- `npm run test` – tests de backend y frontend.
- `npm run lint` – lints de backend y frontend.
