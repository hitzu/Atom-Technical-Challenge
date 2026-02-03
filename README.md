# Atom Tech Challenge — Fullstack Monorepo

Aplicación de lista de tareas (To-Do) con:

- `frontend` — App en **Angular 17 + angular material + bootstrap**.
- `backend` — API en **Express + TypeScript** en una arquitectura limpia, pseudo hexagonal.
- `ci/cd` - Deploy y test usando github functions en **Firebase Cloud Functions** y **Firestore**
- `shared` — **Zod schemas + tipos TypeScript compartidos** entre front y back.

El objetivo es demostrar:

- Buenas prácticas de **arquitectura front/back**.
- Uso de **Firestore + Angular** en desarrollo.
- Flujo de trabajo realista con diferentes tradeoffs.

---

## 1. Stack

### Backend

- Node.js 20
- Express
- Firestone
- vitest

### Frontend

- Angular
- Angular material
- Bootstrap
- [`Manual de identidad`](https://atomchat.io/manualdemarcapartners/).

Este proyecto usa **Firestore** como base de datos NoSQL. Los datos se organizan en dos colecciones principales:

### 1.1. Documentación (para el revisor)

Si tienes poco tiempo, te recomiendo este orden:

1. `docs/technical_decisions.md` → visión general y decisiones clave.
2. `docs/data_model.ts` → modelo de datos y relaciones principales.
3. `README.md` (esta página) → cómo ejecutar la demo paso a paso.

Documentos disponibles:

- [`docs/technical_assessment.md`](docs/technical_assessment.md): enunciado oficial de la prueba.
- [`docs/data_model.md`](docs/data_model.md): modelo de datos (ER + explicación tabla por tabla).
- [`docs/technical_decisions.md`](docs/technical_decisions.md): decisiones técnicas y tradeoffs.
- [`docs/future_work.md`](docs/future_work.md): Mejoras ante el diseño propuesto.
- [`docs/design_doc.md`](docs/design_doc.md): diseño detallado y archivo base que guió el desarrollo del MVP.

## 2. Cómo levantar el proyecto (desarrollo)

### 3.1 Opción A — Docker (recomendada para el revisor)

Requisitos:

- Docker Desktop (o Docker Engine + Docker Compose).

Comando:

```bash
docker compose up --build
```

Servicios:

```bash
Frontend: http://localhost:4173

Backend API: http://localhost:4000/api

Health: http://localhost:4000/health
```

Notas:

El frontend corre en Nginx y hace proxy de /api/\* hacia el backend.

El emulador de Firestore corre dentro de la red de Docker; no expone puertos al host (no es necesario abrir la UI del emulador para probar la app).

### 3.2 Opción B — Desarrollo local sin Docker

Requisitos:

Node.js: ≥ 20

npm

Java 21 (requerido por Firebase emulators).
Recomendado: Eclipse Temurin (OpenJDK) instalado como JDK por defecto.

Firebase CLI (global o via npx).

```bash
npm install -g firebase-tools
```

o

```bash
npx firebase-tools --version
```

Ambas opciones son válidas para los pasos siguientes.

#### 3.2.1 Instalar dependencias

Desde la raíz del monorepo:

```bash
npm install
```

#### 3.2.2 Variables de entorno para backend

Valores recomendados para desarrollo:

```bash
export PORT=4000
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
export JWT_SECRET=dev-secret
export ALLOW_INSECURE_HEADER_AUTH=true
```

#### 3.2.3 Levantar Firestore emulator

El repo incluye configuración en back/firebase.json (Firestore en puerto 8080).

Opción A — usando npx (sin instalar nada global):

```bash
npx firebase-tools --config back/firebase.json --project demo-project emulators:start --only firestore
```

Opción B — usando Firebase CLI global:

```bash
npm install -g firebase-tools
firebase --config back/firebase.json --project demo-project emulators:start --only firestore
```

#### 3.2.4 Levantar backend en modo dev

En otra terminal (desde la raíz):

```bash
export FIREBASE_PROJECT_ID=demo-project
export GCLOUD_PROJECT=demo-project
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run dev:back
```

API base: http://localhost:4000/api

Health: http://localhost:4000/health

### 3.2.5 Levantar frontend en modo dev

En otra terminal (desde la raíz):

```bash
npm run dev:front
```

Frontend: http://localhost:4200

3.2.6 Conectar front ↔ back en dev local

El frontend llama a rutas relativas (/api/tasks, /api/auth/...).
En Docker, Nginx hace el proxy. Con ng serve, necesitas un proxy config.

## 4. Overview del sistema

Pantalla de login en desktop: layout dividido, logo de Atom y formulario con email + botón de continuar.

![Pantalla inicial](./docs/screens/login-desktop.png)

Estado de error visible si se agrega un email incorrecto.

![Pantalla inicial con error ](./docs/screens/login-desktop-error.png)

Versión móvil del login: fondo en color principal, logo centrado y formulario a ancho completo.

![Pantalla inicial mobile ](./docs/screens/login-mobile.png)

Si el usuario con el que queremos ingresar no existe, el sistema nos avisa y nos solicita crearlo

![Pantalla inicial mobile ](./docs/screens/login-failed-create-user.png)

Página principal de tareas en desktop:

- Menú lateral con opciones (lista, crear).
- Lista de tareas con columnas: título, descripción, fecha, estado (checkbox).
- Botones de editar / eliminar.

![Pantalla inicial mobile ](./docs/screens/task-dashboard.png)

Página principal de tareas en movil:

- Menú accesible vía botón hamburguesa.
- Lista responsive con scroll.
- Acciones alineadas para uso táctil.

![Pantalla inicial mobile ](./docs/screens/task-dashboard-mobile.png)

Formulario de creacion de tarea con validaciones y accesibilidad.

![Pantalla inicial mobile ](./docs/screens/task-creation.png)

Formulario de edicion de tarea con validaciones y accesibilidad.

![Pantalla inicial mobile ](./docs/screens/task-edition-mobile.png)
